const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { signToken, authRequired, asRequestUser } = require('../middleware/auth');
const { sendResetEmail } = require('../services/mail');
const config = require('../config');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(6).max(100),
});

const loginSchema = z.object({
  email: z.string().email().transform((e) => e.toLowerCase()),
  password: z.string().min(1),
});

router.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    if (!isMongoReady()) {
      if (memory.findUserByEmail(body.email)) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      const role = body.email === config.adminEmail ? 'admin' : 'user';
      const passwordHash = await bcrypt.hash(body.password, 10);
      const user = memory.createUser({ name: body.name, email: body.email, passwordHash, role });
      const token = signToken(user);
      return res.status(201).json({ token, user: memory.publicUser(user), mode: 'memory' });
    }

    const exists = await User.findOne({ email: body.email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const role = body.email === config.adminEmail ? 'admin' : 'user';
    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await User.create({
      name: body.name,
      email: body.email,
      passwordHash,
      role,
    });

    await Notification.create({
      user: user._id,
      title: 'Welcome to TripGenie AI',
      body: 'Set your travel preferences to get personalised destination recommendations.',
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    if (!isMongoReady()) {
      const user = memory.findUserByEmail(body.email);
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });
      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) return res.status(401).json({ message: 'Invalid email or password' });
      const token = signToken(user);
      return res.json({ token, user: memory.publicUser(user), mode: 'memory' });
    }

    const user = await User.findOne({ email: body.email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    res.json({ token, user: user.toPublic() });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    if (!email.includes('@')) return res.status(400).json({ message: 'Enter a valid email' });

    if (!isMongoReady()) {
      const user = memory.findUserByEmail(email);
      if (!user) return res.json({ message: 'If an account exists, a reset link has been sent.' });
      const token = crypto.randomBytes(32).toString('hex');
      user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      const mail = await sendResetEmail(user.email, token);
      const payload = { message: 'If an account exists, a reset link has been sent.', demo: true, resetToken: token };
      if (mail.link) payload.resetLink = mail.link;
      return res.json(payload);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const mail = await sendResetEmail(user.email, token);
    const payload = { message: 'If an account exists, a reset link has been sent.' };
    if (mail.demo) {
      payload.demo = true;
      payload.resetToken = token;
      payload.resetLink = mail.link;
    }
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const email = String(req.body.email || '')
      .trim()
      .toLowerCase();
    const token = String(req.body.token || '');
    const password = String(req.body.password || '');
    if (!email || !token || password.length < 6) {
      return res.status(400).json({ message: 'Email, token and a password (min 6 chars) are required' });
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');

    if (!isMongoReady()) {
      const user = memory.findUserByEmail(email);
      if (!user || user.resetTokenHash !== hash || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }
      user.passwordHash = await bcrypt.hash(password, 10);
      user.resetTokenHash = null;
      user.resetTokenExpires = null;
      return res.json({ message: 'Password updated. You can log in now.' });
    }

    const user = await User.findOne({
      email,
      resetTokenHash: hash,
      resetTokenExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: 'Password updated. You can log in now.' });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authRequired, async (req, res) => {
  const user = req.user.toPublic ? req.user.toPublic() : memory.publicUser(req.user);
  res.json({ user });
});

module.exports = router;

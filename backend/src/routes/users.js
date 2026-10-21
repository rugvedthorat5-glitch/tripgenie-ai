const express = require('express');
const { z } = require('zod');
const { authRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();

const prefsSchema = z.object({
  interests: z.array(z.string()).default([]),
  travelStyle: z.enum(['Budget', 'Comfort', 'Luxury']),
  companions: z.enum(['Solo', 'Couple', 'Family', 'Friends']),
  climate: z.enum(['Any', 'Warm', 'Cool', 'Snow']),
});

router.put('/preferences', authRequired, async (req, res, next) => {
  try {
    const prefs = prefsSchema.parse(req.body);
    req.user.preferences = prefs;
    if (isMongoReady()) await req.user.save();
    const user = req.user.toPublic ? req.user.toPublic() : memory.publicUser(req.user);
    res.json({ preferences: prefs, user });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid preferences' });
    next(err);
  }
});

router.put('/profile', authRequired, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (name.length >= 2) req.user.name = name;
    if (req.body.avatar !== undefined) req.user.avatar = req.body.avatar || null;
    if (isMongoReady()) await req.user.save();
    const user = req.user.toPublic ? req.user.toPublic() : memory.publicUser(req.user);
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

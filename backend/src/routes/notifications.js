const express = require('express');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();
router.use(authRequired);

function uid(req) {
  return String(req.user._id || req.user.id);
}

function memClient(n) {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    date: n.createdAt,
    read: n.read,
  };
}

router.get('/', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const list = memory.db.notifications.filter((n) => n.userId === uid(req)).slice(0, 50);
      return res.json({
        notifications: list.map(memClient),
        unread: list.filter((n) => !n.read).length,
      });
    }
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({
      notifications: list.map((n) => n.toClient()),
      unread: list.filter((n) => !n.read).length,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const title = String(req.body.title || '').trim();
    const body = String(req.body.body || '').trim();
    if (!title || !body) return res.status(400).json({ message: 'title and body required' });

    if (!isMongoReady()) {
      const n = {
        id: memory.nid(),
        userId: uid(req),
        title,
        body,
        read: false,
        createdAt: new Date().toISOString(),
      };
      memory.db.notifications.unshift(n);
      return res.status(201).json({ notification: memClient(n) });
    }

    const n = await Notification.create({ user: req.user._id, title, body });
    res.status(201).json({ notification: n.toClient() });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const n = memory.db.notifications.find((x) => x.id === req.params.id && x.userId === uid(req));
      if (!n) return res.status(404).json({ message: 'Notification not found' });
      n.read = true;
      return res.json({ notification: memClient(n) });
    }
    const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    n.read = true;
    await n.save();
    res.json({ notification: n.toClient() });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      memory.db.notifications.forEach((n) => {
        if (n.userId === uid(req)) n.read = true;
      });
      const list = memory.db.notifications.filter((n) => n.userId === uid(req)).slice(0, 50);
      return res.json({ notifications: list.map(memClient), unread: 0 });
    }
    await Notification.updateMany({ user: req.user._id, read: false }, { $set: { read: true } });
    const list = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications: list.map((n) => n.toClient()), unread: 0 });
  } catch (err) {
    next(err);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      memory.db.notifications = memory.db.notifications.filter((n) => n.userId !== uid(req));
      return res.json({ notifications: [], unread: 0 });
    }
    await Notification.deleteMany({ user: req.user._id });
    res.json({ notifications: [], unread: 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

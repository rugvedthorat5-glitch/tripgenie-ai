const express = require('express');
const Favorite = require('../models/Favorite');
const { authRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();
router.use(authRequired);

function uid(req) {
  return String(req.user._id || req.user.id);
}

router.get('/', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      return res.json({
        favorites: memory.db.favorites.filter((f) => f.userId === uid(req)).map((f) => f.destinationId),
      });
    }
    const favs = await Favorite.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ favorites: favs.map((f) => f.destinationId) });
  } catch (err) {
    next(err);
  }
});

router.post('/:destinationId', async (req, res, next) => {
  try {
    const destinationId = req.params.destinationId;
    if (!isMongoReady()) {
      if (!memory.db.favorites.some((f) => f.userId === uid(req) && f.destinationId === destinationId)) {
        memory.db.favorites.push({ userId: uid(req), destinationId });
      }
      return res.json({
        favorites: memory.db.favorites.filter((f) => f.userId === uid(req)).map((f) => f.destinationId),
      });
    }
    await Favorite.findOneAndUpdate(
      { user: req.user._id, destinationId },
      { $setOnInsert: { user: req.user._id, destinationId } },
      { upsert: true, new: true }
    );
    const favs = await Favorite.find({ user: req.user._id });
    res.json({ favorites: favs.map((f) => f.destinationId) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:destinationId', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      memory.db.favorites = memory.db.favorites.filter(
        (f) => !(f.userId === uid(req) && f.destinationId === req.params.destinationId)
      );
      return res.json({
        favorites: memory.db.favorites.filter((f) => f.userId === uid(req)).map((f) => f.destinationId),
      });
    }
    await Favorite.deleteOne({ user: req.user._id, destinationId: req.params.destinationId });
    const favs = await Favorite.find({ user: req.user._id });
    res.json({ favorites: favs.map((f) => f.destinationId) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

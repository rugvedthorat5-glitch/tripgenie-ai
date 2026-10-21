const express = require('express');
const Review = require('../models/Review');
const { authRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();

router.get('/:destinationId', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const list = memory.db.reviews
        .filter((r) => r.destinationId === req.params.destinationId)
        .slice(0, 50)
        .map((r) => ({
          id: r.id,
          destId: r.destinationId,
          author: r.author,
          rating: r.rating,
          text: r.text,
          date: r.createdAt,
        }));
      return res.json({ reviews: list });
    }
    const list = await Review.find({ destinationId: req.params.destinationId }).sort({ createdAt: -1 }).limit(50);
    res.json({ reviews: list.map((r) => r.toClient()) });
  } catch (err) {
    next(err);
  }
});

router.post('/:destinationId', authRequired, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const text = String(req.body.text || '').trim();
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1–5' });
    if (text.length < 2) return res.status(400).json({ message: 'Review text required' });

    if (!isMongoReady()) {
      const review = {
        id: memory.nid(),
        userId: String(req.user._id || req.user.id),
        destinationId: req.params.destinationId,
        author: req.user.name,
        rating,
        text,
        createdAt: new Date().toISOString(),
      };
      memory.db.reviews.unshift(review);
      return res.status(201).json({
        review: {
          id: review.id,
          destId: review.destinationId,
          author: review.author,
          rating: review.rating,
          text: review.text,
          date: review.createdAt,
        },
      });
    }

    const review = await Review.create({
      user: req.user._id,
      destinationId: req.params.destinationId,
      author: req.user.name,
      rating,
      text,
    });
    res.status(201).json({ review: review.toClient() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

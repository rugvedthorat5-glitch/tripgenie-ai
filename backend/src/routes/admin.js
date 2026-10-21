const express = require('express');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Trip = require('../models/Trip');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');
const { authRequired, adminRequired } = require('../middleware/auth');
const config = require('../config');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();
router.use(authRequired, adminRequired);

router.get('/stats', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      return res.json({
        adminName: config.adminName,
        adminEmail: req.user.email,
        mode: 'memory',
        stats: {
          users: memory.db.users.length,
          destinations: memory.db.destinations.filter((d) => !d.hidden).length,
          hidden: memory.db.destinations.filter((d) => d.hidden).length,
          trips: memory.db.trips.length,
          reviews: memory.db.reviews.length,
          favorites: memory.db.favorites.length,
        },
      });
    }

    const [users, destinations, hidden, trips, reviews, favorites] = await Promise.all([
      User.countDocuments(),
      Destination.countDocuments({ hidden: false }),
      Destination.countDocuments({ hidden: true }),
      Trip.countDocuments(),
      Review.countDocuments(),
      Favorite.countDocuments(),
    ]);

    res.json({
      adminName: config.adminName,
      adminEmail: req.user.email,
      stats: { users, destinations, hidden, trips, reviews, favorites },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

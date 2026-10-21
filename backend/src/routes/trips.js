const express = require('express');
const Trip = require('../models/Trip');
const Notification = require('../models/Notification');
const { authRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();
router.use(authRequired);

function userId(req) {
  return String(req.user._id || req.user.id);
}

router.get('/', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const trips = memory.db.trips.filter((t) => t.userId === userId(req)).map(memory.tripToClient);
      return res.json({ trips });
    }
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ trips: trips.map((t) => t.toClient()) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const trip = memory.db.trips.find((t) => t.id === req.params.id && t.userId === userId(req));
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      return res.json({ trip: memory.tripToClient(trip) });
    }
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ trip: trip.toClient() });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {};

    if (!isMongoReady()) {
      const trip = {
        id: memory.nid(),
        userId: userId(req),
        destinationId: body.destinationId,
        destinationName: body.destinationName,
        startLocation: body.startLocation || '',
        startDate: body.startDate || null,
        endDate: body.endDate || null,
        emoji: body.emoji || '🧳',
        colors: body.colors || ['#14B8C4', '#0E7C86'],
        days: body.days,
        travelers: body.travelers,
        budget: body.budget,
        style: body.style || 'Comfort',
        interests: body.interests || [],
        summary: body.summary || '',
        itinerary: body.itinerary || [],
        breakdown: body.breakdown || {},
        tips: body.tips || [],
        mapUrl: body.mapUrl || '',
        routeUrl: body.routeUrl || '',
        source: body.source || 'manual',
        saved: body.saved !== false,
        status: body.status || 'upcoming',
        packingChecks: body.packingChecks || [],
        createdAt: new Date().toISOString(),
      };
      memory.db.trips.unshift(trip);
      memory.db.notifications.unshift({
        id: memory.nid(),
        userId: userId(req),
        title: 'Trip saved',
        body: `${trip.destinationName} itinerary is saved to My Trips.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
      return res.status(201).json({ trip: memory.tripToClient(trip) });
    }

    const trip = await Trip.create({
      user: req.user._id,
      destinationId: body.destinationId,
      destinationName: body.destinationName,
      startLocation: body.startLocation || '',
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      emoji: body.emoji || '🧳',
      colors: body.colors || ['#14B8C4', '#0E7C86'],
      days: body.days,
      travelers: body.travelers,
      budget: body.budget,
      style: body.style || 'Comfort',
      interests: body.interests || [],
      summary: body.summary || '',
      itinerary: body.itinerary || [],
      breakdown: body.breakdown || {},
      tips: body.tips || [],
      mapUrl: body.mapUrl || '',
      routeUrl: body.routeUrl || '',
      source: body.source || 'manual',
      saved: body.saved !== false,
      status: body.status || 'upcoming',
      packingChecks: body.packingChecks || [],
    });

    await Notification.create({
      user: req.user._id,
      title: 'Trip saved',
      body: `${trip.destinationName} itinerary is saved to My Trips.`,
    });

    res.status(201).json({ trip: trip.toClient() });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const trip = memory.db.trips.find((t) => t.id === req.params.id && t.userId === userId(req));
      if (!trip) return res.status(404).json({ message: 'Trip not found' });
      Object.assign(trip, req.body || {});
      return res.json({ trip: memory.tripToClient(trip) });
    }

    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const fields = [
      'destinationId',
      'destinationName',
      'startLocation',
      'startDate',
      'endDate',
      'emoji',
      'colors',
      'days',
      'travelers',
      'budget',
      'style',
      'interests',
      'summary',
      'itinerary',
      'breakdown',
      'tips',
      'mapUrl',
      'routeUrl',
      'saved',
      'status',
      'packingChecks',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) trip[f] = req.body[f];
    }
    await trip.save();
    res.json({ trip: trip.toClient() });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const before = memory.db.trips.length;
      memory.db.trips = memory.db.trips.filter((t) => !(t.id === req.params.id && t.userId === userId(req)));
      if (memory.db.trips.length === before) return res.status(404).json({ message: 'Trip not found' });
      return res.json({ message: 'Trip deleted' });
    }
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

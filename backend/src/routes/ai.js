const express = require('express');
const { z } = require('zod');
const Destination = require('../models/Destination');
const { authRequired } = require('../middleware/auth');
const { generateAiPlan, generateAiChat } = require('../services/gemini');
const { buildPlan } = require('../services/fallbackPlanner');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();

const planSchema = z.object({
  destinationId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(21),
  travelers: z.coerce.number().int().min(1).max(20),
  budget: z.coerce.number().min(1000),
  style: z.enum(['Budget', 'Comfort', 'Luxury']).default('Comfort'),
  interests: z.array(z.string()).default([]),
  startLocation: z.string().optional().default(''),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

async function resolveDest(destinationId) {
  if (!isMongoReady()) {
    const d = memory.db.destinations.find((x) => x.slug === destinationId || x.id === destinationId);
    if (!d || d.hidden) return null;
    return {
      slug: d.slug,
      id: d.slug,
      name: d.name,
      region: d.region,
      lat: d.lat,
      lon: d.lon,
      emoji: d.emoji,
      colors: d.colors,
      avgDailyCost: d.avgDailyCost,
      highlights: d.highlights,
      bestSeason: d.bestSeason,
    };
  }

  const destDoc =
    (await Destination.findOne({ slug: destinationId, hidden: false })) ||
    (await Destination.findById(destinationId).catch(() => null));
  if (!destDoc) return null;
  return {
    slug: destDoc.slug,
    id: destDoc.slug,
    name: destDoc.name,
    region: destDoc.region,
    lat: destDoc.lat,
    lon: destDoc.lon,
    emoji: destDoc.emoji,
    colors: destDoc.colors,
    avgDailyCost: destDoc.avgDailyCost,
    highlights: destDoc.highlights,
    bestSeason: destDoc.bestSeason,
  };
}

router.post('/plan', authRequired, async (req, res, next) => {
  try {
    const body = planSchema.parse(req.body);
    const dest = await resolveDest(body.destinationId);
    if (!dest) return res.status(400).json({ message: 'Unknown destination' });

    let trip;
    try {
      trip = await generateAiPlan(body, dest);
    } catch {
      trip = buildPlan(body, [dest]);
    }

    res.json({ trip, source: trip.source });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid plan request' });
    next(err);
  }
});

router.post('/chat', authRequired, async (req, res, next) => {
  try {
    const message = String(req.body.message || req.body.text || '').trim();
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const reply = await generateAiChat({
      message,
      history: req.body.history || [],
      prefs: req.user.preferences,
      tripContext: req.body.tripContext || null,
    });

    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

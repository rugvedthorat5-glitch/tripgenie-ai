const express = require('express');
const { z } = require('zod');
const Destination = require('../models/Destination');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');
const { buildPlan } = require('../services/fallbackPlanner');

const router = express.Router();

const schema = z.object({
  destinationId: z.string().min(1),
  days: z.coerce.number().int().min(1).max(21),
  travelers: z.coerce.number().int().min(1).max(20),
  style: z.enum(['Budget', 'Comfort', 'Luxury']).default('Comfort'),
  userBudget: z.coerce.number().optional(),
});

async function resolveDest(destinationId) {
  if (!isMongoReady()) {
    return memory.db.destinations.find((d) => d.slug === destinationId && !d.hidden) || null;
  }
  return (
    (await Destination.findOne({ slug: destinationId, hidden: false })) ||
    (await Destination.findById(destinationId).catch(() => null))
  );
}

router.post('/estimate', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);
    const destDoc = await resolveDest(body.destinationId);
    if (!destDoc) return res.status(400).json({ message: 'Unknown destination' });

    const dest = {
      slug: destDoc.slug || body.destinationId,
      id: destDoc.slug || body.destinationId,
      name: destDoc.name,
      region: destDoc.region,
      lat: destDoc.lat,
      lon: destDoc.lon,
      emoji: destDoc.emoji,
      colors: destDoc.colors,
      avgDailyCost: destDoc.avgDailyCost,
      highlights: destDoc.highlights || [],
      bestSeason: destDoc.bestSeason,
    };

    const plan = buildPlan(
      {
        destinationId: dest.slug,
        days: body.days,
        travelers: body.travelers,
        budget: body.userBudget || 999999999,
        style: body.style,
        interests: [],
        startLocation: '',
      },
      [dest]
    );

    const total = Object.values(plan.breakdown).reduce((a, b) => a + b, 0);
    const perPerson = Math.round(total / Math.max(1, body.travelers));
    const tips = [...plan.tips];
    if (body.userBudget && total > body.userBudget) {
      tips.unshift('Estimated total exceeds your budget — try Budget style, fewer days, or a cheaper destination.');
    }

    res.json({
      estimate: true,
      disclaimer: 'All prices are estimates and may vary by season and availability.',
      destinationId: dest.slug,
      destinationName: dest.name,
      days: body.days,
      travelers: body.travelers,
      style: body.style,
      userBudget: body.userBudget || null,
      breakdown: plan.breakdown,
      total,
      perPerson,
      perPersonPerDay: Math.round(total / Math.max(1, body.days * body.travelers)),
      withinBudget: body.userBudget ? total <= body.userBudget : null,
      tips,
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    next(err);
  }
});

module.exports = router;

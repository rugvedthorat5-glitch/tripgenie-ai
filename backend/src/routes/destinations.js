const express = require('express');
const { z } = require('zod');
const Destination = require('../models/Destination');
const { authRequired, adminRequired } = require('../middleware/auth');
const { isMongoReady } = require('../db');
const memory = require('../store/memory');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    // ?all=1 returns hidden items only for authenticated admins
    let includeHidden = false;
    if (req.query.all === '1') {
      const header = req.headers.authorization || '';
      const token = header.startsWith('Bearer ') ? header.slice(7) : null;
      if (token) {
        try {
          const jwt = require('jsonwebtoken');
          const config = require('../config');
          const payload = jwt.verify(token, config.jwtSecret);
          if (payload.role === 'admin') includeHidden = true;
        } catch {
          includeHidden = false;
        }
      }
    }

    if (!isMongoReady()) {
      const list = memory.db.destinations.filter((d) => includeHidden || !d.hidden);
      return res.json({ destinations: list.map((d) => d.toClient()) });
    }
    const q = includeHidden ? {} : { hidden: false };
    const list = await Destination.find(q).sort({ name: 1 });
    res.json({ destinations: list.map((d) => d.toClient()) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const d = memory.db.destinations.find((x) => x.slug === req.params.id || x._id === req.params.id);
      if (!d || d.hidden) return res.status(404).json({ message: 'Destination not found' });
      return res.json({ destination: d.toClient() });
    }
    const d =
      (await Destination.findOne({ slug: req.params.id })) ||
      (await Destination.findById(req.params.id).catch(() => null));
    if (!d || d.hidden) return res.status(404).json({ message: 'Destination not found' });
    res.json({ destination: d.toClient() });
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  name: z.string().min(2),
  region: z.string().min(2),
  country: z.string().default('India'),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  emoji: z.string().default('📍'),
  imageUrl: z.string().optional(),
  colors: z.array(z.string()).min(2).max(2).optional(),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).min(1),
  bestSeason: z.string().optional(),
  avgDailyCost: z.number().min(500),
  description: z.string().min(10),
  highlights: z.array(z.string()).min(1),
  climate: z.enum(['Warm', 'Cool', 'Snow']).default('Warm'),
  slug: z.string().optional(),
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        Date.now().toString(36);

    if (!isMongoReady()) {
      if (memory.db.destinations.some((d) => d.slug === slug)) {
        return res.status(409).json({ message: 'Destination slug already exists' });
      }
      const d = {
        ...body,
        slug,
        colors: body.colors || ['#14B8C4', '#0E7C86'],
        rating: body.rating || 4,
        bestSeason: body.bestSeason || 'Year-round',
        hidden: false,
        _id: slug,
        toClient() {
          return {
            id: this.slug,
            _id: this._id,
            name: this.name,
            region: this.region,
            country: this.country,
            lat: this.lat,
            lon: this.lon,
            imageUrl: this.imageUrl || '',
            emoji: this.emoji,
            colors: this.colors,
            rating: this.rating,
            tags: this.tags,
            bestSeason: this.bestSeason,
            avgDailyCost: this.avgDailyCost,
            description: this.description,
            highlights: this.highlights,
            climate: this.climate,
            hidden: this.hidden,
          };
        },
      };
      memory.db.destinations.push(d);
      return res.status(201).json({ destination: d.toClient() });
    }

    const exists = await Destination.findOne({ slug });
    if (exists) return res.status(409).json({ message: 'Destination slug already exists' });

    const d = await Destination.create({
      ...body,
      slug,
      colors: body.colors || ['#14B8C4', '#0E7C86'],
      createdBy: req.user._id,
    });
    res.status(201).json({ destination: d.toClient() });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    next(err);
  }
});

router.put('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const d = memory.db.destinations.find((x) => x.slug === req.params.id || x._id === req.params.id);
      if (!d) return res.status(404).json({ message: 'Destination not found' });
      Object.assign(d, req.body || {});
      return res.json({ destination: d.toClient() });
    }
    const d =
      (await Destination.findOne({ slug: req.params.id })) ||
      (await Destination.findById(req.params.id).catch(() => null));
    if (!d) return res.status(404).json({ message: 'Destination not found' });

    const fields = [
      'name',
      'region',
      'country',
      'lat',
      'lon',
      'emoji',
      'imageUrl',
      'colors',
      'rating',
      'tags',
      'bestSeason',
      'avgDailyCost',
      'description',
      'highlights',
      'climate',
      'hidden',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) d[f] = req.body[f];
    }
    await d.save();
    res.json({ destination: d.toClient() });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/visibility', authRequired, adminRequired, async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const d = memory.db.destinations.find((x) => x.slug === req.params.id || x._id === req.params.id);
      if (!d) return res.status(404).json({ message: 'Destination not found' });
      d.hidden = Boolean(req.body.hidden);
      return res.json({ destination: d.toClient() });
    }
    const d =
      (await Destination.findOne({ slug: req.params.id })) ||
      (await Destination.findById(req.params.id).catch(() => null));
    if (!d) return res.status(404).json({ message: 'Destination not found' });
    d.hidden = Boolean(req.body.hidden);
    await d.save();
    res.json({ destination: d.toClient() });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    if (!isMongoReady()) {
      const d = memory.db.destinations.find((x) => x.slug === req.params.id || x._id === req.params.id);
      if (!d) return res.status(404).json({ message: 'Destination not found' });
      d.hidden = true;
      return res.json({ message: 'Destination hidden', destination: d.toClient() });
    }
    const d =
      (await Destination.findOne({ slug: req.params.id })) ||
      (await Destination.findById(req.params.id).catch(() => null));
    if (!d) return res.status(404).json({ message: 'Destination not found' });
    d.hidden = true;
    await d.save();
    res.json({ message: 'Destination hidden', destination: d.toClient() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

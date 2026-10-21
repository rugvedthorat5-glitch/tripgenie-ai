const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/error');
const User = require('./models/User');
const Destination = require('./models/Destination');
const seedDestinations = require('./data/seedDestinations');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const destinationRoutes = require('./routes/destinations');
const tripRoutes = require('./routes/trips');
const aiRoutes = require('./routes/ai');
const favoriteRoutes = require('./routes/favorites');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const budgetRoutes = require('./routes/budget');

async function ensureSeed() {
  const count = await Destination.countDocuments();
  if (count === 0) {
    await Destination.insertMany(seedDestinations);
    console.log(`Seeded ${seedDestinations.length} destinations`);
  }

  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  await User.findOneAndUpdate(
    { email: config.adminEmail },
    {
      $set: {
        name: config.adminName,
        email: config.adminEmail,
        passwordHash,
        role: 'admin',
      },
      $setOnInsert: {
        preferences: {
          interests: ['Culture', 'Nature', 'Food'],
          travelStyle: 'Comfort',
          companions: 'Friends',
          climate: 'Any',
        },
      },
    },
    { upsert: true }
  );
}

async function start() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(
    cors({
      origin: config.frontendOrigin === '*' ? true : config.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(morgan('dev'));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get('/', (req, res) => {
    res.json({
      name: 'TripGenie AI API',
      admin: config.adminName,
      docs: '/api/health',
    });
  });

  app.get('/api/health', (req, res) => {
    const mongoOk = mongoose.connection.readyState === 1;
    res.json({
      ok: true,
      service: 'tripgenie-ai-backend',
      mongo: mongoOk ? 'connected' : 'disconnected',
      storage: mongoOk ? 'mongodb' : 'memory',
      gemini: Boolean(config.geminiApiKey),
      admin: config.adminName,
      time: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/destinations', destinationRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/budget', budgetRoutes);

  app.use(notFound);
  app.use(errorHandler);

  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
    await ensureSeed();
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Using in-memory storage so register/login/trips still work for demos.');
    console.error('Set MONGODB_URI in backend/.env for persistent MongoDB Atlas data.');
    const { ensureAdmin } = require('./store/memory');
    await ensureAdmin();
  }

  app.listen(config.port, '0.0.0.0', () => {
    const mongoOk = mongoose.connection.readyState === 1;
    console.log(`TripGenie AI API listening on http://0.0.0.0:${config.port}`);
    console.log(`Storage: ${mongoOk ? 'MongoDB' : 'in-memory (demo)'}`);
    console.log(`Admin: ${config.adminName} <${config.adminEmail}>`);
    console.log(`Gemini: ${config.geminiApiKey ? 'configured' : 'not set (rule-based fallback)'}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

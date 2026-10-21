require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const seedDestinations = require('../data/seedDestinations');

async function seed() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');

  for (const d of seedDestinations) {
    await Destination.findOneAndUpdate({ slug: d.slug }, { $set: d }, { upsert: true, new: true });
  }
  console.log(`Seeded ${seedDestinations.length} destinations`);

  const adminHash = await bcrypt.hash(config.adminPassword, 10);
  const admin = await User.findOneAndUpdate(
    { email: config.adminEmail },
    {
      $set: {
        name: config.adminName,
        email: config.adminEmail,
        passwordHash: adminHash,
        role: 'admin',
        preferences: {
          interests: ['Culture', 'Nature', 'Food', 'History'],
          travelStyle: 'Comfort',
          companions: 'Friends',
          climate: 'Any',
        },
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${admin.email} (${admin.name})`);

  const demoHash = await bcrypt.hash('Demo@12345', 10);
  const demo = await User.findOneAndUpdate(
    { email: 'demo@tripgenie.com' },
    {
      $set: {
        name: 'Demo Traveller',
        email: 'demo@tripgenie.com',
        passwordHash: demoHash,
        role: 'user',
        preferences: {
          interests: ['Beaches', 'Food', 'Adventure'],
          travelStyle: 'Comfort',
          companions: 'Friends',
          climate: 'Warm',
        },
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Demo user ready: ${demo.email} / Demo@12345`);

  const reviewCount = await Review.countDocuments();
  if (reviewCount === 0) {
    await Review.insertMany([
      {
        user: demo._id,
        destinationId: 'goa',
        author: 'Demo Traveller',
        rating: 5,
        text: 'Perfect beach holiday — Baga for fun, South Goa for quiet evenings.',
      },
      {
        user: demo._id,
        destinationId: 'jaipur',
        author: 'Demo Traveller',
        rating: 4,
        text: 'Amber Fort and the bazaars are must-dos. Great for culture and shopping.',
      },
      {
        user: admin._id,
        destinationId: 'kerala',
        author: config.adminName,
        rating: 5,
        text: 'Houseboat stay was unforgettable. Best season Sep–Mar.',
      },
    ]);
    console.log('Seeded sample reviews');
  }

  const notifCount = await Notification.countDocuments({ user: demo._id });
  if (notifCount === 0) {
    await Notification.insertMany([
      {
        user: demo._id,
        title: 'Welcome to TripGenie AI',
        body: 'Try the AI Trip Planner with Goa for a quick demo itinerary.',
      },
      {
        user: demo._id,
        title: 'Tip from Atlas',
        body: 'Set preferences to get better Home recommendations.',
      },
    ]);
    console.log('Seeded demo notifications');
  }

  await mongoose.disconnect();
  console.log('Done');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

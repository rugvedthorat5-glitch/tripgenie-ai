/**
 * In-memory data store used when MongoDB is unavailable.
 * Persists only for the lifetime of the Node process — ideal for local demos.
 */
const bcrypt = require('bcryptjs');
const config = require('../config');
const seedDestinations = require('../data/seedDestinations');

let seq = 1;
const nid = () => `mem_${Date.now().toString(36)}_${seq++}`;

const db = {
  users: [],
  trips: [],
  favorites: [],
  notifications: [],
  reviews: [],
  destinations: seedDestinations.map((d) => ({
    ...d,
    _id: d.slug,
    hidden: false,
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
  })),
};

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar || null,
    preferences: u.preferences,
  };
}

async function ensureAdmin() {
  const email = config.adminEmail;
  if (db.users.some((u) => u.email === email)) return;
  const passwordHash = await bcrypt.hash(config.adminPassword, 10);
  db.users.push({
    id: 'admin_mem',
    name: config.adminName,
    email,
    passwordHash,
    role: 'admin',
    avatar: null,
    preferences: {
      interests: ['Culture', 'Nature', 'Food'],
      travelStyle: 'Comfort',
      companions: 'Friends',
      climate: 'Any',
    },
    resetTokenHash: null,
    resetTokenExpires: null,
  });
  console.log(`[memory] Admin ready: ${email}`);
}

function findUserByEmail(email) {
  return db.users.find((u) => u.email === String(email).toLowerCase());
}

function findUserById(id) {
  return db.users.find((u) => u.id === id);
}

function createUser({ name, email, passwordHash, role }) {
  const user = {
    id: nid(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'user',
    avatar: null,
    preferences: {
      interests: ['Beaches', 'Food'],
      travelStyle: 'Comfort',
      companions: 'Friends',
      climate: 'Any',
    },
    resetTokenHash: null,
    resetTokenExpires: null,
  };
  db.users.push(user);
  db.notifications.unshift({
    id: nid(),
    userId: user.id,
    title: 'Welcome to TripGenie AI',
    body: 'Set your travel preferences to get personalised destination recommendations.',
    read: false,
    createdAt: new Date().toISOString(),
  });
  return user;
}

function tripToClient(t) {
  return {
    id: t.id,
    destinationId: t.destinationId,
    destinationName: t.destinationName,
    startLocation: t.startLocation || '',
    startDate: t.startDate || null,
    endDate: t.endDate || null,
    emoji: t.emoji,
    colors: t.colors,
    days: t.days,
    travelers: t.travelers,
    budget: t.budget,
    style: t.style,
    interests: t.interests || [],
    createdAt: t.createdAt,
    summary: t.summary,
    itinerary: t.itinerary,
    breakdown: t.breakdown,
    tips: t.tips,
    mapUrl: t.mapUrl || '',
    routeUrl: t.routeUrl || '',
    source: t.source || 'fallback',
    saved: t.saved !== false,
    status: t.status || 'upcoming',
    packingChecks: t.packingChecks || [],
  };
}

ensureAdmin().catch(console.error);

module.exports = {
  db,
  nid,
  publicUser,
  findUserByEmail,
  findUserById,
  createUser,
  tripToClient,
  ensureAdmin,
};

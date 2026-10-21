const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require('../config');
const User = require('../models/User');
const { isMongoReady } = require('../db');
const { findUserById, publicUser } = require('../store/memory');

function asRequestUser(user) {
  if (!user) return null;
  if (typeof user.toPublic === 'function') return user;
  return {
    ...user,
    _id: user.id,
    toPublic: () => publicUser(user),
    save: async function save() {
      return this;
    },
  };
}

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    if (token === 'demo-token') {
      req.user = {
        id: 'demo',
        _id: 'demo',
        name: 'Demo Traveller',
        email: 'demo@tripgenie.com',
        role: 'user',
        preferences: {
          interests: ['Culture', 'Nature', 'Food', 'Beaches'],
          travelStyle: 'Comfort',
          companions: 'Friends',
          climate: 'Any',
        },
        toPublic: () => ({
          id: 'demo',
          name: 'Demo Traveller',
          email: 'demo@tripgenie.com',
          role: 'user',
        }),
      };
      req.memoryUser = true;
      return next();
    }

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const sub = String(payload.sub || '');

    let user = null;
    if (isMongoReady()) {
      // Old memory-mode tokens (mem_…) are not valid Mongo ObjectIds — ask client to re-login.
      const validOid =
        mongoose.Types.ObjectId.isValid(sub) && new mongoose.Types.ObjectId(sub).toString() === sub;
      if (!validOid) {
        return res.status(401).json({
          message: 'Session expired. Please log in again.',
          code: 'STALE_TOKEN',
        });
      }
      try {
        user = await User.findById(sub);
      } catch {
        return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'STALE_TOKEN' });
      }
    } else {
      user = asRequestUser(findUserById(sub));
    }

    if (!user) {
      return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'STALE_TOKEN' });
    }

    req.user = user;
    req.memoryUser = !isMongoReady();
    next();
  } catch (err) {
    // Never leak CastError 500s to the client for bad tokens
    if (err?.name === 'CastError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.', code: 'STALE_TOKEN' });
    }
    next(err);
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
}

function signToken(user) {
  const id = user._id || user.id;
  return jwt.sign({ sub: String(id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

module.exports = { authRequired, adminRequired, signToken, asRequestUser };

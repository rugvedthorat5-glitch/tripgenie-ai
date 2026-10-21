const mongoose = require('mongoose');

const itineraryItemSchema = new mongoose.Schema(
  {
    time: String,
    title: String,
    detail: String,
    cost: { type: Number, default: 0 },
  },
  { _id: false }
);

const itineraryDaySchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    items: [itineraryItemSchema],
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    startLocation: { type: String, default: '' },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    emoji: { type: String, default: '🧳' },
    colors: { type: [String], default: ['#14B8C4', '#0E7C86'] },
    days: { type: Number, required: true },
    travelers: { type: Number, required: true },
    budget: { type: Number, required: true },
    style: { type: String, default: 'Comfort' },
    interests: { type: [String], default: [] },
    summary: { type: String, default: '' },
    itinerary: { type: [itineraryDaySchema], default: [] },
    breakdown: {
      stay: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      misc: { type: Number, default: 0 },
    },
    tips: { type: [String], default: [] },
    mapUrl: { type: String, default: '' },
    routeUrl: { type: String, default: '' },
    source: { type: String, enum: ['ai', 'fallback', 'manual'], default: 'fallback' },
    saved: { type: Boolean, default: true },
    status: { type: String, enum: ['upcoming', 'past', 'draft'], default: 'upcoming' },
    packingChecks: { type: [String], default: [] },
  },
  { timestamps: true }
);

tripSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    destinationId: this.destinationId,
    destinationName: this.destinationName,
    startLocation: this.startLocation,
    startDate: this.startDate,
    endDate: this.endDate,
    emoji: this.emoji,
    colors: this.colors,
    days: this.days,
    travelers: this.travelers,
    budget: this.budget,
    style: this.style,
    interests: this.interests,
    createdAt: this.createdAt?.toISOString?.() || new Date().toISOString(),
    summary: this.summary,
    itinerary: this.itinerary,
    breakdown: this.breakdown,
    tips: this.tips,
    mapUrl: this.mapUrl,
    routeUrl: this.routeUrl,
    source: this.source,
    saved: this.saved,
    status: this.status,
    packingChecks: this.packingChecks,
  };
};

module.exports = mongoose.model('Trip', tripSchema);

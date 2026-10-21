const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    country: { type: String, default: 'India' },
    lat: { type: Number, required: true },
    lon: { type: Number, required: true },
    emoji: { type: String, default: '📍' },
    imageUrl: { type: String, default: '' },
    colors: { type: [String], default: ['#14B8C4', '#0E7C86'] },
    rating: { type: Number, default: 4, min: 0, max: 5 },
    tags: { type: [String], default: [] },
    bestSeason: { type: String, default: 'Year-round' },
    avgDailyCost: { type: Number, required: true, min: 500 },
    description: { type: String, required: true },
    highlights: { type: [String], default: [] },
    climate: { type: String, enum: ['Warm', 'Cool', 'Snow'], default: 'Warm' },
    hidden: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

destinationSchema.methods.toClient = function toClient() {
  return {
    id: this.slug,
    _id: String(this._id),
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
};

module.exports = mongoose.model('Destination', destinationSchema);

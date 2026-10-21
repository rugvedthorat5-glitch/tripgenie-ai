const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destinationId: { type: String, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, destinationId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

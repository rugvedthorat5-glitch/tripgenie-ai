const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destinationId: { type: String, required: true, index: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

reviewSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    destId: this.destinationId,
    author: this.author,
    rating: this.rating,
    text: this.text,
    date: this.createdAt?.toISOString?.() || new Date().toISOString(),
  };
};

module.exports = mongoose.model('Review', reviewSchema);

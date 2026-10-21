const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.methods.toClient = function toClient() {
  return {
    id: String(this._id),
    title: this.title,
    body: this.body,
    date: this.createdAt?.toISOString?.() || new Date().toISOString(),
    read: this.read,
  };
};

module.exports = mongoose.model('Notification', notificationSchema);

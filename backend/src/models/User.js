const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema(
  {
    interests: { type: [String], default: ['Beaches', 'Food'] },
    travelStyle: { type: String, enum: ['Budget', 'Comfort', 'Luxury'], default: 'Comfort' },
    companions: { type: String, enum: ['Solo', 'Couple', 'Family', 'Friends'], default: 'Friends' },
    climate: { type: String, enum: ['Any', 'Warm', 'Cool', 'Snow'], default: 'Any' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: null },
    preferences: { type: preferencesSchema, default: () => ({}) },
    resetTokenHash: { type: String, default: null },
    resetTokenExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.methods.toPublic = function toPublic() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    preferences: this.preferences,
  };
};

module.exports = mongoose.model('User', userSchema);

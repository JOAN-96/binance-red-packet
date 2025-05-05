const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  walletBalance: { type: Number, default: 0 },
  videoWatchStatus: {
    video1: { type: Boolean, default: false },
    video2: { type: Boolean, default: false },
    video3: { type: Boolean, default: false }
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;

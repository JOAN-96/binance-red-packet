const mongoose = require('mongoose');
const { Transaction } = require('mongodb');

// User schema definition
const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  walletBalance: { type: Number, default: 0 },
  telegramUsername: { type: String, required: true },
  Transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ],
  videoWatchStatus: {
    video1: { type: Boolean, default: false },
    video2: { type: Boolean, default: false },
    video3: { type: Boolean, default: false }
  }
}, { timestamps: true }); // Add timestamps to the schema

// Define the User model
const User = mongoose.model.User || mongoose.model('User', userSchema);

module.exports = User;

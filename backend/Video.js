const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  url: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Video', videoSchema);

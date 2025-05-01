const Video = require('./Video');

// GET active videos (not expired)
exports.getActiveVideos = async (req, res) => {
  try {
    const now = new Date();
    const activeVideos = await Video.find({ expiresAt: { $gt: now } });
    res.json(activeVideos);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// POST create or update video link (admin feature)
exports.pushVideo = async (req, res) => {
  const { videoId, url } = req.body;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  try {
    const updated = await Video.findOneAndUpdate(
      { videoId },
      { url, expiresAt },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

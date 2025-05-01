const express = require('express');
const router = express.Router();
const videoController = require('./videocontrollers');

router.get('/get-active-videos', videoController.getActiveVideos);
router.post('/push-video', videoController.pushVideo);

module.exports = router;

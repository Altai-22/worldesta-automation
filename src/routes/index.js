const express = require('express');
const router = express.Router();

// Import route modules
const youtubeRoutes = require('./youtube');
const tiktokRoutes = require('./tiktok');
const videosRoutes = require('./videos');
const schedulesRoutes = require('./schedules');
const publicationRoutes = require('./publication');

// Mount routes
router.use('/youtube', youtubeRoutes);
router.use('/tiktok', tiktokRoutes);
router.use('/videos', videosRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/publication', publicationRoutes);

// Status endpoint
router.get('/status', (req, res) => {
  res.json({ status: 'Backend is running' });
});

module.exports = router;

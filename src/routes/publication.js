const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const axios = require('axios');

// Publish to YouTube
router.post('/youtube', async (req, res) => {
  try {
    const { schedule_id, video_url, title, description } = req.body;
    
    const token = await getAccessToken('youtube');
    if (!token) return res.status(401).json({ error: 'YouTube not authenticated' });

    const response = await axios.post(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet,status',
      {
        snippet: { title, description, categoryId: '24' },
        status: { privacyStatus: 'public' },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await pool.query(
      `INSERT INTO publications (schedule_id, platform, published_at, status) 
       VALUES ($1, $2, $3, $4)`,
      [schedule_id, 'youtube', new Date(), 'published']
    );

    logger.info(`Published to YouTube: ${response.data.id}`);
    res.json({ success: true, videoId: response.data.id });
  } catch (error) {
    logger.error('YouTube publication error:', error);
    res.status(500).json({ error: 'Publication failed' });
  }
});

// Publish to TikTok
router.post('/tiktok', async (req, res) => {
  try {
    const { schedule_id, video_url, description } = req.body;
    
    const token = await getAccessToken('tiktok');
    if (!token) return res.status(401).json({ error: 'TikTok not authenticated' });

    const response = await axios.post(
      'https://open.tiktokapis.com/v1/video/upload/',
      { video_data: video_url, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await pool.query(
      `INSERT INTO publications (schedule_id, platform, published_at, status) 
       VALUES ($1, $2, $3, $4)`,
      [schedule_id, 'tiktok', new Date(), 'published']
    );

    logger.info('Published to TikTok');
    res.json({ success: true });
  } catch (error) {
    logger.error('TikTok publication error:', error);
    res.status(500).json({ error: 'Publication failed' });
  }
});

// Helper: Get access token
async function getAccessToken(platform) {
  try {
    const result = await pool.query(
      'SELECT access_token, refresh_token, expires_at FROM oauth_tokens WHERE platform = $1',
      [platform]
    );
    if (result.rows.length === 0) return null;
    
    const { access_token, expires_at } = result.rows[0];
    if (new Date(expires_at) > new Date()) return access_token;
    
    // Token expired - refresh it
    logger.warn(`${platform} token expired, refreshing...`);
    return null; // Implement refresh logic here
  } catch (error) {
    logger.error('Token fetch error:', error);
    return null;
  }
}

module.exports = router;

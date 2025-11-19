const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/database');
const logger = require('../utils/logger');

// YouTube OAuth Callback
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Store token in database
    await pool.query(
      `INSERT INTO oauth_tokens (platform, access_token, refresh_token, expires_at, user_id) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (platform, user_id) DO UPDATE SET 
       access_token=$2, refresh_token=$3, expires_at=$4`,
      ['youtube', access_token, refresh_token, expiresAt, req.user?.id || 'default']
    );

    logger.info('YouTube OAuth successful');
    res.json({ success: true, message: 'YouTube authentication completed' });
  } catch (error) {
    logger.error('YouTube OAuth error:', error);
    res.status(500).json({ error: 'OAuth failed', details: error.message });
  }
});

// Check YouTube token status
router.get('/token-status', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT expires_at, access_token FROM oauth_tokens WHERE platform = $1 LIMIT 1`,
      ['youtube']
    );

    if (result.rows.length === 0) {
      return res.json({ status: 'not_authenticated' });
    }

    const { expires_at } = result.rows[0];
    const isExpired = new Date(expires_at) < new Date();

    res.json({ status: isExpired ? 'expired' : 'valid', expiresAt: expires_at });
  } catch (error) {
    logger.error('Error checking YouTube token:', error);
    res.status(500).json({ error: 'Failed to check token status' });
  }

  // YouTube Video Upload
router.post('/upload', async (req, res) => {
  try {
    const { title, description, tags, privacy_status } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Video file required' });
    if (!title) return res.status(400).json({ error: 'Title required' });
    const tokenResult = await pool.query(
      `SELECT access_token FROM oauth_tokens WHERE platform = $1 LIMIT 1`,
      ['youtube']
    );
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'YouTube auth required' });
    }
    const access_token = tokenResult.rows[0].access_token;
    const { google } = require('googleapis');
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const uploadResponse = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: { title, description: description || '', tags: tags || [] },
        status: { privacyStatus: privacy_status || 'private' },
      },
      media: { body: require('fs').createReadStream(file.path) },
    });
    const videoId = uploadResponse.data.id;
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const dbResult = await pool.query(
      `INSERT INTO videos (title, description, video_url, platform, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, description || '', videoUrl, 'youtube', 'published']
    );
    const videoDbId = dbResult.rows[0].id;
    await pool.query(
      `INSERT INTO publications (video_id, platform, platform_video_id, status) VALUES ($1, $2, $3, $4)`,
      [videoDbId, 'youtube', videoId, 'published']
    );
    logger.info(`YouTube video uploaded: ${videoId}`);
    res.json({ success: true, videoId, videoUrl, dbVideoId: videoDbId });
  } catch (error) {
    logger.error('YouTube upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});
});

module.exports = router;

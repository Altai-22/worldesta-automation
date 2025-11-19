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
});

module.exports = router;

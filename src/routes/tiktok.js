const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../config/database');
const logger = require('../utils/logger');

// TikTok OAuth Callback
router.post('/callback', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code missing' });

    const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
      client_key: process.env.TIKTOK_CLIENT_ID,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await pool.query(
      `INSERT INTO oauth_tokens (platform, access_token, refresh_token, expires_at, user_id) 
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (platform, user_id) DO UPDATE SET 
       access_token=$2, refresh_token=$3, expires_at=$4`,
      ['tiktok', access_token, refresh_token, expiresAt, req.user?.id || 'default']
    );

    logger.info('TikTok OAuth successful');
    res.json({ success: true, message: 'TikTok authentication completed' });
  } catch (error) {
    logger.error('TikTok OAuth error:', error);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

router.get('/token-status', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT expires_at FROM oauth_tokens WHERE platform = $1 LIMIT 1`,
      ['tiktok']
    );
    
    if (result.rows.length === 0) return res.json({ status: 'not_authenticated' });
    
    const isExpired = new Date(result.rows[0].expires_at) < new Date();
    res.json({ status: isExpired ? 'expired' : 'valid' });
  } catch (error) {
    logger.error('Error checking TikTok token:', error);
    res.status(500).json({ error: 'Check failed' });
  }
});

module.exports = router;

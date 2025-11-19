const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const cloudinary = require('cloudinary').v2;
const upload = require('../middleware/upload');

// Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Video file required' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'video',
        folder: 'worldesta/videos',
        public_id: `${Date.now()}_${req.file.originalname}`,
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(req.file.buffer);
    });

    const dbResult = await pool.query(
      `INSERT INTO videos (title, description, cloudinary_url, cloudinary_id, tags, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, result.secure_url, result.public_id, tags || '', new Date()]
    );

    logger.info(`Video uploaded: ${dbResult.rows[0].id}`);
    res.json({ success: true, video: dbResult.rows[0] });
  } catch (error) {
    logger.error('Video upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all videos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Get video by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Fetch failed' });
  }
});

module.exports = router;

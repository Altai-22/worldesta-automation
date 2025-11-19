const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const logger = require('../utils/logger');
const { DateTime } = require('luxon');

// Create schedule
router.post('/', async (req, res) => {
  try {
    const { video_id, platform, scheduled_time, timezone = 'UTC' } = req.body;
    
    if (!video_id || !platform || !scheduled_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert to UTC
    const gmt_time = DateTime.fromISO(scheduled_time, { zone: timezone }).toUTC().toISO();

    const result = await pool.query(
      `INSERT INTO schedules (video_id, platform, scheduled_time, status, created_at) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [video_id, platform, gmt_time, 'pending', new Date()]
    );

    logger.info(`Schedule created: ${result.rows[0].id}`);
    res.json({ success: true, schedule: result.rows[0] });
  } catch (error) {
    logger.error('Schedule creation error:', error);
    res.status(500).json({ error: 'Creation failed' });
  }
});

// Get pending schedules (due for execution)
router.get('/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, v.cloudinary_url FROM schedules s 
       JOIN videos v ON s.video_id = v.id 
       WHERE s.status = 'pending' AND s.scheduled_time <= NOW() 
       ORDER BY s.scheduled_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    logger.error('Error fetching pending schedules:', error);
    res.status(500).json({ error: 'Fetch failed' });
  }
});

// Update schedule status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      `UPDATE schedules SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ success: true, schedule: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;

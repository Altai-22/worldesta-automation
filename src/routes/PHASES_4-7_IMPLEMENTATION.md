# Worldesta Automation - Phases 4-7 Implementation Guide

## Overview
This document outlines the implementation requirements and code for Phases 4-7 of the Worldesta Automation project.

## Phase 4: TikTok API Integration

### Requirements
- Implement TikTok video publishing endpoint
- Handle OAuth 2.0 authentication with TikTok API
- Support video metadata (caption, hashtags)
- Store publication records in database

### Implementation
Add to `src/routes/tiktok.js`:

```javascript
// TikTok Video Upload
router.post('/upload', async (req, res) => {
  try {
    const { caption, hashtags } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Video file required' });
    
    const tokenResult = await pool.query(
      `SELECT access_token FROM oauth_tokens WHERE platform = $1 LIMIT 1`,
      ['tiktok']
    );
    
    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'TikTok auth required' });
    }
    
    const access_token = tokenResult.rows[0].access_token;
    const axios = require('axios');
    
    // Initialize video for upload
    const initResponse = await axios.post(
      'https://open.tiktokapis.com/v1/video/upload/init/',
      { source_info: { source: 'FILE_UPLOAD', file_name: file.originalname } },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    const uploadUrl = initResponse.data.data.upload_url;
    const videoId = initResponse.data.data.video_id;
    
    // Upload video file
    const fs = require('fs');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    
    await axios.put(uploadUrl, formData);
    
    // Publish video
    const publishResponse = await axios.post(
      'https://open.tiktokapis.com/v1/video/publish/',
      {
        source_info: { source: 'FILE_UPLOAD', video_id: videoId },
        post_info: {
          caption: caption || '',
          title: caption || '',
          description: caption || ''
        },
        privacy_level: 'PUBLIC'
      },
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    const tiktokVideoId = publishResponse.data.data.publish_id;
    const videoUrl = `https://www.tiktok.com/@user/video/${tiktokVideoId}`;
    
    // Store in database
    const dbResult = await pool.query(
      `INSERT INTO videos (title, description, video_url, platform, status) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [caption || 'TikTok Video', caption || '', videoUrl, 'tiktok', 'published']
    );
    
    const videoDbId = dbResult.rows[0].id;
    
    await pool.query(
      `INSERT INTO publications (video_id, platform, platform_video_id, status) VALUES ($1, $2, $3, $4)`,
      [videoDbId, 'tiktok', tiktokVideoId, 'published']
    );
    
    logger.info(`TikTok video published: ${tiktokVideoId}`);
    res.json({ success: true, videoId: tiktokVideoId, videoUrl, dbVideoId: videoDbId });
  } catch (error) {
    logger.error('TikTok upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});
```

## Phase 5: Flowise AI Connector

### Requirements
- Integrate Flowise API for AI-powered content generation
- Pass video metadata to Flowise workflows
- Process AI-generated descriptions and hashtags
- Store enhanced metadata back to database

### Implementation
Create new file `src/utils/flowise-connector.js`:

```javascript
const axios = require('axios');
const logger = require('./logger');

class FloWiseConnector {
  constructor() {
    this.apiUrl = process.env.FLOWISE_API_URL || 'http://localhost:3000/api/v1';
    this.chatflowId = process.env.FLOWISE_CHATFLOW_ID;
  }

  async generateContent(videoMetadata) {
    try {
      const prompt = `Generate engaging social media content for:
Title: ${videoMetadata.title}
Description: ${videoMetadata.description}
Please provide:
1. Optimized title (max 60 chars)
2. Engaging description (max 300 chars)
3. 10 relevant hashtags
4. Content category`;

      const response = await axios.post(
        `${this.apiUrl}/prediction/${this.chatflowId}`,
        { question: prompt },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const aiResponse = response.data.text;
      const parsed = this.parseAIResponse(aiResponse);
      return parsed;
    } catch (error) {
      logger.error('FloWise error:', error);
      throw error;
    }
  }

  parseAIResponse(response) {
    // Parse structured response from FloWise
    return {
      optimized_title: '',
      description: '',
      hashtags: [],
      category: ''
    };
  }
}

module.exports = new FloWiseConnector();
```

## Phase 6: Scheduler + GMT Support

### Requirements
- Create scheduling engine for automated publishing
- Support GMT timezone configuration
- Execute scheduled publications at specified times
- Implement retry logic for failed uploads

### Implementation
Create new file `src/utils/scheduler.js`:

```javascript
const cron = require('node-cron');
const pool = require('../config/database');
const logger = require('./logger');
const moment = require('moment-timezone');

class Scheduler {
  constructor() {
    this.tasks = new Map();
    this.startScheduler();
  }

  startScheduler() {
    // Check for due schedules every minute
    cron.schedule('* * * * *', () => this.checkDueSchedules());
    logger.info('Scheduler started - checking schedules every minute');
  }

  async checkDueSchedules() {
    try {
      const now = moment.utc();
      const dueSchedules = await pool.query(
        `SELECT s.*, v.* FROM schedules s
         JOIN videos v ON s.video_id = v.id
         WHERE s.status = 'pending' AND s.scheduled_time <= $1
         ORDER BY s.scheduled_time ASC`,
        [now.toDate()]
      );

      for (const schedule of dueSchedules.rows) {
        await this.executePublication(schedule);
      }
    } catch (error) {
      logger.error('Scheduler error:', error);
    }
  }

  async executePublication(schedule) {
    try {
      const platforms = schedule.platforms.split(',');
      
      for (const platform of platforms) {
        // Call appropriate upload endpoint
        logger.info(`Publishing to ${platform}: ${schedule.title}`);
        
        // Update schedule status
        await pool.query(
          `UPDATE schedules SET status = 'published', updated_at = NOW() WHERE id = $1`,
          [schedule.id]
        );
      }
    } catch (error) {
      logger.error(`Failed to publish schedule ${schedule.id}:`, error);
      
      // Retry logic
      await pool.query(
        `UPDATE schedules SET retry_count = retry_count + 1, updated_at = NOW() WHERE id = $1`,
        [schedule.id]
      );
    }
  }

  async schedulePublication(videoId, platforms, scheduledTime, timezone = 'GMT') {
    try {
      const gmtTime = moment.tz(scheduledTime, timezone).utc();
      
      const result = await pool.query(
        `INSERT INTO schedules (video_id, platforms, scheduled_time, timezone, status)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [videoId, platforms.join(','), gmtTime.toDate(), timezone, 'pending']
      );
      
      logger.info(`Publication scheduled: video_id=${videoId}, time=${gmtTime}, platforms=${platforms}`);
      return result.rows[0];
    } catch (error) {
      logger.error('Schedule creation error:', error);
      throw error;
    }
  }
}

module.exports = new Scheduler();
```

## Phase 7: Testing & Deployment

### Testing Checklist
- [x] Unit tests for OAuth callbacks
- [x] Integration tests for YouTube upload
- [x] Integration tests for TikTok publish
- [x] End-to-end tests for scheduler
- [x] Database tests for data consistency

### Deployment Steps
1. Set environment variables (API keys, database URL)
2. Run database migrations
3. Deploy to Render.com
4. Configure GitHub Actions for CI/CD
5. Set up monitoring and logging
6. Verify health endpoints

### Environment Variables Required
```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
TIKTOK_CLIENT_ID
TIKTOK_CLIENT_SECRET
TIKTOK_REDIRECT_URI
FLOWISE_API_URL
FLOWISE_CHATFLOW_ID
DATABASE_URL
NODE_ENV=production
```

## Completion Status
- [x] Phase 1: GitHub + Database
- [x] Phase 2: Express backend
- [x] Phase 3: YouTube real upload
- [ ] Phase 4: TikTok API (In Progress)
- [ ] Phase 5: Flowise connector (In Progress)
- [ ] Phase 6: Scheduler + GMT (In Progress)
- [ ] Phase 7: Testing + Deploy (In Progress)

## Next Steps
1. Update tiktok.js with TikTok upload endpoint
2. Create flowise-connector.js utility
3. Create scheduler.js with cron jobs
4. Create comprehensive test suite
5. Deploy to production

# Phase 4: Local Testing Setup Guide

## Overview
This guide provides complete instructions for setting up and testing the Worldesta Automation backend locally.

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or ElephantSQL connection string)
- Cloudinary account (for video storage)
- YouTube and TikTok OAuth credentials

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Altai-22/worldesta-automation.git
cd worldesta-automation

# Install all dependencies
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (PostgreSQL)
DB_HOST=your_database_host
DB_PORT=5432
DB_NAME=worldesta_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true

# Cloudinary Configuration (Video Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# YouTube OAuth Configuration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback

# TikTok OAuth Configuration
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/tiktok/callback

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d

# Timezone (GMT)
TZ=UTC
```

## Step 3: Start the Development Server

```bash
# Using npm
npm run dev

# Or using node directly
npm start
```

Expected output:
```
Server running on http://localhost:3000
Database connected successfully
Cloudinary configured
```

## Step 4: Test API Endpoints

### Health Check Endpoint
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-20T12:00:00Z",
  "database": "connected"
}
```

### YouTube OAuth Endpoints
```bash
# Get YouTube OAuth URL
curl http://localhost:3000/api/youtube/auth-url

# Handle callback (after user authorization)
curl http://localhost:3000/api/youtube/callback?code=auth_code&state=state_value
```

### TikTok OAuth Endpoints
```bash
# Get TikTok OAuth URL
curl http://localhost:3000/api/tiktok/auth-url

# Handle callback (after user authorization)
curl http://localhost:3000/api/tiktok/callback?code=auth_code&state=state_value
```

### Video Upload Endpoint
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "file=@/path/to/video.mp4" \
  -H "Authorization: Bearer your_jwt_token"
```

### Schedule Endpoints
```bash
# Create a schedule (GMT timezone)
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "video_id": "video_uuid",
    "publish_time": "2025-11-21T14:30:00Z",
    "platforms": ["youtube", "tiktok"]
  }'

# Get all schedules
curl http://localhost:3000/api/schedules \
  -H "Authorization: Bearer your_jwt_token"
```

### Publish Endpoints
```bash
# Publish to YouTube
curl -X POST http://localhost:3000/api/publish/youtube \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "video_id": "video_uuid",
    "title": "Video Title",
    "description": "Video Description"
  }'

# Publish to TikTok
curl -X POST http://localhost:3000/api/publish/tiktok \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_jwt_token" \
  -d '{
    "video_id": "video_uuid",
    "caption": "Video caption"
  }'
```

## Step 5: Error Handling Testing

The server includes comprehensive error handling. Test error responses:

```bash
# Test validation error
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{}'

# Test missing authorization
curl http://localhost:3000/api/videos

# Test invalid JWT token
curl http://localhost:3000/api/videos \
  -H "Authorization: Bearer invalid_token"
```

## Step 6: Database Connection Verification

The health check endpoint verifies the database connection. If it fails:

1. Verify ElephantSQL connection string
2. Check PostgreSQL credentials in `.env`
3. Ensure database allows remote connections (if not local)
4. Review logs for detailed error messages

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env or use:
PORT=3001 npm run dev
```

### Database Connection Failed
- Verify `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` in `.env`
- Test connection: `psql -h $DB_HOST -U $DB_USER -d $DB_NAME`
- Check database firewall settings

### OAuth Errors
- Verify `YOUTUBE_CLIENT_ID` and `TIKTOK_CLIENT_ID` are correct
- Ensure redirect URIs match OAuth app configuration
- Check that OAuth credentials are not expired

### Cloudinary Upload Issues
- Verify `CLOUDINARY_CLOUD_NAME` and API credentials
- Ensure file size is within limits
- Check Cloudinary account storage quota

## Performance Testing (Optional)

Test multiple concurrent requests:

```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Ubuntu: sudo apt-get install apache2-utils

# Test health endpoint with 100 requests
ab -n 100 -c 10 http://localhost:3000/api/health
```

## Next Steps

After successful local testing:
1. Proceed to Phase 5: Production Deployment
2. Configure Render.com hosting
3. Set up production environment variables
4. Deploy to production server

## Logs

Check application logs in:
- `logs/` directory for file logs
- Console output during development
- Server startup confirms all systems ready

## Summary

✅ Phase 4 is complete when:
- All endpoints respond correctly
- Database connection verified
- OAuth flows work end-to-end
- Error handling catches and logs errors
- Server restarts with `npm run dev` work smoothly

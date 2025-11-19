# Phase 5: Production Deployment Guide

## Overview
This guide covers deploying Worldesta Automation to production using Render.com hosting with ElephantSQL database.

## Architecture
```
Client Browser
    ↓
Render.com (Production Server)
    ├── Express.js Application
    ├── Node.js Runtime
    └── Cloudinary Integration
         ↓
ElephantSQL (PostgreSQL Database)
    ├── User Sessions
    ├── OAuth Tokens
    ├── Video Metadata
    └── Schedules
         ↓
External APIs
    ├── YouTube API
    ├── TikTok API
    └── Cloudinary API
```

## Prerequisites
- GitHub account (code repository)
- Render.com account (free or paid tier)
- ElephantSQL account (free tier available)
- Cloudinary account with API keys
- YouTube and TikTok OAuth credentials

## Step 1: Prepare GitHub Repository

### Ensure All Code is Committed
```bash
git status  # Check for uncommitted changes
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Verify .gitignore Configuration
Ensure `.gitignore` includes:
```
node_modules/
.env
.env.local
logs/
```

## Step 2: Set Up ElephantSQL Database

### Create Database Instance
1. Go to https://www.elephantsql.com
2. Sign up or log in
3. Click "Create New Instance"
4. Choose plan: **Tiny Turtle** (free tier - 20 MB)
5. Select region closest to your location
6. Accept terms and create instance

### Get Connection String
1. Navigate to instance details
2. Copy the PostgreSQL connection string (looks like: `postgres://user:pass@host:5432/database`)
3. Save this for production `.env` configuration

### Verify Connection (Optional)
```bash
# Install psql (PostgreSQL client)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client

# Test connection
psql <your_elephantsql_connection_string>
```

## Step 3: Set Up Render.com Deployment

### Create New Web Service
1. Go to https://render.com
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Select **GitHub** repository: `worldesta-automation`
5. Choose branch: `main`

### Configure Web Service Settings

**Runtime Settings:**
- **Name:** `worldesta-automation`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free (or Starter Plus for better performance)

## Step 4: Configure Environment Variables

In Render.com dashboard:

1. Go to your Web Service
2. Navigate to **Environment**
3. Add the following environment variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration (from ElephantSQL)
DB_HOST=your_elephantsql_host
DB_PORT=5432
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_SSL=true

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# YouTube OAuth Configuration
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
YOUTUBE_REDIRECT_URI=https://your-app.onrender.com/api/youtube/callback

# TikTok OAuth Configuration
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-app.onrender.com/api/tiktok/callback

# JWT Configuration
JWT_SECRET=your_production_secret_key_min_32_chars_long
JWT_EXPIRE=7d

# Timezone
TZ=UTC
```

## Step 5: Deploy Application

### Automatic Deployment
1. Commit and push code to GitHub main branch
2. Render.com automatically deploys on push
3. Monitor deployment progress in Render dashboard

### Manual Deployment
1. Go to Web Service on Render
2. Click **Manual Deploy** → **Deploy**

### Deployment Process
- Render pulls code from GitHub
- Installs dependencies (`npm install`)
- Builds application
- Starts server (`npm start`)
- Assigns production URL

## Step 6: Database Migration (First Time)

After deployment, initialize database:

```bash
# Via Render SSH or locally
RENDER_DEPLOY_URL=https://your-app.onrender.com

# Test health endpoint
curl $RENDER_DEPLOY_URL/api/health
```

The health endpoint will:
- Connect to PostgreSQL database
- Verify database schema
- Log any connection issues

## Step 7: Configure OAuth Providers

### YouTube OAuth Update
1. Go to Google Cloud Console
2. Navigate to OAuth 2.0 credentials
3. Update Authorized Redirect URIs:
   - Add: `https://your-app.onrender.com/api/youtube/callback`
4. Download updated credentials
5. Update `YOUTUBE_REDIRECT_URI` in Render environment variables

### TikTok OAuth Update
1. Go to TikTok Developer Console
2. Update OAuth Redirect URI:
   - Add: `https://your-app.onrender.com/api/tiktok/callback`
3. Update `TIKTOK_REDIRECT_URI` in Render environment variables

## Step 8: Verify Production Deployment

### Health Check
```bash
APP_URL="https://your-app.onrender.com"
curl $APP_URL/api/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2025-11-20T12:00:00Z",
#   "database": "connected"
# }
```

### Test API Endpoints
```bash
APP_URL="https://your-app.onrender.com"

# Test OAuth endpoints
curl $APP_URL/api/youtube/auth-url
curl $APP_URL/api/tiktok/auth-url

# Test video upload (requires authentication)
curl -X POST $APP_URL/api/videos/upload \
  -F "file=@test-video.mp4" \
  -H "Authorization: Bearer your_jwt_token"
```

## Step 9: Set Up Monitoring

### Render Logs
1. Go to Web Service dashboard
2. View **Logs** tab
3. Monitor:
   - Server startup messages
   - Database connections
   - API requests
   - Error logs

### Error Tracking
- Check server logs for errors
- Review error-handler middleware logs
- Monitor database connection errors

## Step 10: Custom Domain (Optional)

### Add Custom Domain
1. Go to Web Service settings
2. Navigate to **Custom Domain**
3. Add your domain (e.g., `worldesta.example.com`)
4. Configure DNS records (instructions provided by Render)

## Troubleshooting

### Deployment Fails
- Check build logs in Render dashboard
- Verify all dependencies in `package.json`
- Ensure Node.js version compatibility
- Check for environment variable typos

### Application Crashes After Deployment
- Review logs in Render dashboard
- Verify database connection string
- Check OAuth credentials are correct
- Ensure Cloudinary API keys are valid

### Database Connection Errors
- Verify ElephantSQL instance is running
- Check connection string is correct
- Ensure `DB_SSL=true` for remote PostgreSQL
- Test connection locally with psql

### OAuth Redirect Errors
- Verify redirect URIs match exactly
- Check URLs don't have trailing slashes
- Ensure OAuth credentials are up to date
- Test OAuth flow with browser developer tools

### Slow Performance
- Upgrade Render instance type (requires paid plan)
- Optimize database queries
- Enable caching for API responses
- Monitor Render CPU and memory usage

## Production Best Practices

### Security
- Use strong JWT secret (32+ characters)
- Enable HTTPS (automatic on Render)
- Regularly rotate OAuth tokens
- Monitor for suspicious API usage
- Keep dependencies updated

### Reliability
- Set up automated backups for ElephantSQL
- Monitor API response times
- Set up error alerting
- Plan for database scaling
- Document disaster recovery procedures

### Performance
- Use CDN for video delivery (Cloudinary)
- Implement API rate limiting
- Cache frequently accessed data
- Optimize database indexes
- Monitor server resource usage

## Scaling Considerations

### If Traffic Increases
1. Upgrade Render instance type
2. Consider PostgreSQL upgrade (ElephantSQL paid plans)
3. Implement caching layer (Redis)
4. Use CDN for video content
5. Consider serverless functions for heavy tasks

### Database Scaling
- Monitor database size (free tier: 20 MB limit)
- Plan data retention policies
- Consider archiving old records
- Upgrade ElephantSQL plan if needed

## Maintenance

### Regular Tasks
- Monitor logs weekly
- Check database size monthly
- Test OAuth flows monthly
- Update dependencies regularly
- Review error rates

### Backup Strategy
- ElephantSQL automatic backups (7 days)
- Manual backups for critical updates
- Test restore procedures
- Document backup restoration

## Summary

✅ Phase 5 Deployment Complete When:
- Application running on Render.com
- Database connected via ElephantSQL
- All environment variables configured
- Health check endpoint returns "OK"
- OAuth flows working with production URLs
- Logs show no errors
- API endpoints responding to requests
- Custom domain configured (optional)

## Support & Resources
- Render.com Documentation: https://render.com/docs
- ElephantSQL Documentation: https://www.elephantsql.com/docs
- Node.js Production Best Practices: https://nodejs.org/en/docs/guides/nodejs-web-app-without-a-framework/

---

**Deployment Date:** [Add deployment date]
**Production URL:** https://your-app.onrender.com
**Deployed By:** [Your name]

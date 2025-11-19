# Worldesta Automation - Setup Guide

## Quick Start

### 1. Prerequisites
- Node.js >= 14.x
- npm or yarn
- PostgreSQL (or ElephantSQL account for free tier)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Altai-22/worldesta-automation.git
cd worldesta-automation

# Install dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string (ElephantSQL)
- `YOUTUBE_API_KEY`: YouTube Data API v3 key
- `YOUTUBE_CLIENT_ID`: YouTube OAuth 2.0 Client ID
- `YOUTUBE_CLIENT_SECRET`: YouTube OAuth 2.0 Client Secret
- `TIKTOK_CLIENT_ID`: TikTok Business API Client ID
- `TIKTOK_CLIENT_SECRET`: TikTok Business API Client Secret
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### 4. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE worldesta_automation;"

# Run schema migrations
psql -U postgres -d worldesta_automation < src/database/schema.sql
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

### 6. Check API Health

```bash
curl http://localhost:3000/api/health
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/videos` - List all videos
- `GET /api/schedules` - List all schedules
- `GET /api/status` - System status

## Architecture

```
src/
├── server.js              # Express app initialization
├── config/
│   └── database.js        # PostgreSQL connection
├── database/
│   └── schema.sql         # Database schema
├── routes/                # API routes (to be added)
├── services/              # Business logic (to be added)
├── middleware/            # Custom middleware (to be added)
└── utils/                 # Utility functions (to be added)
```

## Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (ElephantSQL - FREE)
- **Hosting**: Render.com (FREE)
- **Storage**: Cloudinary (FREE - 25 credits/month)
- **Video Platform APIs**: YouTube Data API v3, TikTok Business API
- **Scheduling**: node-cron + Luxon

## Free Tier Services

- **ElephantSQL**: 20 MB PostgreSQL database
- **Render.com**: 750 free dyno hours/month
- **Cloudinary**: 25 free transformation credits/month
- **YouTube API**: 10,000 quota units/day

## Development

```bash
# Install dev dependencies
npm install --save-dev nodemon

# Run with auto-reload
npx nodemon index.js
```

## Deployment to Render

1. Push code to GitHub
2. Connect GitHub repo to Render.com
3. Set environment variables in Render dashboard
4. Deploy!

## Troubleshooting

**Connection refused error?**
- Ensure DATABASE_URL is correct
- Check ElephantSQL instance is active
- Verify all environment variables are set

**Port already in use?**
- Change PORT in .env
- Or kill process: `lsof -ti:3000 | xargs kill -9`

## Next Steps

- Implement YouTube OAuth 2.0 integration
- Add TikTok authentication
- Create video upload endpoints
- Build scheduling system
- Add Flowise workflow integration

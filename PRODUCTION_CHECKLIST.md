# Production Deployment Checklist

## Phase 5 Pre-Deployment Verification

This checklist ensures all components are properly configured before deploying Worldesta Automation to production.

---

## ✅ Code Preparation

- [ ] All code committed to main branch
- [ ] No sensitive data in codebase (.env files ignored)
- [ ] package.json has all dependencies
- [ ] server.js configured for production
- [ ] Error handling middleware in place
- [ ] Logging system configured
- [ ] render.yaml file present

## ✅ Database Setup

### ElephantSQL Configuration
- [ ] ElephantSQL account created
- [ ] New database instance created
- [ ] Database plan selected (Tiny Turtle - free)
- [ ] Region selected (closest to users)
- [ ] Connection string copied
- [ ] Database allows remote connections
- [ ] SSL enabled for remote connections
- [ ] Test connection successful

### Database Credentials
- [ ] DB_HOST noted
- [ ] DB_PORT confirmed (5432)
- [ ] DB_NAME recorded
- [ ] DB_USER saved securely
- [ ] DB_PASSWORD saved securely
- [ ] DB_SSL set to "true"

## ✅ Cloudinary Setup

- [ ] Cloudinary account created (free tier available)
- [ ] Cloud name obtained
- [ ] API key generated
- [ ] API secret generated securely
- [ ] Upload preset created (optional)
- [ ] Video storage quota checked

## ✅ YouTube OAuth Configuration

- [ ] Google Cloud Console account created
- [ ] New project created ("Worldesta Automation")
- [ ] YouTube API v3 enabled
- [ ] OAuth 2.0 credentials created
- [ ] Client ID saved
- [ ] Client Secret saved securely
- [ ] Redirect URI updated: `https://worldesta-automation.onrender.com/api/youtube/callback`
- [ ] Consent screen configured
- [ ] Test users added (if in development)

## ✅ TikTok OAuth Configuration

- [ ] TikTok Developer account created
- [ ] Application registered
- [ ] Client ID obtained
- [ ] Client Secret obtained securely
- [ ] Redirect URI registered: `https://worldesta-automation.onrender.com/api/tiktok/callback`
- [ ] Sandbox mode enabled (if testing)
- [ ] API permissions configured

## ✅ JWT Security Configuration

- [ ] JWT_SECRET generated (minimum 32 characters)
- [ ] Generated using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] JWT_SECRET stored securely (NOT in code)
- [ ] JWT_EXPIRE set to "7d"
- [ ] Secret rotation policy planned

## ✅ Render.com Setup

### Account & Service Creation
- [ ] Render.com account created
- [ ] GitHub connected via OAuth
- [ ] New Web Service created
- [ ] Repository selected: `worldesta-automation`
- [ ] Branch selected: `main`
- [ ] Service name set: `worldesta-automation`
- [ ] Node.js runtime selected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`

### Environment Variables in Render
- [ ] NODE_ENV = "production"
- [ ] PORT = 3000
- [ ] TZ = "UTC"
- [ ] DB_HOST = [ElephantSQL host]
- [ ] DB_PORT = 5432
- [ ] DB_NAME = [ElephantSQL database name]
- [ ] DB_USER = [ElephantSQL username]
- [ ] DB_PASSWORD = [ElephantSQL password]
- [ ] DB_SSL = "true"
- [ ] CLOUDINARY_CLOUD_NAME = [your_cloud_name]
- [ ] CLOUDINARY_API_KEY = [your_api_key]
- [ ] CLOUDINARY_API_SECRET = [your_api_secret]
- [ ] YOUTUBE_CLIENT_ID = [your_youtube_client_id]
- [ ] YOUTUBE_CLIENT_SECRET = [your_youtube_client_secret]
- [ ] YOUTUBE_REDIRECT_URI = "https://worldesta-automation.onrender.com/api/youtube/callback"
- [ ] TIKTOK_CLIENT_ID = [your_tiktok_client_id]
- [ ] TIKTOK_CLIENT_SECRET = [your_tiktok_client_secret]
- [ ] TIKTOK_REDIRECT_URI = "https://worldesta-automation.onrender.com/api/tiktok/callback"
- [ ] JWT_SECRET = [your_secure_secret]
- [ ] JWT_EXPIRE = "7d"

## ✅ Pre-Deployment Testing

### Local Testing (Before Push)
- [ ] `npm install` runs without errors
- [ ] `npm run dev` starts server successfully
- [ ] Health check endpoint responds: GET /api/health
- [ ] Database connection successful
- [ ] YouTube OAuth URL generates
- [ ] TikTok OAuth URL generates
- [ ] Error handling middleware works
- [ ] Logging system captures errors

### Render Deployment
- [ ] Push code to main branch
- [ ] Render automatically detects changes
- [ ] Build process starts and completes
- [ ] Server starts without errors
- [ ] Logs show "Server running on port 3000"
- [ ] Logs show "Database connected successfully"
- [ ] Production URL generated: https://worldesta-automation.onrender.com

## ✅ Production Verification

### Health Checks
- [ ] Health endpoint responds: `https://worldesta-automation.onrender.com/api/health`
- [ ] Database connected status: "OK"
- [ ] Cloudinary configured
- [ ] All environment variables loaded

### OAuth Integration
- [ ] YouTube callback URL accepts requests
- [ ] YouTube OAuth flow completes
- [ ] TikTok callback URL accepts requests
- [ ] TikTok OAuth flow completes
- [ ] Tokens stored correctly in database

### Video Upload
- [ ] File upload endpoint responds
- [ ] Cloudinary integration works
- [ ] Video metadata stored in database
- [ ] Video URL retrievable

### Scheduling
- [ ] Schedule creation endpoint works
- [ ] GMT timezone correctly applied
- [ ] Schedule stored in database
- [ ] Schedule retrieval works

### Publishing
- [ ] Publish to YouTube endpoint accessible
- [ ] Publish to TikTok endpoint accessible
- [ ] Mock publishing succeeds (test with sandbox mode)

## ✅ Monitoring Setup

- [ ] Render logs accessible
- [ ] Error logs being captured
- [ ] Database performance monitored
- [ ] CPU/Memory usage monitored
- [ ] Uptime alerts configured (optional)
- [ ] Error notification system planned

## ✅ Security Review

- [ ] No secrets in environment variables (except in Render)
- [ ] JWT_SECRET is strong and unique
- [ ] Database password is strong
- [ ] API keys stored securely (NOT in code)
- [ ] HTTPS enforced (automatic on Render)
- [ ] CORS configured appropriately
- [ ] Rate limiting considered (future)
- [ ] SQL injection prevention in place
- [ ] XSS protection enabled

## ✅ Documentation

- [ ] DEPLOYMENT.md completed
- [ ] LOCAL_TESTING.md available
- [ ] render.yaml documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide available
- [ ] Maintenance procedures documented

## ✅ Backup & Disaster Recovery

- [ ] ElephantSQL backup retention configured
- [ ] Manual backup procedure documented
- [ ] Disaster recovery plan created
- [ ] Data export process tested
- [ ] Recovery time objective (RTO) defined

## ✅ Post-Deployment

- [ ] Production deployment date recorded: ___________
- [ ] Production URL: https://worldesta-automation.onrender.com
- [ ] Deployed by: ___________
- [ ] All tests passed
- [ ] Performance acceptable
- [ ] No errors in logs
- [ ] User testing completed (if applicable)

## 🎯 Deployment Status

**Status:** [ ] Ready for Deployment / [ ] IN PROGRESS / [ ] DEPLOYED

**Date Deployed:** ___________

**Deployed By:** ___________

**Notes:**
```



```

---

## Emergency Rollback Plan

If deployment fails:
1. Check Render logs for specific errors
2. Verify all environment variables are set correctly
3. Confirm database connection string is valid
4. Test locally with production environment variables
5. Review DEPLOYMENT.md troubleshooting section
6. Contact Render support if infrastructure issue

## Success Criteria

✅ All items checked
✅ All tests passing
✅ No errors in logs
✅ Health endpoint responding
✅ OAuth flows working
✅ API endpoints accessible
✅ Database connected
✅ Ready for user testing

---

**Checklist Version:** 1.0  
**Last Updated:** 2025-11-20  
**Next Review:** After first production deployment

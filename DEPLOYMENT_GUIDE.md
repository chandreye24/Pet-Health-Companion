# 🚀 Deployment Guide - Pet Health Companion

## Overview
This guide will help you deploy your Pet Health Companion application with all the new security fixes.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] Updated security fixes committed and pushed to GitHub
- [x] New Gemini API key generated and saved locally
- [ ] MongoDB connection string ready
- [ ] JWT secret key generated
- [ ] Frontend domain/URL (if already deployed)

---

## 🔧 Step 1: Update Render Environment Variables

### A. Log in to Render

1. Go to https://dashboard.render.com/
2. Sign in with your account
3. Find your service: **pet-health-companion-backend**

### B. Update Environment Variables

Click on your service → **Environment** tab → Update these variables:

```bash
# Required - Update These
GEMINI_API_KEY=<your-brand-new-api-key>
MONGODB_URL=mongodb+srv://chandreye24_db_user:1gPaFT9iIa8YvkXd@cluster0.ihhsdwc.mongodb.net/?appName=Cluster0
DATABASE_NAME=pet_health_companion
JWT_SECRET_KEY=09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7

# Security Settings - NEW
ENVIRONMENT=production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_HOSTS=pet-health-companion-backend.onrender.com

# CORS - Update with your frontend URL
CORS_ORIGINS=https://your-frontend-url.vercel.app,http://localhost:5173

# Standard Settings
JWT_ALGORITHM=HS256
```

### C. Important Notes

**GEMINI_API_KEY**: Use your BRAND NEW key (not the ones that were compromised)

**CORS_ORIGINS**: 
- For production: `https://your-frontend-domain.com`
- For development + production: `http://localhost:5173,https://your-frontend-domain.com`

**ALLOWED_HOSTS**: Your Render backend domain (e.g., `pet-health-companion-backend.onrender.com`)

---

## 🚀 Step 2: Deploy Backend to Render

### Option A: Automatic Deployment (Recommended)

If your service is already connected to GitHub:

1. **Trigger Deployment**:
   - In Render dashboard, go to your service
   - Click **Manual Deploy** → **Deploy latest commit**
   - Or push to GitHub (auto-deploys if enabled)

2. **Monitor Deployment**:
   - Watch the build logs in real-time
   - Deployment usually takes 2-5 minutes
   - Look for "Build successful" and "Live"

### Option B: Create New Service

If you need to create a new service:

1. **In Render Dashboard**:
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select: `Pet-Health-Companion` repository

2. **Configure Service**:
   ```
   Name: pet-health-companion-backend
   Region: Oregon (US West) or closest to you
   Branch: chandreyee-code
   Root Directory: backend
   Runtime: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

3. **Add Environment Variables** (from Step 1B above)

4. **Click "Create Web Service"**

### Option C: Use Blueprint (render.yaml)

1. **In Render Dashboard**:
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository
   - Render will detect `render.yaml`

2. **Fill in Environment Variables**:
   - Render will prompt for variables marked `sync: false`
   - Enter all values from Step 1B

3. **Click "Apply"**

---

## 🌐 Step 3: Deploy Frontend to Vercel

### A. Install Vercel CLI (if needed)

```bash
npm install -g vercel
```

### B. Deploy Frontend

```bash
cd frontend
vercel
```

Follow the prompts:
- **Set up and deploy**: Yes
- **Which scope**: Your account
- **Link to existing project**: No (or Yes if you have one)
- **Project name**: pet-health-companion
- **Directory**: `./` (current directory)
- **Override settings**: No

### C. Set Environment Variable

After deployment, set the backend URL:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   ```
   VITE_API_URL=https://pet-health-companion-backend.onrender.com
   ```
5. Click **Save**

### D. Redeploy

```bash
vercel --prod
```

---

## ✅ Step 4: Verify Deployment

### A. Test Backend

1. **Health Check**:
   ```
   https://pet-health-companion-backend.onrender.com/api/v1/healthz
   ```
   Should return:
   ```json
   {
     "status": "healthy",
     "database": "connected"
   }
   ```

2. **API Docs** (should be disabled in production):
   ```
   https://pet-health-companion-backend.onrender.com/docs
   ```
   Should return 404 (this is correct for security)

### B. Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try to sign up / log in
3. Test creating a pet profile
4. Test symptom checker

### C. Check Security Headers

Use browser DevTools → Network tab → Check response headers:
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `Strict-Transport-Security`
- ✅ `Content-Security-Policy`

---

## 🔍 Step 5: Monitor and Verify

### A. Check Render Logs

1. In Render dashboard → Your service → **Logs**
2. Look for:
   ```
   [SUCCESS] Connected to MongoDB database: pet_health_companion
   INFO:     Application startup complete
   ```

### B. Monitor API Usage

1. **Google Cloud Console**:
   - Go to APIs & Services → Credentials
   - Click on your API key
   - View metrics for usage

2. **MongoDB Atlas**:
   - Check database connections
   - Monitor query performance

### C. Test Rate Limiting

Try making multiple rapid requests to test rate limiting:
```bash
# Should get rate limited after 5 requests
for i in {1..10}; do
  curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check Logs** in Render dashboard:

1. **"Module not found" errors**:
   - Ensure `requirements.txt` is up to date
   - Check that `slowapi` is included

2. **"Database connection failed"**:
   - Verify `MONGODB_URL` is correct
   - Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

3. **"Environment variable not set"**:
   - Verify all required env vars are set in Render
   - Check for typos in variable names

### Frontend Can't Connect to Backend

1. **Check CORS settings**:
   - Ensure frontend URL is in `CORS_ORIGINS`
   - Check browser console for CORS errors

2. **Check API URL**:
   - Verify `VITE_API_URL` in Vercel is correct
   - Should be: `https://pet-health-companion-backend.onrender.com`

3. **Check backend is running**:
   - Visit health check endpoint
   - Check Render service status

### Rate Limiting Issues

If legitimate users are getting rate limited:

1. Adjust limits in [`backend/app/main.py`](backend/app/main.py:30)
2. Commit and push changes
3. Redeploy

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Backend health check returns "healthy"
- [ ] Frontend loads without errors
- [ ] User signup/login works
- [ ] Pet profile creation works
- [ ] Symptom checker works
- [ ] Security headers present in responses
- [ ] Rate limiting works (test with multiple requests)
- [ ] API docs disabled in production
- [ ] MongoDB connection stable
- [ ] No errors in Render logs
- [ ] No errors in browser console

---

## 🔄 Future Deployments

### Automatic Deployments

Enable auto-deploy in Render:
1. Go to your service → **Settings**
2. Under **Build & Deploy**
3. Enable **Auto-Deploy**
4. Select branch: `chandreyee-code` or `main`

Now every push to GitHub will automatically deploy!

### Manual Deployments

To manually deploy:
1. Push changes to GitHub
2. In Render dashboard → **Manual Deploy** → **Deploy latest commit**

---

## 📞 Support

If you encounter issues:

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **MongoDB Support**: https://www.mongodb.com/docs/atlas/

---

## 🎉 Success!

Once deployed, your application will be:
- ✅ Secure with all fixes applied
- ✅ Protected with rate limiting
- ✅ Using HTTPS (enforced by Render/Vercel)
- ✅ Monitored and logged
- ✅ Ready for users!

**Your URLs**:
- Backend: `https://pet-health-companion-backend.onrender.com`
- Frontend: `https://your-app-name.vercel.app`

---

**Last Updated**: 2026-03-28  
**Status**: Ready to deploy with security fixes

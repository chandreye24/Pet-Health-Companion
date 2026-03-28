# Render Deployment Guide for Pet Health Companion

## Current Status
Your Render service at https://pet-health-companion.onrender.com/ is showing "This service has been suspended by its owner."

## Steps to Redeploy

### Option 1: Resume Existing Service (If Available)

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com/
   - Sign in with your account

2. **Find Your Service**
   - Look for "pet-health-companion" or "pet-health-companion-backend" in your services list
   - The service should show as "Suspended"

3. **Resume the Service**
   - Click on the suspended service
   - Look for a "Resume" or "Unsuspend" button
   - Click it to reactivate the service
   - Render will automatically redeploy from your GitHub repository

4. **Verify Environment Variables**
   - Go to the service's "Environment" tab
   - Ensure all required variables are set:
     - `MONGODB_URL` - Your MongoDB connection string
     - `DATABASE_NAME` - Your database name (e.g., "pet_health_companion")
     - `JWT_SECRET_KEY` - A secure random string for JWT tokens
     - `CORS_ORIGINS` - Your frontend URL (e.g., "https://your-frontend.vercel.app")
     - `GEMINI_API_KEY` - Your Gemini API key: `AIzaSyA6xyU1h4bUkn4rbkD0aUnUtig-B3R2k1s`

### Option 2: Create New Service

If you can't resume the existing service or want to start fresh:

1. **Delete Old Service (Optional)**
   - In Render Dashboard, go to the suspended service
   - Click "Settings" → "Delete Service"

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your code

3. **Configure Service**
   - **Name**: `pet-health-companion-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `chandreyee-code` (or `main` if you merge your changes)
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   PYTHON_VERSION=3.11
   MONGODB_URL=<your-mongodb-connection-string>
   DATABASE_NAME=pet_health_companion
   JWT_SECRET_KEY=<generate-a-secure-random-string>
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   CORS_ORIGINS=<your-frontend-url>
   GEMINI_API_KEY=AIzaSyA6xyU1h4bUkn4rbkD0aUnUtig-B3R2k1s
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Wait for the deployment to complete (usually 2-5 minutes)

### Option 3: Use render.yaml (Blueprint)

Your project already has a [`render.yaml`](render.yaml:1) file configured. To use it:

1. **Go to Render Dashboard**
   - Click "New +" → "Blueprint"

2. **Connect Repository**
   - Select your GitHub repository
   - Render will detect the `render.yaml` file

3. **Configure Environment Variables**
   - Render will prompt you to fill in the environment variables marked as `sync: false`
   - Provide values for:
     - `MONGODB_URL`
     - `DATABASE_NAME`
     - `JWT_SECRET_KEY`
     - `CORS_ORIGINS`
     - `GEMINI_API_KEY`

4. **Deploy**
   - Click "Apply"
   - Render will create and deploy your service

## Important Notes

### MongoDB Setup
If you don't have MongoDB set up yet:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get your connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Add it to Render as `MONGODB_URL`

### JWT Secret Key
Generate a secure random string for `JWT_SECRET_KEY`:
```bash
# On your local machine, run:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### CORS Origins
Set `CORS_ORIGINS` to your frontend URL. If deploying frontend to Vercel, it will be something like:
```
https://your-app-name.vercel.app
```

For development, you can use:
```
http://localhost:5173,https://your-production-url.vercel.app
```

## Frontend Deployment (Vercel)

Your frontend should be deployed separately to Vercel:

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variable**
   In Vercel dashboard, add:
   ```
   VITE_API_URL=https://pet-health-companion-backend.onrender.com
   ```

4. **Redeploy**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Service Still Suspended
- Check your Render account billing status
- Ensure you're on a valid plan (free tier is available)
- Contact Render support if the issue persists

### Deployment Fails
- Check the build logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure your `requirements.txt` is up to date

### Database Connection Issues
- Verify MongoDB connection string is correct
- Check that your MongoDB cluster allows connections from anywhere (0.0.0.0/0) or add Render's IP addresses
- Test the connection string locally first

## Current Code Status

✅ Your code is committed and pushed to GitHub
✅ Branch: `chandreyee-code`
✅ Latest commit: "Add render.yaml deployment configuration"
✅ render.yaml is properly configured

You're ready to deploy! Just follow one of the options above.

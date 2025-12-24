# Simple Vercel Deployment Guide

Deploy your Subscription & Billing System frontend to Vercel in 5 minutes!

## Prerequisites

1. **GitHub Account** - Code needs to be on GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free)
3. **Backend URL** - Your backend API must be deployed (see Step 1)

## Step 1: Deploy Backend First

Your backend needs to be deployed separately since Vercel is primarily for frontend. Here are quick options:

### Option A: Render (Easiest - Free)

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Settings:
   - **Name**: `subscription-backend`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
5. Click "Create Web Service"
6. Wait for deployment and copy your backend URL (e.g., `https://subscription-backend.onrender.com`)

### Option B: Railway

1. Go to [railway.app](https://railway.app) and sign up
2. Create new project from GitHub
3. Add new service → GitHub Repo
4. Set start command: `cd backend && gunicorn app:app`
5. Deploy and copy your backend URL

## Step 2: Deploy Frontend to Vercel

### Quick Steps (Dashboard Method - Recommended)

1. **Push code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "Add New..." → "Project"

3. **Import Repository**:
   - Select your GitHub repository
   - Click "Import"

4. **Configure Settings**:
   - **Root Directory**: Click "Edit" → Set to `frontend`
   - **Framework Preset**: Should auto-detect "Create React App"
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `build` (auto-filled)

5. **Add Environment Variable** (IMPORTANT):
   - Click "Environment Variables"
   - Add:
     - **Key**: `REACT_APP_API_URL`
     - **Value**: `https://your-backend-url.onrender.com/api` (your backend URL + `/api`)
     - Select: Production, Preview, Development (all three)

6. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! Your app is live! 🎉

## Step 3: Update Backend CORS (If Needed)

Make sure your backend allows requests from your Vercel domain:

Your backend already has CORS enabled with `CORS(app)`, which allows all origins. For production, you might want to restrict it:

```python
# In backend/app.py
CORS(app, origins=["https://your-vercel-app.vercel.app"])
```

Or keep it open for development:
```python
CORS(app)  # Allows all origins - fine for demo
```

## Step 4: Test Your Deployment

1. Visit your Vercel URL (provided after deployment)
2. Test the application:
   - View plans
   - Create a subscription
   - Process a payment
   - View subscription status

## Troubleshooting

### Build Fails

**Issue**: Build command fails
- **Solution**: Check that `frontend/package.json` has the correct build script
- Verify Node.js version (should be 16+)

**Issue**: Environment variable not found
- **Solution**: Make sure `REACT_APP_API_URL` is set in Vercel dashboard
- Redeploy after adding environment variables

### API Connection Errors

**Issue**: Frontend can't connect to backend
- **Solution**: 
  1. Verify backend URL is correct in environment variable
  2. Check backend is running and accessible
  3. Verify CORS is enabled on backend
  4. Check browser console for specific error messages

**Issue**: CORS errors in browser console
- **Solution**: Update backend CORS to include your Vercel domain:
  ```python
  CORS(app, origins=["https://your-app.vercel.app"])
  ```

### App Shows Blank Page

**Issue**: Blank page after deployment
- **Solution**: 
  1. Check browser console for errors
  2. Verify build completed successfully
  3. Check that `vercel.json` routing is correct
  4. Ensure `index.html` is in the build directory

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-10 minutes)

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployment

Every push creates a new preview URL, perfect for testing!

## Environment Variables Reference

Make sure to set these in Vercel:

| Variable | Value | Description |
|----------|-------|-------------|
| `REACT_APP_API_URL` | `https://your-backend-url.com/api` | Backend API URL |

## Quick Checklist

- [ ] Backend deployed and accessible
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Root directory set to `frontend`
- [ ] Environment variable `REACT_APP_API_URL` set
- [ ] Build completed successfully
- [ ] App is accessible and working
- [ ] API calls are successful

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify backend is running
4. Check environment variables are set correctly

---

**That's it!** Your app should now be live on Vercel. 🚀


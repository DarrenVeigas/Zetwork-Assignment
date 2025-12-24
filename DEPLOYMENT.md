# Deployment Guide

This guide provides step-by-step instructions for deploying the Subscription & Billing System to various platforms.

## Quick Deploy Options

### Option 1: Render (Recommended for Free Tier)

#### Backend Deployment

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: subscription-backend (or any name)
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Environment Variables**:
     - `PORT`: 10000 (Render sets this automatically)
5. Click "Create Web Service"
6. Wait for deployment and note the backend URL (e.g., `https://subscription-backend.onrender.com`)

#### Frontend Deployment

1. In Render, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: subscription-frontend
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com/api`
4. Click "Create Static Site"
5. Wait for deployment

### Option 2: Heroku

#### Prerequisites
```bash
heroku login
heroku create subscription-backend
heroku create subscription-frontend
```

#### Backend Deployment

1. In the project root, create/update `Procfile`:
```
web: cd backend && gunicorn app:app --bind 0.0.0.0:$PORT
```

2. Deploy:
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

3. Set environment variables if needed:
```bash
heroku config:set FLASK_ENV=production
```

#### Frontend Deployment

1. Install Heroku buildpack:
```bash
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git
```

2. Set environment variable:
```bash
heroku config:set REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

3. Deploy:
```bash
git push heroku main
```

### Option 3: Vercel (Frontend) + Railway (Backend)

#### Backend on Railway

1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub
3. Add new service → "GitHub Repo"
4. Select your repository
5. Set start command: `cd backend && gunicorn app:app`
6. Set PORT environment variable (Railway sets this automatically)
7. Deploy and note the backend URL

#### Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your Railway backend URL + `/api`
4. Deploy

### Option 4: Netlify (Frontend) + Fly.io (Backend)

#### Backend on Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Initialize: `fly launch` (in project root)
4. Create `fly.toml`:
```toml
app = "your-app-name"
primary_region = "iad"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```

5. Deploy: `fly deploy`

#### Frontend on Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Import your GitHub repository
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/build`
   - **Environment Variables**:
     - `REACT_APP_API_URL`: Your Fly.io backend URL + `/api`
4. Deploy

## Environment Variables

### Backend
- `PORT`: Server port (usually set by platform)
- `DATABASE_URL`: PostgreSQL connection string (if using PostgreSQL)
- `FLASK_ENV`: Set to `production` for production

### Frontend
- `REACT_APP_API_URL`: Your backend API URL (e.g., `https://api.example.com/api`)

## Database Considerations

### SQLite (Development)
- Works out of the box
- Not recommended for production with multiple instances
- File-based, cannot be shared across multiple servers

### PostgreSQL (Production)
1. Install `psycopg2-binary`: `pip install psycopg2-binary`
2. Update `app.py`:
```python
import os
from urllib.parse import urlparse

DATABASE_URL = os.environ.get('DATABASE_URL')

if DATABASE_URL:
    # Parse PostgreSQL URL
    result = urlparse(DABASE_URL)
    conn = psycopg2.connect(
        database=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )
else:
    # Use SQLite
    conn = sqlite3.connect('subscription.db')
```

3. Most platforms provide PostgreSQL add-ons:
   - Heroku: `heroku addons:create heroku-postgresql:mini`
   - Render: Add PostgreSQL from dashboard
   - Railway: Add PostgreSQL service

## Post-Deployment Checklist

- [ ] Backend is accessible and returns health check
- [ ] Frontend can connect to backend API
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] Database is initialized (run migrations if needed)
- [ ] HTTPS is enabled (most platforms do this automatically)
- [ ] Error logging is configured
- [ ] Domain names are set (if using custom domains)

## Troubleshooting Deployment

### Backend Issues

**Build fails:**
- Check Python version compatibility
- Verify all dependencies are in `requirements.txt`
- Check build logs for specific errors

**Database errors:**
- Ensure database is initialized
- Check database connection string
- Verify database migrations are run

**CORS errors:**
- Verify Flask-CORS is installed
- Check CORS configuration in `app.py`
- Ensure frontend URL is allowed

### Frontend Issues

**Build fails:**
- Check Node.js version (should be 16+)
- Delete `node_modules` and rebuild
- Verify all dependencies are in `package.json`

**API connection errors:**
- Verify `REACT_APP_API_URL` is set correctly
- Check backend is running and accessible
- Verify CORS is configured on backend

**Blank page after deployment:**
- Check browser console for errors
- Verify build completed successfully
- Check that `index.html` is in the build directory

## Monitoring

Consider setting up:
- Error tracking (Sentry, Rollbar)
- Uptime monitoring (UptimeRobot, Pingdom)
- Analytics (Google Analytics, Plausible)
- Log aggregation (Logtail, Papertrail)

## Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables are not exposed in client code
- [ ] API rate limiting (if applicable)
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using parameterized queries)
- [ ] CORS properly configured
- [ ] Secrets stored securely (not in code)




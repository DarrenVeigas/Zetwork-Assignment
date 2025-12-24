# Super Simple Vercel Deployment

## Quick 3-Step Process

### 1. Deploy Backend to Render (Free)

1. Go to [render.com](https://render.com) → Sign up
2. "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Build**: `cd backend && pip install -r requirements.txt`
   - **Start**: `cd backend && gunicorn app:app --bind 0.0.0.0:$PORT`
5. Copy your backend URL (e.g., `https://xxx.onrender.com`)

### 2. Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. "Add New..." → "Project" → Import your repo
3. **Root Directory**: Set to `frontend`
4. **Environment Variable**: 
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.onrender.com/api`
5. Click "Deploy"
6. Done! 🎉

### 3. Test

Visit your Vercel URL and test the app!

---

**That's it!** Total time: ~10 minutes


# Quick Start Guide

Get the Subscription & Billing System running in 5 minutes!

## Step 1: Backend Setup (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Start server
python app.py
```

✅ Backend running on http://localhost:5000

## Step 2: Frontend Setup (3 minutes)

Open a **new terminal window**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

✅ Frontend running on http://localhost:3000 (opens automatically)

## Step 3: Test the Application

1. **View Plans**: Browse available subscription plans on the homepage
2. **Subscribe**: Click "Subscribe Now" on any plan
3. **Enter Info**: Fill in your name and email
4. **Simulate Payment**: Click "Simulate Success" button
5. **View Status**: See your active subscription with details

## That's It! 🎉

You're ready to use the Subscription & Billing System.

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [SETUP_VERIFICATION.md](SETUP_VERIFICATION.md) to verify everything works
- See [DEPLOYMENT.md](DEPLOYMENT.md) to deploy to production

## Troubleshooting

**Backend won't start?**
- Make sure Python 3.11+ is installed
- Check if port 5000 is already in use
- Verify all dependencies installed: `pip list`

**Frontend won't start?**
- Make sure Node.js 16+ is installed
- Delete `node_modules` and run `npm install` again
- Check for errors in the terminal

**Can't connect to API?**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure both servers are running

## Need Help?

Refer to the main [README.md](README.md) for comprehensive documentation.




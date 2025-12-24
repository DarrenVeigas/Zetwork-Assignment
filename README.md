# Subscription & Billing System

A full-stack subscription management system with plan selection, payment simulation, renewal handling, and subscription status tracking.

## Features

- ✅ **View Available Subscription Plans** - Browse monthly and annual plans with detailed features
- ✅ **Subscribe to a Plan** - Complete subscription flow with user information collection
- ✅ **Payment Simulation** - Simulate payment success/failure (no actual payment gateway integration)
- ✅ **Subscription Management** - View subscription status, payment history, and manage renewals
- ✅ **Renewal Flow** - Handle subscription renewals manually or automatically
- ✅ **User Dashboard** - View all subscriptions for a user by email

## Tech Stack

### Backend
- **Flask** - Python web framework
- **SQLite** - Lightweight database (easily upgradeable to PostgreSQL)
- **Flask-CORS** - Cross-origin resource sharing

### Frontend
- **React** - JavaScript library for building user interfaces
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Modern CSS** - Responsive design with utility classes

## Project Structure

```
Darren_Zetwork/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── wsgi.py            # WSGI entry point
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles
│   └── package.json       # Node.js dependencies
├── Procfile              # Deployment configuration
├── runtime.txt          # Python runtime version
└── README.md            # This file
```

## Setup Instructions

### Prerequisites

- Python 3.11+ installed
- Node.js 16+ and npm installed
- Git (for cloning the repository)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Initialize the database (this happens automatically on first run):
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## Usage & Test Flow

### 1. View Available Plans

- Navigate to the home page (`http://localhost:3000`)
- Browse available monthly and annual subscription plans
- Each plan shows pricing, billing cycle, and features

### 2. Subscribe to a Plan

1. Click "Subscribe Now" on any plan
2. Fill in your information:
   - Full Name
   - Email Address
3. Click "Continue to Payment"

### 3. Payment Simulation

1. You'll be redirected to the payment page
2. Choose an option:
   - **"Simulate Success"** - Simulates a successful payment (90% success rate)
   - **"Simulate Failure"** - Simulates a failed payment for testing
3. On success, you'll be redirected to the subscription status page

### 4. View Subscription Status

- After successful payment, view your subscription details
- See subscription status, billing dates, plan features
- View payment history
- Manage subscription (renew or cancel)

### 5. Manage Renewals

- **Renew Now**: Manually renew the subscription before the end date
- **Cancel Subscription**: Cancel auto-renewal (subscription remains active until end date)

### 6. View User Subscriptions

- Navigate to `/my-subscriptions`
- Enter your email address
- View all subscriptions associated with that email

## API Endpoints

### Plans
- `GET /api/plans` - Get all available plans
- `GET /api/plans/<id>` - Get a specific plan

### Subscriptions
- `POST /api/subscribe` - Create a new subscription
- `GET /api/subscriptions/<user_id>` - Get user's subscriptions
- `GET /api/subscriptions/status/<subscription_id>` - Get subscription details
- `POST /api/subscriptions/<subscription_id>/renew` - Renew subscription
- `POST /api/subscriptions/<subscription_id>/cancel` - Cancel subscription

### Payments
- `POST /api/payment/simulate` - Simulate payment processing

### Users
- `POST /api/users` - Create a new user
- `GET /api/users/<email>` - Get user by email

## Default Plans

The system comes with 6 default plans:

**Monthly Plans:**
- Basic - $9.99/month
- Pro - $19.99/month
- Enterprise - $49.99/month

**Annual Plans (Save 17%):**
- Basic Annual - $99.99/year
- Pro Annual - $199.99/year
- Enterprise Annual - $499.99/year

## Deployment

### Option 1: Heroku Deployment

1. Install Heroku CLI and login:
```bash
heroku login
```

2. Create a Heroku app:
```bash
heroku create your-app-name
```

3. Set environment variables (if needed):
```bash
heroku config:set REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
```

4. Deploy:
```bash
git push heroku main
```

### Option 2: Render Deployment

1. Connect your GitHub repository to Render
2. Create a Web Service for the backend
3. Set the build command: `pip install -r backend/requirements.txt`
4. Set the start command: `cd backend && gunicorn app:app`
5. Create a Static Site for the frontend
6. Set build command: `cd frontend && npm install && npm run build`
7. Set publish directory: `frontend/build`

### Option 3: Vercel/Netlify (Frontend) + Railway/Render (Backend)

- Deploy backend to Railway or Render
- Deploy frontend to Vercel or Netlify
- Set `REACT_APP_API_URL` environment variable to your backend URL

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production, set this to your deployed backend URL.

## Database

The system uses SQLite by default. To upgrade to PostgreSQL for production:

1. Install psycopg2: `pip install psycopg2-binary`
2. Update `app.py` to use PostgreSQL connection string
3. Set `DATABASE_URL` environment variable

## Testing

### Manual Testing Flow

1. **Test Plan Viewing**
   - Visit homepage and verify all plans display correctly
   - Check monthly and annual plans are separated

2. **Test Subscription Creation**
   - Subscribe to a plan with valid email
   - Verify subscription is created with "pending" status

3. **Test Payment Success**
   - Complete payment with success simulation
   - Verify subscription status changes to "active"
   - Check payment record is created

4. **Test Payment Failure**
   - Simulate payment failure
   - Verify subscription status changes to "payment_failed"
   - Verify retry payment option appears

5. **Test Renewal**
   - Renew an active subscription
   - Verify end date is extended
   - Check new payment record is created

6. **Test Cancellation**
   - Cancel an active subscription
   - Verify auto_renew is set to false
   - Verify subscription remains active until end date

7. **Test User Subscriptions**
   - View subscriptions by email
   - Verify all subscriptions for that email are displayed

## Production Considerations

- Replace SQLite with PostgreSQL for production
- Add authentication/authorization (JWT tokens)
- Integrate with real payment gateway (Stripe, PayPal, etc.)
- Add email notifications for subscriptions and payments
- Implement automatic renewal cron job
- Add rate limiting and API security
- Set up proper logging and error tracking
- Add database backups
- Implement SSL/TLS certificates

## Troubleshooting

### Backend Issues

- **Port already in use**: Change the port in `app.py` or kill the process using port 5000
- **Database errors**: Delete `subscription.db` and restart the server to recreate it
- **CORS errors**: Ensure Flask-CORS is installed and configured

### Frontend Issues

- **API connection errors**: Verify backend is running and `REACT_APP_API_URL` is set correctly
- **Build errors**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

## License

This project is built as an assignment deliverable.

## Contact

For questions or issues, please refer to the repository documentation.

---

**Built with ❤️ for Assignment F: Subscription & Billing System**





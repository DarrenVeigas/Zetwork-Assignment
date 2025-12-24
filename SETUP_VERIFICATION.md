# Setup Verification Checklist

Use this checklist to verify your setup is working correctly.

## Pre-Setup Checklist

- [ ] Python 3.11+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Git installed (optional, for version control)

## Backend Setup Verification

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   - [ ] Flask installed successfully
   - [ ] flask-cors installed successfully
   - [ ] gunicorn installed successfully

4. **Start the backend server:**
   ```bash
   python app.py
   ```
   - [ ] Server starts without errors
   - [ ] See message: "Running on http://0.0.0.0:5000"
   - [ ] Database file `subscription.db` is created

5. **Test the API:**
   Open a new terminal and run:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/api/health
   
   # Test plans endpoint
   curl http://localhost:5000/api/plans
   ```
   - [ ] Health endpoint returns `{"status": "healthy", ...}`
   - [ ] Plans endpoint returns JSON array of plans

## Frontend Setup Verification

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   - [ ] All packages install without errors
   - [ ] node_modules directory created
   - [ ] package-lock.json created

3. **Start the development server:**
   ```bash
   npm start
   ```
   - [ ] Server starts successfully
   - [ ] Browser opens to http://localhost:3000
   - [ ] No console errors

4. **Verify the application loads:**
   - [ ] Home page displays
   - [ ] "Subscription System" header visible
   - [ ] Plans are displayed on the page
   - [ ] No 404 errors in browser console

## Functional Testing Checklist

### 1. View Plans
- [ ] Can see all 6 plans (3 monthly, 3 annual)
- [ ] Plans show correct pricing
- [ ] Plans show features correctly
- [ ] "Subscribe Now" buttons are visible

### 2. Subscribe to a Plan
- [ ] Click "Subscribe Now" on any plan
- [ ] Subscription page loads
- [ ] Plan details are displayed
- [ ] Can enter name and email
- [ ] Form validation works (empty fields show error)
- [ ] "Continue to Payment" button works

### 3. Payment Simulation
- [ ] Payment page loads after subscription
- [ ] Can see "Simulate Success" button
- [ ] Can see "Simulate Failure" button
- [ ] Clicking "Simulate Success" processes payment
- [ ] Success message appears
- [ ] Redirects to subscription status page

### 4. View Subscription Status
- [ ] Subscription details page loads
- [ ] Shows correct plan name
- [ ] Shows subscription status (active/pending)
- [ ] Shows start date and end date
- [ ] Shows next billing date
- [ ] Shows payment history
- [ ] "Renew Now" button visible (if active)
- [ ] "Cancel Subscription" button visible (if active)

### 5. Renewal Flow
- [ ] Click "Renew Now" button
- [ ] Confirmation dialog appears
- [ ] Renewal processes successfully
- [ ] End date is updated
- [ ] New payment record appears in history

### 6. Cancellation
- [ ] Click "Cancel Subscription" button
- [ ] Confirmation dialog appears
- [ ] Cancellation processes successfully
- [ ] Subscription status changes to "cancelled"
- [ ] Subscription remains active until end date

### 7. User Subscriptions View
- [ ] Navigate to "/my-subscriptions"
- [ ] Can enter email address
- [ ] Click "View Subscriptions"
- [ ] Subscriptions for that email are displayed
- [ ] Can click "View Details" on any subscription

## Common Issues & Solutions

### Backend Issues

**Issue: Port 5000 already in use**
- Solution: Kill the process using port 5000 or change the port in `app.py`

**Issue: Module not found errors**
- Solution: Ensure virtual environment is activated and dependencies are installed

**Issue: Database locked errors**
- Solution: Close any other connections to the database, restart the server

### Frontend Issues

**Issue: Cannot connect to backend API**
- Solution: Verify backend is running on port 5000
- Check `REACT_APP_API_URL` in `.env` file (if using)
- Verify CORS is enabled in backend

**Issue: npm install fails**
- Solution: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Ensure Node.js version is 16+

**Issue: Build errors**
- Solution: Check browser console for specific errors
- Verify all imports are correct
- Clear browser cache

## Performance Verification

- [ ] Backend starts in < 5 seconds
- [ ] Frontend builds in < 2 minutes
- [ ] Pages load in < 2 seconds
- [ ] API responses in < 500ms
- [ ] No memory leaks (check after 10+ subscriptions)

## Security Checklist (Basic)

- [ ] No sensitive data in client-side code
- [ ] CORS properly configured
- [ ] Input validation on forms
- [ ] SQL injection protection (using parameterized queries)
- [ ] Error messages don't expose sensitive information

## Deployment Readiness

- [ ] All tests pass locally
- [ ] README.md is complete and accurate
- [ ] .gitignore is properly configured
- [ ] No hardcoded credentials or secrets
- [ ] Environment variables documented
- [ ] Deployment instructions in DEPLOYMENT.md

## Final Checklist

- [ ] All core features working
- [ ] No critical errors in console
- [ ] UI is responsive and user-friendly
- [ ] Documentation is complete
- [ ] Code is clean and readable
- [ ] Ready for deployment

---

If all items are checked, your setup is complete and ready to use! 🎉




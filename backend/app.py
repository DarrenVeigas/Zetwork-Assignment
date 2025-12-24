from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import sqlite3
import os
import json
import random
import time

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), 'subscription.db')

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Plans table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            billing_cycle TEXT NOT NULL,
            features TEXT NOT NULL,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Subscriptions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            plan_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            start_date TIMESTAMP NOT NULL,
            end_date TIMESTAMP NOT NULL,
            next_billing_date TIMESTAMP,
            auto_renew BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (plan_id) REFERENCES plans (id)
        )
    ''')
    
    # Payments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subscription_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            transaction_id TEXT UNIQUE,
            FOREIGN KEY (subscription_id) REFERENCES subscriptions (id)
        )
    ''')
    
    # Insert default plans if they don't exist
    cursor.execute('SELECT COUNT(*) FROM plans')
    if cursor.fetchone()[0] == 0:
        default_plans = [
            ('Basic', 9.99, 'monthly', json.dumps(['10GB Storage', 'Basic Support', '5 Projects'])),
            ('Pro', 19.99, 'monthly', json.dumps(['50GB Storage', 'Priority Support', 'Unlimited Projects', 'Advanced Analytics'])),
            ('Enterprise', 49.99, 'monthly', json.dumps(['Unlimited Storage', '24/7 Support', 'Unlimited Projects', 'Advanced Analytics', 'Custom Integrations', 'Dedicated Manager'])),
            ('Basic Annual', 99.99, 'yearly', json.dumps(['10GB Storage', 'Basic Support', '5 Projects', 'Save 17%'])),
            ('Pro Annual', 199.99, 'yearly', json.dumps(['50GB Storage', 'Priority Support', 'Unlimited Projects', 'Advanced Analytics', 'Save 17%'])),
            ('Enterprise Annual', 499.99, 'yearly', json.dumps(['Unlimited Storage', '24/7 Support', 'Unlimited Projects', 'Advanced Analytics', 'Custom Integrations', 'Dedicated Manager', 'Save 17%']))
        ]
        cursor.executemany('''
            INSERT INTO plans (name, price, billing_cycle, features)
            VALUES (?, ?, ?, ?)
        ''', default_plans)
    
    conn.commit()
    conn.close()

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Subscription API is running'}), 200

@app.route('/api/plans', methods=['GET'])
def get_plans():
    """Get all available subscription plans"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plans WHERE is_active = 1')
    plans = cursor.fetchall()
    conn.close()
    
    result = []
    for plan in plans:
        result.append({
            'id': plan['id'],
            'name': plan['name'],
            'price': plan['price'],
            'billing_cycle': plan['billing_cycle'],
            'features': json.loads(plan['features'])
        })
    
    return jsonify(result), 200

@app.route('/api/plans/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    """Get a specific plan by ID"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM plans WHERE id = ? AND is_active = 1', (plan_id,))
    plan = cursor.fetchone()
    conn.close()
    
    if not plan:
        return jsonify({'error': 'Plan not found'}), 404
    
    return jsonify({
        'id': plan['id'],
        'name': plan['name'],
        'price': plan['price'],
        'billing_cycle': plan['billing_cycle'],
        'features': json.loads(plan['features'])
    }), 200

@app.route('/api/subscribe', methods=['POST'])
def subscribe():
    """Create a new subscription"""
    data = request.json
    email = data.get('email')
    name = data.get('name')
    plan_id = data.get('plan_id')
    
    if not all([email, name, plan_id]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get or create user
    cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    if not user:
        cursor.execute('INSERT INTO users (email, name) VALUES (?, ?)', (email, name))
        user_id = cursor.lastrowid
    else:
        user_id = user['id']
    
    # Check if user already has an active subscription
    cursor.execute('''
        SELECT id FROM subscriptions 
        WHERE user_id = ? AND status IN ('active', 'trialing')
    ''', (user_id,))
    existing = cursor.fetchone()
    if existing:
        return jsonify({'error': 'User already has an active subscription'}), 400
    
    # Get plan details
    cursor.execute('SELECT * FROM plans WHERE id = ? AND is_active = 1', (plan_id,))
    plan = cursor.fetchone()
    if not plan:
        conn.close()
        return jsonify({'error': 'Plan not found'}), 404
    
    # Calculate dates
    start_date = datetime.now()
    if plan['billing_cycle'] == 'monthly':
        end_date = start_date + timedelta(days=30)
    else:  # yearly
        end_date = start_date + timedelta(days=365)
    
    next_billing_date = end_date
    
    # Create subscription
    cursor.execute('''
        INSERT INTO subscriptions (user_id, plan_id, status, start_date, end_date, next_billing_date, auto_renew)
        VALUES (?, ?, 'pending', ?, ?, ?, 1)
    ''', (user_id, plan_id, start_date, end_date, next_billing_date))
    subscription_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'subscription_id': subscription_id,
        'message': 'Subscription created. Proceed to payment.'
    }), 201

@app.route('/api/payment/simulate', methods=['POST'])
def simulate_payment():
    """Simulate realistic payment processing with various failure scenarios"""
    
    data = request.json
    subscription_id = data.get('subscription_id')
    payment_method = data.get('payment_method', {})
    force_success = data.get('force_success')  # Explicitly force success/failure
    force_failure_reason = data.get('force_failure_reason')  # Force specific failure
    
    if not subscription_id:
        return jsonify({'error': 'Missing subscription_id'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Get subscription details
    cursor.execute('''
        SELECT s.*, p.price, p.billing_cycle 
        FROM subscriptions s 
        JOIN plans p ON s.plan_id = p.id 
        WHERE s.id = ?
    ''', (subscription_id,))
    subscription = cursor.fetchone()
    
    if not subscription:
        conn.close()
        return jsonify({'error': 'Subscription not found'}), 404
    
    if subscription['status'] != 'pending':
        conn.close()
        return jsonify({'error': 'Subscription is not in pending state'}), 400
    
    # Simulate realistic payment processing delay (1-3 seconds)
    processing_delay = random.uniform(1.0, 3.0)
    time.sleep(processing_delay)
    
    # Generate realistic transaction ID
    transaction_id = f'TXN{datetime.now().strftime("%Y%m%d")}{random.randint(100000, 999999)}'
    
    # Determine payment outcome
    if force_success is not None:
        # Explicitly set success/failure
        success = force_success
    elif force_failure_reason:
        # Force a specific failure type
        success = False
    else:
        # Realistic payment success rate (95% success, 5% failure)
        success = random.random() > 0.05
    
    # Payment failure scenarios with realistic reasons
    failure_scenarios = [
        {
            'code': 'card_declined',
            'reason': 'insufficient_funds',
            'message': 'Your card was declined due to insufficient funds. Please use a different payment method.'
        },
        {
            'code': 'card_declined',
            'reason': 'generic_decline',
            'message': 'Your card was declined. Please contact your bank or use a different card.'
        },
        {
            'code': 'card_declined',
            'reason': 'expired_card',
            'message': 'Your card has expired. Please use a different payment method.'
        },
        {
            'code': 'processing_error',
            'reason': 'network_error',
            'message': 'Payment processing encountered a network error. Please try again.'
        },
        {
            'code': 'authentication_required',
            'reason': '3d_secure_failed',
            'message': 'Payment authentication failed. Please try again with a different card.'
        },
        {
            'code': 'card_declined',
            'reason': 'lost_card',
            'message': 'Your card was declined. Please contact your bank.'
        },
        {
            'code': 'card_declined',
            'reason': 'stolen_card',
            'message': 'Your card was declined for security reasons. Please use a different payment method.'
        }
    ]
    
    if success:
        # Successful payment
        # Update subscription status
        cursor.execute('''
            UPDATE subscriptions 
            SET status = 'active' 
            WHERE id = ?
        ''', (subscription_id,))
        
        # Create payment record
        cursor.execute('''
            INSERT INTO payments (subscription_id, amount, status, transaction_id)
            VALUES (?, ?, 'completed', ?)
        ''', (subscription_id, subscription['price'], transaction_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'message': 'Payment processed successfully',
            'amount': subscription['price'],
            'currency': 'USD',
            'status': 'completed',
            'processed_at': datetime.now().isoformat()
        }), 200
    else:
        # Failed payment - select a realistic failure scenario
        if force_failure_reason:
            # Find the specific failure reason
            failure = next((f for f in failure_scenarios if f['reason'] == force_failure_reason), failure_scenarios[0])
        else:
            # Random failure scenario
            failure = random.choice(failure_scenarios)
        
        # Create failed payment record with failure details
        cursor.execute('''
            INSERT INTO payments (subscription_id, amount, status, transaction_id)
            VALUES (?, ?, 'failed', ?)
        ''', (subscription_id, subscription['price'], transaction_id))
        
        # Update subscription status
        cursor.execute('''
            UPDATE subscriptions 
            SET status = 'payment_failed' 
            WHERE id = ?
        ''', (subscription_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': False,
            'transaction_id': transaction_id,
            'message': failure['message'],
            'error_code': failure['code'],
            'error_reason': failure['reason'],
            'amount': subscription['price'],
            'currency': 'USD',
            'status': 'failed',
            'processed_at': datetime.now().isoformat()
        }), 400

@app.route('/api/subscriptions/<int:user_id>', methods=['GET'])
def get_user_subscriptions(user_id):
    """Get all subscriptions for a user"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, p.name as plan_name, p.price, p.billing_cycle, p.features,
               u.email, u.name as user_name
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
    ''', (user_id,))
    
    subscriptions = cursor.fetchall()
    conn.close()
    
    result = []
    for sub in subscriptions:
        # Get latest payment
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM payments 
            WHERE subscription_id = ? 
            ORDER BY payment_date DESC 
            LIMIT 1
        ''', (sub['id'],))
        payment = cursor.fetchone()
        conn.close()
        
        result.append({
            'id': sub['id'],
            'plan_name': sub['plan_name'],
            'price': sub['price'],
            'billing_cycle': sub['billing_cycle'],
            'features': json.loads(sub['features']),
            'status': sub['status'],
            'start_date': sub['start_date'] if sub['start_date'] else None,
            'end_date': sub['end_date'] if sub['end_date'] else None,
            'next_billing_date': sub['next_billing_date'] if sub['next_billing_date'] else None,
            'auto_renew': bool(sub['auto_renew']),
            'last_payment': {
                'status': payment['status'] if payment else None,
                'transaction_id': payment['transaction_id'] if payment else None,
                'payment_date': payment['payment_date'] if payment else None
            } if payment else None
        })
    
    return jsonify(result), 200

@app.route('/api/subscriptions/status/<int:subscription_id>', methods=['GET'])
def get_subscription_status(subscription_id):
    """Get detailed status of a subscription"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, p.name as plan_name, p.price, p.billing_cycle, p.features,
               u.email, u.name as user_name
        FROM subscriptions s
        JOIN plans p ON s.plan_id = p.id
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
    ''', (subscription_id,))
    
    subscription = cursor.fetchone()
    if not subscription:
        conn.close()
        return jsonify({'error': 'Subscription not found'}), 404
    
    # Get all payments for this subscription
    cursor.execute('''
        SELECT * FROM payments 
        WHERE subscription_id = ? 
        ORDER BY payment_date DESC
    ''', (subscription_id,))
    payments = cursor.fetchall()
    
    conn.close()
    
    return jsonify({
        'id': subscription['id'],
        'user': {
            'id': subscription['user_id'],
            'name': subscription['user_name'],
            'email': subscription['email']
        },
        'plan': {
            'id': subscription['plan_id'],
            'name': subscription['plan_name'],
            'price': subscription['price'],
            'billing_cycle': subscription['billing_cycle'],
            'features': json.loads(subscription['features'])
        },
        'status': subscription['status'],
        'start_date': subscription['start_date'],
        'end_date': subscription['end_date'],
        'next_billing_date': subscription['next_billing_date'],
        'auto_renew': bool(subscription['auto_renew']),
        'payments': [{
            'id': p['id'],
            'amount': p['amount'],
            'status': p['status'],
            'transaction_id': p['transaction_id'],
            'payment_date': p['payment_date']
        } for p in payments]
    }), 200

@app.route('/api/subscriptions/<int:subscription_id>/renew', methods=['POST'])
def renew_subscription(subscription_id):
    """Handle subscription renewal"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT s.*, p.price, p.billing_cycle 
        FROM subscriptions s 
        JOIN plans p ON s.plan_id = p.id 
        WHERE s.id = ?
    ''', (subscription_id,))
    subscription = cursor.fetchone()
    
    if not subscription:
        conn.close()
        return jsonify({'error': 'Subscription not found'}), 404
    
    if subscription['status'] not in ['active', 'expiring_soon']:
        conn.close()
        return jsonify({'error': 'Subscription cannot be renewed'}), 400
    
    # Calculate new dates
    current_end = datetime.fromisoformat(subscription['end_date'])
    if subscription['billing_cycle'] == 'monthly':
        new_end = current_end + timedelta(days=30)
    else:
        new_end = current_end + timedelta(days=365)
    
    # Update subscription
    cursor.execute('''
        UPDATE subscriptions 
        SET end_date = ?, next_billing_date = ?, status = 'active'
        WHERE id = ?
    ''', (new_end, new_end, subscription_id))
    
    # Create payment record
    transaction_id = f'TXN{random.randint(100000, 999999)}'
    cursor.execute('''
        INSERT INTO payments (subscription_id, amount, status, transaction_id)
        VALUES (?, ?, 'completed', ?)
    ''', (subscription_id, subscription['price'], transaction_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'transaction_id': transaction_id,
        'new_end_date': new_end.isoformat(),
        'message': 'Subscription renewed successfully'
    }), 200

@app.route('/api/subscriptions/<int:subscription_id>/cancel', methods=['POST'])
def cancel_subscription(subscription_id):
    """Cancel a subscription (no auto-renewal)"""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM subscriptions WHERE id = ?', (subscription_id,))
    subscription = cursor.fetchone()
    
    if not subscription:
        conn.close()
        return jsonify({'error': 'Subscription not found'}), 404
    
    cursor.execute('''
        UPDATE subscriptions 
        SET auto_renew = 0, status = 'cancelled'
        WHERE id = ?
    ''', (subscription_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Subscription cancelled. It will remain active until the end of the billing period.'
    }), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    email = data.get('email')
    name = data.get('name')
    
    if not all([email, name]):
        return jsonify({'error': 'Missing email or name'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute('INSERT INTO users (email, name) VALUES (?, ?)', (email, name))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'id': user_id,
            'email': email,
            'name': name
        }), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'User with this email already exists'}), 400

@app.route('/api/users/<email>', methods=['GET'])
def get_user_by_email(email):
    """Get user by email"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'created_at': user['created_at']
    }), 200

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)


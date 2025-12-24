import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Header Component
function Header() {
  return (
    <header style={{ background: 'white', padding: '20px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none', color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>
          Subscription System
        </Link>
      </div>
    </header>
  );
}

// Home Page - View Plans
function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans`);
      setPlans(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load plans');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading plans...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const monthlyPlans = plans.filter(p => p.billing_cycle === 'monthly');
  const yearlyPlans = plans.filter(p => p.billing_cycle === 'yearly');

  return (
    <div className="container">
      <h1 className="text-center mb-4">Choose Your Plan</h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '20px' }}>Monthly Plans</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {monthlyPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>

      <div>
        <h2 style={{ marginBottom: '20px' }}>Annual Plans (Save 17%)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {yearlyPlans.map(plan => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Plan Card Component
function PlanCard({ plan }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ position: 'relative', border: '2px solid #e5e7eb', transition: 'all 0.3s' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{plan.name}</h3>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
          ${plan.price}
        </div>
        <div style={{ color: '#6b7280', marginTop: '5px' }}>
          per {plan.billing_cycle === 'monthly' ? 'month' : 'year'}
        </div>
      </div>

      <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
        {plan.features.map((feature, index) => (
          <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
            ✓ {feature}
          </li>
        ))}
      </ul>

      <button
        className="btn btn-primary"
        style={{ width: '100%' }}
        onClick={() => navigate(`/subscribe/${plan.id}`)}
      >
        Subscribe Now
      </button>
    </div>
  );
}

// Subscribe Page
function SubscribePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/plans/${planId}`);
      setPlan(response.data);
      setLoading(false);
    } catch (err) {
      setError('Plan not found');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/subscribe`, {
        ...formData,
        plan_id: parseInt(planId)
      });
      
      navigate(`/payment/${response.data.subscription_id}`, {
        state: { plan, subscriptionId: response.data.subscription_id }
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create subscription');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error && !plan) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="text-center mb-4">Subscribe to {plan?.name}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card mb-3">
        <h3 style={{ marginBottom: '10px' }}>Plan Details</h3>
        <p><strong>Price:</strong> ${plan?.price} per {plan?.billing_cycle === 'monthly' ? 'month' : 'year'}</p>
        <p><strong>Features:</strong></p>
        <ul>
          {plan?.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Your Information</h3>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Payment Page
function PaymentPage() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [success, setSuccess] = useState(false);
  const [transactionInfo, setTransactionInfo] = useState(null);

  const handlePayment = async (forceSuccess = null, failureReason = null) => {
    setProcessing(true);
    setError(null);
    setErrorDetails(null);
    setTransactionInfo(null);

    try {
      const requestData = {
        subscription_id: parseInt(subscriptionId)
      };
      
      if (forceSuccess !== null) {
        requestData.force_success = forceSuccess;
      }
      
      if (failureReason) {
        requestData.force_failure_reason = failureReason;
      }

      const response = await axios.post(`${API_BASE_URL}/payment/simulate`, requestData);

      if (response.data.success) {
        setSuccess(true);
        setTransactionInfo(response.data);
        setTimeout(() => {
          navigate(`/subscription/${subscriptionId}`);
        }, 2500);
      } else {
        setError(response.data.message);
        setErrorDetails({
          code: response.data.error_code,
          reason: response.data.error_reason,
          transaction_id: response.data.transaction_id
        });
        setProcessing(false);
      }
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.message || errorData?.error || 'Payment processing failed');
      setErrorDetails(errorData ? {
        code: errorData.error_code,
        reason: errorData.error_reason,
        transaction_id: errorData.transaction_id
      } : null);
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="card">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', color: '#10b981' }}>✓</div>
            <h2 style={{ color: '#10b981', marginBottom: '10px' }}>Payment Successful!</h2>
            {transactionInfo && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', borderRadius: '6px', textAlign: 'left' }}>
                <p style={{ marginBottom: '8px' }}><strong>Transaction ID:</strong> {transactionInfo.transaction_id}</p>
                <p style={{ marginBottom: '8px' }}><strong>Amount:</strong> ${transactionInfo.amount}</p>
                <p style={{ marginBottom: '8px' }}><strong>Status:</strong> {transactionInfo.status}</p>
              </div>
            )}
            <p style={{ marginTop: '20px' }}>Your subscription is now active. Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  const failureScenarios = [
    { value: 'insufficient_funds', label: 'Insufficient Funds', description: 'Card declined due to insufficient funds' },
    { value: 'expired_card', label: 'Expired Card', description: 'Payment card has expired' },
    { value: 'generic_decline', label: 'Card Declined', description: 'Generic card decline from bank' },
    { value: 'network_error', label: 'Network Error', description: 'Payment processing network error' },
    { value: '3d_secure_failed', label: '3D Secure Failed', description: 'Payment authentication failed' },
  ];

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <h1 className="text-center mb-4">Payment Processing</h1>

      {error && (
        <div className="alert alert-error">
          <strong>Payment Failed</strong>
          <p style={{ marginTop: '8px', marginBottom: '0' }}>{error}</p>
          {errorDetails && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #fca5a5', fontSize: '14px' }}>
              <p style={{ marginBottom: '4px' }}><strong>Error Code:</strong> {errorDetails.code}</p>
              <p style={{ marginBottom: '4px' }}><strong>Reason:</strong> {errorDetails.reason}</p>
              {errorDetails.transaction_id && (
                <p style={{ marginBottom: '0' }}><strong>Transaction ID:</strong> {errorDetails.transaction_id}</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '10px' }}>Process Payment</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete your subscription by processing the payment. Payment processing typically takes 1-3 seconds.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <button
              className="btn btn-success"
              onClick={() => handlePayment(true)}
              disabled={processing}
              style={{ flex: 1, minWidth: '150px' }}
            >
              {processing ? 'Processing Payment...' : 'Process Payment'}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handlePayment(null)}
              disabled={processing}
              style={{ flex: 1, minWidth: '150px' }}
            >
              {processing ? 'Processing Payment...' : 'Process Payment (Auto)'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px', padding: '16px', background: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#991b1b' }}>Error Scenarios</h4>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Common payment error scenarios:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {failureScenarios.map((scenario) => (
              <button
                key={scenario.value}
                className="btn btn-danger"
                onClick={() => handlePayment(false, scenario.value)}
                disabled={processing}
                style={{ fontSize: '14px', padding: '10px 16px' }}
                title={scenario.description}
              >
                {scenario.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Subscription Status Page
function SubscriptionStatusPage() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renewing, setRenewing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/status/${subscriptionId}`);
      setSubscription(response.data);
      setLoading(false);
    } catch (err) {
      setError('Subscription not found');
      setLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!window.confirm('Are you sure you want to renew this subscription now?')) return;

    setRenewing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/${subscriptionId}/renew`);
      alert(response.data.message);
      fetchSubscription();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to renew subscription');
    } finally {
      setRenewing(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this subscription? It will remain active until the end of the billing period.')) return;

    setCancelling(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`);
      alert(response.data.message);
      fetchSubscription();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel subscription');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading">Loading subscription details...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!subscription) return null;

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-active',
      pending: 'badge-pending',
      cancelled: 'badge-cancelled',
      payment_failed: 'badge-payment_failed'
    };
    return badges[status] || 'badge';
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link to="/" className="btn btn-secondary">← Back to Plans</Link>
      </div>

      <h1 className="mb-4">Subscription Details</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{subscription.plan.name}</h2>
          <span className={`badge ${getStatusBadge(subscription.status)}`}>
            {subscription.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>User</p>
            <p style={{ fontWeight: '600' }}>{subscription.user.name}</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>{subscription.user.email}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Price</p>
            <p style={{ fontWeight: '600' }}>${subscription.plan.price} per {subscription.plan.billing_cycle}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Start Date</p>
            <p style={{ fontWeight: '600' }}>{new Date(subscription.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>End Date</p>
            <p style={{ fontWeight: '600' }}>{new Date(subscription.end_date).toLocaleDateString()}</p>
          </div>
          {subscription.next_billing_date && (
            <div>
              <p style={{ color: '#6b7280', marginBottom: '5px' }}>Next Billing Date</p>
              <p style={{ fontWeight: '600' }}>{new Date(subscription.next_billing_date).toLocaleDateString()}</p>
            </div>
          )}
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Auto Renewal</p>
            <p style={{ fontWeight: '600' }}>{subscription.auto_renew ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '10px' }}>Plan Features</h3>
          <ul>
            {subscription.plan.features.map((feature, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>{feature}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {subscription.status === 'active' && (
            <>
              <button
                className="btn btn-success"
                onClick={handleRenew}
                disabled={renewing}
              >
                {renewing ? 'Processing...' : 'Renew Now'}
              </button>
              {subscription.auto_renew && (
                <button
                  className="btn btn-danger"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
            </>
          )}
          {subscription.status === 'payment_failed' && (
            <Link
              to={`/payment/${subscriptionId}`}
              className="btn btn-primary"
            >
              Retry Payment
            </Link>
          )}
        </div>
      </div>

      {subscription.payments && subscription.payments.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Payment History</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Transaction ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscription.payments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{new Date(payment.payment_date).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>${payment.amount}</td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '14px' }}>{payment.transaction_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${payment.status === 'completed' ? 'badge-active' : 'badge-payment_failed'}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// User Subscriptions Page
function UserSubscriptionsPage() {
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, get user by email
      const userResponse = await axios.get(`${API_BASE_URL}/users/${email}`);
      const userId = userResponse.data.id;
      setUserId(userId);

      // Then get subscriptions
      const subsResponse = await axios.get(`${API_BASE_URL}/subscriptions/${userId}`);
      setSubscriptions(subsResponse.data);
    } catch (err) {
      setError('User not found or no subscriptions');
      setUserId(null);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 className="mb-4">My Subscriptions</h1>

      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>View Your Subscriptions</h3>
        <form onSubmit={handleSearch}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'View Subscriptions'}
          </button>
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {subscriptions.length > 0 && (
        <div>
          <h2 className="mb-3">Your Subscriptions</h2>
          {subscriptions.map(sub => (
            <div key={sub.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3>{sub.plan_name}</h3>
                <span className={`badge ${sub.status === 'active' ? 'badge-active' : getStatusBadge(sub.status)}`}>
                  {sub.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Price</p>
                  <p style={{ fontWeight: '600' }}>${sub.price} per {sub.billing_cycle}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Status</p>
                  <p style={{ fontWeight: '600' }}>{sub.status}</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Next Billing</p>
                  <p style={{ fontWeight: '600' }}>{sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <Link to={`/subscription/${sub.id}`} className="btn btn-primary">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  const badges = {
    active: 'badge-active',
    pending: 'badge-pending',
    cancelled: 'badge-cancelled',
    payment_failed: 'badge-payment_failed'
  };
  return badges[status] || 'badge';
}

// Main App Component
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<PlansPage />} />
        <Route path="/subscribe/:planId" element={<SubscribePage />} />
        <Route path="/payment/:subscriptionId" element={<PaymentPage />} />
        <Route path="/subscription/:subscriptionId" element={<SubscriptionStatusPage />} />
        <Route path="/my-subscriptions" element={<UserSubscriptionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;




import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import '../Login/Auth.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address_line1: '',
    address_line2: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      addToast('Account created successfully with delivery address!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter container">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <h2>Register Account</h2>
        <p className="auth-sub">Join Creamy Bites for fast ordering &amp; rewards</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border)' }} />

          {/* ── Single Delivery Address Field ── */}
          <div className="form-group">
            <label>Delivery Address *</label>
            <input
              type="text"
              placeholder="House / Flat No., Street, Area, Landmark"
              value={formData.address_line1}
              onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>City (Chennai only)</label>
              <input
                type="text"
                value={formData.city}
                readOnly
                style={{ background: '#f8fafc', color: '#475569' }}
              />
            </div>
            <div className="form-group">
              <label>Pincode *</label>
              <input
                type="text"
                placeholder="600017"
                maxLength={6}
                value={formData.pincode}
                onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>
          </div>

          <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border)' }} />

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register & Save Details'}
          </button>
        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

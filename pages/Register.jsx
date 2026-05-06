import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Password must have uppercase, number and special character (e.g. Admin123!)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1 className="auth-brand">✦ Yoya Hotel</h1>
          <div className="auth-decorative-line" />
          <p className="auth-tagline">
            Join the platform and start managing your hotel with elegance and efficiency.
          </p>
          <div style={{ marginTop: 40, padding: '16px', background: 'rgba(201,168,76,0.08)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)' }}>
            <p style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 8 }}>⚠ Password Requirements</p>
            {['At least 8 characters', 'One uppercase letter (A-Z)', 'One number (0-9)', 'One special character (!@#$%)'].map(r => (
              <p key={r} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>• {r}</p>
            ))}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 8 }}>Example: MyPass123!</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">Register to access the hotel management system</p>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" type="text" name="fullName" value={form.fullName}
                onChange={handleChange} placeholder="John Smith" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="john@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="e.g. MyPass123!" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleChange} placeholder="Repeat password" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 22px' }}>
              {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

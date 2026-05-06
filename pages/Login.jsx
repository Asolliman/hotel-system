import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data || err.response?.data?.message || 'Invalid email or password.');
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
            A refined platform for managing reservations, rooms, guests, and operations — all in one place.
          </p>
          <div style={{ marginTop: 48 }}>
            {['Room Management', 'Guest Reservations', 'Admin Dashboard'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ color: 'var(--gold)', fontSize: 12 }}>✦</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: '16px', background: 'rgba(201,168,76,0.08)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.2)' }}>
            <p style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 6 }}>🔑 Default Admin Account</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Email: admin@hotel.com</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Password: Admin123!</p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to access the management portal</p>

          {error && <div className="alert alert-error">⚠ {typeof error === 'string' ? error : 'Login failed.'}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="admin@hotel.com" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 22px' }}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

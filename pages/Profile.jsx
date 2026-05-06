import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phoneNumber: '', address: '', nationalId: '', dateOfBirth: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/profile');
        setProfile(res.data);
        setForm({
          phoneNumber: res.data.phoneNumber || '',
          address: res.data.address || '',
          nationalId: res.data.nationalId || '',
          dateOfBirth: res.data.dateOfBirth ? res.data.dateOfBirth.split('T')[0] : '',
        });
        setIsNew(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setIsNew(true);
          setEditing(true);
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload = {
        phoneNumber: form.phoneNumber,
        address: form.address,
        nationalId: form.nationalId,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : null,
      };
      if (isNew) {
        await api.post('/profile', payload);
      } else {
        await api.put('/profile', payload);
      }
      setProfile(payload);
      setIsNew(false);
      setEditing(false);
      setSuccess('Profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-state" style={{ marginTop: 60 }}><div className="spinner" /> Loading profile...</div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>My Profile</h2>
          <p>View and update your guest profile information</p>
        </div>
        {!editing && profile && (
          <button className="btn btn-gold" onClick={() => { setEditing(true); setSuccess(''); }}>Edit Profile</button>
        )}
      </div>

      <div className="page-body">
        <div style={{ maxWidth: 600 }}>
          {isNew && (
            <div className="alert alert-success" style={{ marginBottom: 20 }}>
              👋 You don't have a profile yet. Fill in your details below to create one!
            </div>
          )}
          {error && <div className="alert alert-error">⚠ {error}</div>}
          {success && <div className="alert alert-success">✅ {success}</div>}

          <div className="card">
            <div className="card-header">
              <h3>{isNew ? 'Create Profile' : editing ? 'Edit Profile' : 'Profile Details'}</h3>
            </div>
            <div className="card-body">
              {editing ? (
                <>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" name="phoneNumber" value={form.phoneNumber}
                      onChange={handleChange} placeholder="+20 1234567890" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">National ID *</label>
                    <input className="form-control" name="nationalId" value={form.nationalId}
                      onChange={handleChange} placeholder="Your national ID number" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input className="form-control" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" name="address" value={form.address}
                      onChange={handleChange} rows={3} placeholder="Your home address..." />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {!isNew && <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>}
                    <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
                      {saving ? <><span className="spinner" /> Saving...</> : 'Save Profile'}
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  {[
                    ['Phone Number', profile?.phoneNumber],
                    ['National ID', profile?.nationalId],
                    ['Date of Birth', profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'],
                    ['Address', profile?.address],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: 140, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingTop: 2 }}>{label}</span>
                      <span style={{ flex: 1, fontSize: 15 }}>{value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

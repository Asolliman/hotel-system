import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const EMPTY = { name: '', description: '', basePrice: '' };

const RoomTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      const res = await api.get('/roomtypes');
      setTypes(Array.isArray(res.data) ? res.data : []);
    } catch { setTypes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(EMPTY); setSelected(null); setError(''); setModal('add'); };
  const openEdit = (t) => { setForm({ name: t.name, description: t.description || '', basePrice: t.basePrice }); setSelected(t); setError(''); setModal('edit'); };
  const openDelete = (t) => { setSelected(t); setModal('delete'); };
  const close = () => { setModal(null); setSaving(false); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, basePrice: parseFloat(form.basePrice) };
      if (modal === 'add') await api.post('/roomtypes', payload);
      else await api.put(`/roomtypes/${selected.id}`, payload);
      await fetch(); close();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/roomtypes/${selected.id}`);
      await fetch(); close();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete.');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Room Types</h2>
          <p>Configure room categories and base pricing</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd}>+ Add Room Type</button>
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading...</div>
          ) : types.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🏷</div><p>No room types yet. Add your first one!</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Description</th><th>Base Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {types.map(t => (
                  <tr key={t.id}>
                    <td><strong>{t.name}</strong></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.description || '—'}</td>
                    <td style={{ fontWeight: 600, color: 'var(--success)' }}>${parseFloat(t.basePrice || 0).toFixed(2)}/night</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Room Type' : 'Edit Room Type'} onClose={close}
          footer={<>
            <button className="btn btn-outline" onClick={close}>Cancel</button>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save'}
            </button>
          </>}>
          {error && <div className="alert alert-error">⚠ {error}</div>}
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input className="form-control" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Suite, Deluxe, Standard" required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description..." />
          </div>
          <div className="form-group">
            <label className="form-label">Base Price per Night ($) *</label>
            <input className="form-control" type="number" name="basePrice" value={form.basePrice} onChange={handleChange} placeholder="150.00" min="1" step="0.01" required />
          </div>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Room Type" onClose={close} footer={<>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
            {saving ? <><span className="spinner" /> Deleting...</> : 'Yes, Delete'}
          </button>
        </>}>
          <p style={{ color: 'var(--text-secondary)' }}>Delete room type <strong>{selected?.name}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default RoomTypes;

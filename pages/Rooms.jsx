import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const EMPTY = { roomNumber: '', floor: '1', pricePerNight: '', isAvailable: true, roomTypeId: '' };

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchAll = async () => {
    try {
      const [rRes, tRes] = await Promise.all([api.get('/rooms'), api.get('/roomtypes')]);
      setRooms(Array.isArray(rRes.data) ? rRes.data : []);
      setRoomTypes(Array.isArray(tRes.data) ? tRes.data : []);
    } catch { setRooms([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setSelected(null); setError(''); setModal('add'); };
  const openEdit = (r) => {
    setForm({ roomNumber: r.roomNumber, floor: r.floor, pricePerNight: r.pricePerNight, isAvailable: r.isAvailable, roomTypeId: r.roomTypeId });
    setSelected(r); setError(''); setModal('edit');
  };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close = () => { setModal(null); setSaving(false); };

  const handleChange = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        roomNumber: form.roomNumber,
        floor: parseInt(form.floor) || 1,
        pricePerNight: parseFloat(form.pricePerNight),
        isAvailable: form.isAvailable,
        roomTypeId: parseInt(form.roomTypeId),
      };
      if (modal === 'add') await api.post('/rooms', payload);
      else await api.put(`/rooms/${selected.id}`, payload);
      await fetchAll(); close();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save room.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/rooms/${selected.id}`);
      await fetchAll(); close();
    } catch (err) {
      setError(err.response?.data || 'Failed to delete.');
    } finally { setSaving(false); }
  };

  const getTypeName = id => roomTypes.find(t => t.id === parseInt(id))?.name || `Type #${id}`;

  const filtered = rooms.filter(r =>
    r.roomNumber?.toString().toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Rooms</h2>
          <p>Manage all hotel rooms</p>
        </div>
        <button className="btn btn-gold" onClick={openAdd}>+ Add Room</button>
      </div>

      <div className="page-body">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input className="form-control" placeholder="Search by room number..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{filtered.length} rooms</span>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading rooms...</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🛏</div><p>No rooms found.</p></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Room #</th><th>Floor</th><th>Type</th><th>Price / Night</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td><strong>#{r.roomNumber}</strong></td>
                    <td>Floor {r.floor}</td>
                    <td><span className="badge badge-info">{getTypeName(r.roomTypeId)}</span></td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(r.pricePerNight || 0).toFixed(2)}</td>
                    <td><span className={`badge ${r.isAvailable ? 'badge-success' : 'badge-danger'}`}>{r.isAvailable ? 'Available' : 'Occupied'}</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(r)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDelete(r)}>Delete</button>
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
        <Modal title={modal === 'add' ? 'Add New Room' : 'Edit Room'} onClose={close}
          footer={<>
            <button className="btn btn-outline" onClick={close}>Cancel</button>
            <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Room'}
            </button>
          </>}>
          {error && <div className="alert alert-error">⚠ {typeof error === 'string' ? error : JSON.stringify(error)}</div>}
          <div className="form-group">
            <label className="form-label">Room Type *</label>
            <select className="form-control" name="roomTypeId" value={form.roomTypeId} onChange={handleChange} required>
              <option value="">Select room type...</option>
              {roomTypes.map(t => <option key={t.id} value={t.id}>{t.name} — ${t.basePrice}/night</option>)}
            </select>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Room Number *</label>
              <input className="form-control" name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="101" required />
            </div>
            <div className="form-group">
              <label className="form-label">Floor (1–50) *</label>
              <input className="form-control" type="number" name="floor" value={form.floor} onChange={handleChange} placeholder="1" min="1" max="50" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Price per Night ($) *</label>
            <input className="form-control" type="number" name="pricePerNight" value={form.pricePerNight} onChange={handleChange} placeholder="150.00" min="1" step="0.01" required />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="isAvailable" name="isAvailable" checked={form.isAvailable} onChange={handleChange} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="isAvailable" style={{ cursor: 'pointer', fontSize: 14 }}>Room is currently available</label>
          </div>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete Room" onClose={close} footer={<>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
            {saving ? <><span className="spinner" /> Deleting...</> : 'Yes, Delete'}
          </button>
        </>}>
          <p style={{ color: 'var(--text-secondary)' }}>Delete <strong>Room #{selected?.roomNumber}</strong>? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
};

export default Rooms;

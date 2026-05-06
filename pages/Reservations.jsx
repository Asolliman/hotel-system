import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const EMPTY = { roomId: '', checkInDate: '', checkOutDate: '' };

const Reservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'Admin' || user?.role === 'Receptionist';
  const isGuest = user?.role === 'Guest';

  const fetchAll = async () => {
    try {
      const endpoint = isAdmin ? '/reservations' : '/reservations/my';
      const [rRes, roomsRes] = await Promise.all([api.get(endpoint), api.get('/rooms')]);
      setReservations(Array.isArray(rRes.data) ? rRes.data : []);
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
    } catch { setReservations([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setSelected(null); setError(''); setModal('add'); };
  const openView = (r) => { setSelected(r); setModal('view'); };
  const openDelete = (r) => { setSelected(r); setModal('delete'); };
  const close = () => { setModal(null); setSaving(false); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/reservations', {
        roomId: parseInt(form.roomId),
        checkInDate: new Date(form.checkInDate).toISOString(),
        checkOutDate: new Date(form.checkOutDate).toISOString(),
      });
      await fetchAll(); close();
    } catch (err) {
      setError(err.response?.data || 'Failed to create reservation.');
    } finally { setSaving(false); }
  };

  const handleConfirm = async (id) => {
    try {
      await api.put(`/reservations/${id}/confirm`);
      await fetchAll();
    } catch (err) {
      alert(err.response?.data || 'Failed to confirm.');
    }
  };

  const handleCancel = async () => {
    setSaving(true);
    try {
      await api.delete(`/reservations/${selected.id}/cancel`);
      await fetchAll(); close();
    } catch (err) {
      setError(err.response?.data || 'Failed to cancel.');
    } finally { setSaving(false); }
  };

  const getRoomInfo = id => {
    const r = rooms.find(r => r.id === parseInt(id));
    return r ? `Room #${r.roomNumber}` : `Room #${id}`;
  };

  const calcNights = (ci, co) => {
    if (!ci || !co) return 0;
    return Math.max(0, Math.round((new Date(co) - new Date(ci)) / 86400000));
  };

  const statusBadge = s => {
    const map = { Pending: 'warning', Confirmed: 'success', Cancelled: 'danger', Completed: 'info' };
    return <span className={`badge badge-${map[s] || 'warning'}`}>{s || 'Pending'}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Reservations</h2>
          <p>{isAdmin ? 'All reservations in the system' : 'Your personal reservations'}</p>
        </div>
        {isGuest && <button className="btn btn-gold" onClick={openAdd}>+ New Reservation</button>}
      </div>

      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading-state"><div className="spinner" /> Loading...</div>
          ) : reservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>{isGuest ? 'You have no reservations yet. Click "+ New Reservation" to book a room!' : 'No reservations in the system.'}</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  {isAdmin && <th>Guest</th>}
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{r.id}</td>
                    {isAdmin && <td style={{ fontSize: 13 }}>{r.guestName || r.userId || '—'}</td>}
                    <td>{getRoomInfo(r.roomId)}</td>
                    <td style={{ fontSize: 13 }}>{r.checkInDate ? new Date(r.checkInDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 13 }}>{r.checkOutDate ? new Date(r.checkOutDate).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 13 }}>{calcNights(r.checkInDate, r.checkOutDate)}n</td>
                    <td style={{ fontWeight: 600 }}>${parseFloat(r.totalPrice || r.totalAmount || 0).toFixed(2)}</td>
                    <td>{statusBadge(r.status)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-sm" onClick={() => openView(r)}>View</button>
                        {isAdmin && r.status === 'Pending' && (
                          <button className="btn btn-gold btn-sm" onClick={() => handleConfirm(r.id)}>Confirm</button>
                        )}
                        {(isAdmin || isGuest) && r.status !== 'Cancelled' && (
                          <button className="btn btn-danger btn-sm" onClick={() => openDelete(r)}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Reservation Modal (Guest only) */}
      {modal === 'add' && (
        <Modal title="New Reservation" onClose={close} footer={<>
          <button className="btn btn-outline" onClick={close}>Cancel</button>
          <button className="btn btn-gold" onClick={handleCreate} disabled={saving}>
            {saving ? <><span className="spinner" /> Booking...</> : 'Book Room'}
          </button>
        </>}>
          {error && <div className="alert alert-error">⚠ {typeof error === 'string' ? error : JSON.stringify(error)}</div>}
          <div className="form-group">
            <label className="form-label">Select Room *</label>
            <select className="form-control" name="roomId" value={form.roomId} onChange={handleChange} required>
              <option value="">Choose a room...</option>
              {rooms.filter(r => r.isAvailable).map(r => (
                <option key={r.id} value={r.id}>Room #{r.roomNumber} — ${r.pricePerNight}/night</option>
              ))}
            </select>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Check-in Date *</label>
              <input className="form-control" type="date" name="checkInDate" value={form.checkInDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div className="form-group">
              <label className="form-label">Check-out Date *</label>
              <input className="form-control" type="date" name="checkOutDate" value={form.checkOutDate} onChange={handleChange}
                min={form.checkInDate || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>
          {form.roomId && form.checkInDate && form.checkOutDate && (
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
              <span style={{ fontSize: 13 }}>
                {calcNights(form.checkInDate, form.checkOutDate)} nights ×
                ${parseFloat(rooms.find(r => r.id === parseInt(form.roomId))?.pricePerNight || 0).toFixed(2)} =
                <strong style={{ color: 'var(--navy)', fontSize: 16, marginLeft: 6 }}>
                  ${(calcNights(form.checkInDate, form.checkOutDate) * (rooms.find(r => r.id === parseInt(form.roomId))?.pricePerNight || 0)).toFixed(2)}
                </strong>
              </span>
            </div>
          )}
        </Modal>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <Modal title={`Reservation #${selected.id}`} onClose={close} footer={<button className="btn btn-outline" onClick={close}>Close</button>}>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              ['Room', getRoomInfo(selected.roomId)],
              ['Check-in', selected.checkInDate ? new Date(selected.checkInDate).toLocaleDateString() : '—'],
              ['Check-out', selected.checkOutDate ? new Date(selected.checkOutDate).toLocaleDateString() : '—'],
              ['Nights', `${calcNights(selected.checkInDate, selected.checkOutDate)} nights`],
              ['Total', `$${parseFloat(selected.totalPrice || selected.totalAmount || 0).toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                <span style={{ width: 120, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', paddingTop: 2 }}>{label}</span>
                <span style={{ flex: 1, fontSize: 14 }}>{value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', paddingTop: 4 }}>
              <span style={{ width: 120, fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</span>
              {statusBadge(selected.status)}
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Modal */}
      {modal === 'delete' && (
        <Modal title="Cancel Reservation" onClose={close} footer={<>
          <button className="btn btn-outline" onClick={close}>Go Back</button>
          <button className="btn btn-danger" onClick={handleCancel} disabled={saving}>
            {saving ? <><span className="spinner" /> Cancelling...</> : 'Yes, Cancel It'}
          </button>
        </>}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Cancel reservation <strong>#{selected?.id}</strong> for <strong>{getRoomInfo(selected?.roomId)}</strong>? This cannot be undone.
          </p>
          {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
        </Modal>
      )}
    </div>
  );
};

export default Reservations;

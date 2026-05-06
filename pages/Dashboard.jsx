import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const StatCard = ({ icon, value, label }) => (
  <div className="stat-card">
    <span className="stat-icon" style={{ fontSize: 36 }}>{icon}</span>
    <div className="stat-value" style={{ fontSize: 48 }}>{value ?? '—'}</div>
    <div className="stat-label" style={{ fontSize: 14, marginTop: 8 }}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ rooms: 0, roomTypes: 0, reservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [roomsRes, typesRes] = await Promise.allSettled([
          api.get('/rooms'),
          api.get('/roomtypes'),
        ]);
        const rooms = roomsRes.status === 'fulfilled' ? roomsRes.value.data : [];
        const types = typesRes.status === 'fulfilled' ? typesRes.value.data : [];

        let reservations = [];
        try {
          if (user?.role === 'Admin' || user?.role === 'Receptionist') {
            const rRes = await api.get('/reservations');
            reservations = rRes.data;
          } else {
            const rRes = await api.get('/reservations/my');
            reservations = rRes.data;
          }
        } catch {}

        setStats({
          rooms: Array.isArray(rooms) ? rooms.length : 0,
          roomTypes: Array.isArray(types) ? types.length : 0,
          reservations: Array.isArray(reservations) ? reservations.length : 0,
        });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const QuickLink = ({ icon, title, desc, to }) => (
    <button onClick={() => navigate(to)} style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
      background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      cursor: 'pointer', textAlign: 'left', transition: 'var(--transition)', width: '100%',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <span style={{ fontSize: 28 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 500, fontSize: 16, color: 'var(--navy)' }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</div>
      </div>
      <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: 20 }}>→</span>
    </button>
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h2 style={{ fontSize: 48 }}>{greeting()}, {user?.name || 'Manager'}</h2>
          <p style={{ fontSize: 17, marginTop: 8 }}>
            Logged in as <strong>{user?.role}</strong> — welcome to Yoya Hotel Management
          </p>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-state"><div className="spinner" /> Loading...</div>
        ) : (
          <>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <StatCard icon="🛏" value={stats.rooms} label="Total Rooms" />
              <StatCard icon="🏷" value={stats.roomTypes} label="Room Types" />
              <StatCard icon="📋" value={stats.reservations} label={user?.role === 'Guest' ? 'My Reservations' : 'All Reservations'} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: 22 }}>Quick Navigation</h3></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <QuickLink icon="🛏" title="Manage Rooms" desc="View, add, edit and delete rooms" to="/rooms" />
                  <QuickLink icon="🏷" title="Room Types" desc="Configure room categories and pricing" to="/room-types" />
                  <QuickLink icon="📋" title="Reservations" desc="Manage all bookings" to="/reservations" />
                  <QuickLink icon="👤" title="My Profile" desc="View and update your guest profile" to="/profile" />
                </div>
              </div>

              <div className="card">
                <div className="card-header"><h3 style={{ fontSize: 22 }}>Your Account</h3></div>
                <div className="card-body">
                  {[
                    ['Name', user?.name],
                    ['Email', user?.email],
                    ['Role', user?.role],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ width: 100, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: 15, color: 'var(--text-primary)', fontWeight: label === 'Role' ? 600 : 400 }}>{value || '—'}</span>
                    </div>
                  ))}
                  {user?.role === 'Guest' && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(201,168,76,0.08)', borderRadius: 6, border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        💡 As a Guest, you can browse rooms, make reservations, and manage your profile.
                      </p>
                    </div>
                  )}
                  {user?.role === 'Admin' && (
                    <div style={{ marginTop: 16, padding: 12, background: 'rgba(26,107,69,0.06)', borderRadius: 6, border: '1px solid rgba(26,107,69,0.2)' }}>
                      <p style={{ fontSize: 13, color: 'var(--success)' }}>
                        ✅ As Admin, you have full access to all features including room and reservation management.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

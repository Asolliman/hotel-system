import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '◈', label: 'Dashboard' },
  { path: '/rooms', icon: '🛏', label: 'Rooms' },
  { path: '/room-types', icon: '🏷', label: 'Room Types' },
  { path: '/reservations', icon: '📋', label: 'Reservations' },
  { path: '/profile', icon: '👤', label: 'My Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">✦</span>
        <h1>Yoya Hotel</h1>
        <p>Management System</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV_ITEMS.map(({ path, icon, label }) => (
          <NavLink key={path} to={path}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <p>{user?.name || 'User'}</p>
            <p style={{ textTransform: 'capitalize' }}>{user?.role || 'Guest'}</p>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>↩ Sign Out</button>
      </div>
    </aside>
  );
};

export default Sidebar;

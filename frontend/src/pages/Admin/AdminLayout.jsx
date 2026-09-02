import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products', label: 'Products', icon: '🧁' },
  { to: '/admin/orders', label: 'Orders', icon: '📦' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/inventory', label: 'Inventory', icon: '🏭' },
  { to: '/admin/loyalty', label: 'Loyalty Points', icon: '🪙' },
  { to: '/admin/analytics', label: 'Sales Analytics', icon: '📈' },
  { to: '/admin/prediction', label: 'Sales Prediction', icon: '🔮' },
];

const PAGE_TITLES = {
  '/admin': { title: 'Dashboard', sub: 'Overview of your bakery operations' },
  '/admin/products': { title: 'Products', sub: 'Manage your product catalog' },
  '/admin/orders': { title: 'Orders', sub: 'View and manage customer orders' },
  '/admin/customers': { title: 'Customers', sub: 'Customer directory and purchase history' },
  '/admin/inventory': { title: 'Inventory', sub: 'Track and update product stock levels' },
  '/admin/loyalty': { title: 'Loyalty Points', sub: 'Manage rewards and point rules' },
  '/admin/analytics': { title: 'Sales Analytics', sub: 'Revenue trends and performance insights' },
  '/admin/prediction': { title: 'Sales Prediction', sub: "Tomorrow's expected sales forecast" },
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = window.location.pathname;
  const pageInfo = PAGE_TITLES[path] || { title: 'Admin', sub: 'SVS Sweets & Bakery Management' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="admin-root">
      {/* ─── Sidebar ─── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <img src="/logo.png" alt="SVS Bakery" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 6 }} onError={(e) => { e.target.onerror = null; e.target.src = 'http://localhost:5000/uploads/logo.png'; }} />
          <div className="brand-info">
            <div className="brand-name">SVS Bakery</div>
            <div className="brand-sub">Management Console</div>
          </div>
        </div>

        <nav className="admin-nav">
          <div className="admin-nav-section">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ─── Main Area ─── */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-title">{pageInfo.title}</span>
            <span className="admin-topbar-sub">{pageInfo.sub}</span>
          </div>
          <div className="admin-topbar-right">
            <span className="admin-topbar-date">📅 {today}</span>
            <a href="/" target="_blank" className="admin-topbar-view-site">🛍️ View Site</a>
            <div className="admin-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

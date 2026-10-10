import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CalendarIcon from '../../components/CalendarIcon';
import './Admin.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/pos', label: '🛒 POS Billing' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/repeated-customers', label: '🔁 Repeated Customers' },
  { to: '/admin/new-customers', label: '🌱 New Customers' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/loyalty', label: 'Loyalty Points' },
  { to: '/admin/analytics', label: 'Sales Analytics' },
  { to: '/admin/prediction', label: 'Sales Prediction' },
];

const PAGE_TITLES = {
  '/admin': { title: 'Dashboard', sub: 'Overview of your bakery operations' },
  '/admin/pos': { title: 'POS Workstation', sub: 'In-Shop counter sales, stock deduction & rewards' },
  '/admin/products': { title: 'Products', sub: 'Manage your product catalog' },
  '/admin/orders': { title: 'Orders', sub: 'View and manage customer orders' },
  '/admin/customers': { title: 'Customers', sub: 'Customer directory and purchase history' },
  '/admin/repeated-customers': { title: 'Repeated Customers', sub: 'High-value repeat buyers & exclusive loyalty rewards' },
  '/admin/new-customers': { title: 'New Customers', sub: 'First-time buyers & welcome special offers' },
  '/admin/inventory': { title: 'Inventory', sub: 'Track and update product stock levels' },
  '/admin/loyalty': { title: 'Loyalty Points', sub: 'Manage rewards and point rules' },
  '/admin/analytics': { title: 'Sales Analytics', sub: 'Revenue trends and performance insights' },
  '/admin/prediction': { title: 'Sales Prediction', sub: "Tomorrow's expected sales forecast" },
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const path = window.location.pathname;
  const pageInfo = PAGE_TITLES[path] || { title: 'Admin', sub: 'Creamy Bites Management' };

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
          <img
            src="/logo.png"
            alt="Creamy Bites"
            style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 8 }}
            onError={(e) => { e.target.onerror = null; e.target.src = 'http://localhost:5000/uploads/logo.png'; }}
          />
          <div className="brand-info">
            <div className="brand-name">Creamy Bites</div>
            <div className="brand-sub">Management Console</div>
          </div>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
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
            <span className="admin-topbar-date" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarIcon size={18} color="#f59e0b" /> {today}
            </span>
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

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    adminAPI.getCustomers()
      .then(r => setCustomers(r.customers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openCustomer = (c) => {
    setSelectedCustomer(c);
    setDetailsLoading(true);
    adminAPI.getCustomerDetails(c.id)
      .then(r => setCustomerDetails(r))
      .catch(console.error)
      .finally(() => setDetailsLoading(false));
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">Customers ({filtered.length})</span>
          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <span>🔍</span>
              <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Total Spend</th>
                <th>Loyalty Points</th>
                <th>Last Order</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No customers found</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '.75rem', color: '#6b7a9d' }}>{c.email}</div>
                    </td>
                    <td>{c.phone || '—'}</td>
                    <td><strong>{c.total_orders}</strong></td>
                    <td>₹{(c.total_spend || 0).toFixed(2)}</td>
                    <td><span className="status-pill active">🪙 {c.loyalty_balance || 0} pts</span></td>
                    <td style={{ fontSize: '.78rem', color: '#6b7a9d' }}>
                      {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td>
                      <button className="btn-admin outline sm" onClick={() => openCustomer(c)}>
                        📜 History
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Customer Details Drawer / Modal ─── */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>
          <div className="admin-modal" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Customer Details: {selectedCustomer.name}</span>
              <button className="admin-modal-close" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>✕</button>
            </div>
            <div className="admin-modal-body">
              {detailsLoading ? (
                <div className="admin-loading"><div className="admin-spinner" /></div>
              ) : customerDetails ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
                    <div style={{ background: 'var(--admin-bg)', padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: '.72rem', color: '#6b7a9d', textTransform: 'uppercase' }}>Total Spent</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-navy)' }}>₹{(customerDetails.totalSpend || 0).toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'var(--admin-bg)', padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: '.72rem', color: '#6b7a9d', textTransform: 'uppercase' }}>Orders Count</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-navy)' }}>{(customerDetails.orders || []).length}</div>
                    </div>
                    <div style={{ background: 'var(--admin-bg)', padding: 14, borderRadius: 10 }}>
                      <div style={{ fontSize: '.72rem', color: '#6b7a9d', textTransform: 'uppercase' }}>Loyalty Balance</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--admin-gold)' }}>🪙 {customerDetails.loyaltyBalance || 0} pts</div>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '.9rem', fontWeight: 700, marginBottom: 10, color: 'var(--admin-navy)' }}>Purchase History</h4>
                  {(customerDetails.orders || []).length === 0 ? (
                    <div className="admin-empty" style={{ padding: 20 }}>No purchases made yet</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {(customerDetails.orders || []).map(o => (
                        <div key={o.id} style={{ border: '1px solid var(--admin-border)', borderRadius: 10, padding: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div>
                              <strong>Order #{String(o.id).slice(-6)}</strong>
                              <span style={{ fontSize: '.75rem', color: '#6b7a9d', marginLeft: 10 }}>
                                {new Date(o.created_at).toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span className={`status-pill ${o.order_status}`}>{(o.order_status || 'placed').replace(/_/g, ' ')}</span>
                          </div>
                          <div style={{ fontSize: '.82rem', color: '#6b7a9d', marginBottom: 8 }}>
                            Items: {(o.items || []).map(i => `${i.product_name} (${i.weight || ''} x${i.quantity})`).join(', ')}
                          </div>
                          <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--admin-navy)' }}>
                            Total: ₹{(o.total || 0).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

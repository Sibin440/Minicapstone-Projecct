import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminNewCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [offerModalCustomer, setOfferModalCustomer] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

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

  const getNewTier = (ordersCount) => {
    const count = Number(ordersCount) || 0;
    if (count === 1) {
      return {
        label: '🌱 First Order Placed',
        discount: '5% on 2nd Order',
        coupon: 'LOYAL5',
        bg: '#f1f5f9',
        color: '#334155',
        border: '#cbd5e1',
        desc: 'Eligible for 5% Repeat Discount on next order',
      };
    }
    return {
      label: '👤 New Registered (0 Orders)',
      discount: '10% Welcome Offer',
      coupon: 'WELCOME10',
      bg: '#f8fafc',
      color: '#64748b',
      border: '#e2e8f0',
      desc: '10% Welcome discount on their 1st purchase',
    };
  };

  // Only new customers (< 2 orders)
  const newList = customers.filter(c => (Number(c.total_orders) || 0) < 2);

  const filtered = newList.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const firstOrderCount = newList.filter(c => Number(c.total_orders) === 1).length;
  const zeroOrderCount = newList.filter(c => Number(c.total_orders) === 0).length;

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendWhatsAppWelcome = (customer, tierInfo) => {
    const code = tierInfo.coupon;
    const phone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const text = encodeURIComponent(
      `Hello ${customer.name}! 🍬\n\nWelcome to *Creamy Bites* Bakery & Sweets!\n\nHere is a special welcome gift for you:\n🎁 Use coupon code *${code}* to get *${tierInfo.discount}* on your bakery order!\n\nOrder online: ${window.location.origin}\n\nHave a sweet day! 🎂`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      {/* ─── Metric Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>Total New Customers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-navy)', marginTop: 4 }}>{newList.length}</div>
          <div style={{ fontSize: '.75rem', color: '#6b7a9d', marginTop: 4 }}>Recent signups & first orders</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>1st Order Placed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669', marginTop: 4 }}>{firstOrderCount}</div>
          <div style={{ fontSize: '.75rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>Ready to become repeat customer</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>Welcome Coupon Active</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: 6, fontSize: '.8rem', fontFamily: 'monospace' }}>WELCOME10</span>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: '#059669' }}>10% OFF</span>
          </div>
          <div style={{ fontSize: '.75rem', color: '#6b7a9d', marginTop: 4 }}>For customer conversion</div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">New Customers ({filtered.length})</span>
          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, stroke: '#6b7a9d', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7.5" />
                <path d="M16.5 16.5L21 21" strokeWidth="2.8" />
                <path d="M8 8.5A5 5 0 0 1 13 7" strokeWidth="1.8" />
              </svg>
              <input placeholder="Search new customers..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>PHONE</th>
                <th>TOTAL ORDERS</th>
                <th>WELCOME OFFER</th>
                <th>TOTAL SPEND</th>
                <th>LOYALTY POINTS</th>
                <th>LAST ORDER</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="admin-empty">No new customers found</td></tr>
              ) : (
                filtered.map(c => {
                  const tier = getNewTier(c.total_orders);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '.75rem', color: '#6b7a9d' }}>{c.email}</div>
                        <div style={{ marginTop: 4 }}>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '.7rem',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: 4,
                              background: tier.bg,
                              color: tier.color,
                              border: `1px solid ${tier.border}`
                            }}
                          >
                            {tier.label}
                          </span>
                        </div>
                      </td>
                      <td>{c.phone || '—'}</td>
                      <td>
                        <strong style={{ fontSize: '.95rem' }}>{c.total_orders}</strong>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                border: '1px solid #fde68a',
                                padding: '2px 6px',
                                borderRadius: 4,
                                fontSize: '.74rem',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {tier.coupon}
                            </span>
                            <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#059669' }}>
                              {tier.discount}
                            </span>
                          </div>
                          <span style={{ fontSize: '.7rem', color: '#64748b' }}>
                            {tier.desc}
                          </span>
                        </div>
                      </td>
                      <td>₹{(c.total_spend || 0).toFixed(2)}</td>
                      <td><span className="status-pill active">🪙 {c.loyalty_balance || 0} pts</span></td>
                      <td style={{ fontSize: '.78rem', color: '#6b7a9d' }}>
                        {c.last_order_date ? new Date(c.last_order_date).toLocaleDateString('en-IN') : 'Never'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn-admin outline sm"
                            onClick={() => openCustomer(c)}
                            title="View customer details"
                          >
                            📜 History
                          </button>
                          <button
                            className="btn-admin sm"
                            style={{
                              background: '#25D366',
                              borderColor: '#128C7E',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '.74rem',
                              padding: '4px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onClick={() => sendWhatsAppWelcome(c, tier)}
                            title="Send welcome offer on WhatsApp"
                          >
                            💬 Welcome
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <div>
                <span className="admin-modal-title">Customer Details: {selectedCustomer.name}</span>
                <div style={{ fontSize: '.78rem', color: '#6b7a9d', marginTop: 2 }}>
                  {getNewTier(selectedCustomer.total_orders).label} • {selectedCustomer.email}
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>✕</button>
            </div>
            <div className="admin-modal-body">
              {detailsLoading ? (
                <div className="admin-loading"><div className="admin-spinner" /></div>
              ) : customerDetails ? (
                <div>
                  {/* New Customer Welcome Offer Box */}
                  {(() => {
                    const tier = getNewTier((customerDetails.orders || []).length);
                    return (
                      <div
                        style={{
                          background: tier.bg,
                          border: `1px solid ${tier.border}`,
                          padding: 14,
                          borderRadius: 10,
                          marginBottom: 18,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 10
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: tier.color, fontSize: '.92rem' }}>
                            {tier.label}
                          </div>
                          <div style={{ fontSize: '.8rem', color: '#475569', marginTop: 3 }}>
                            Special Welcome Offer: <strong>{tier.discount}</strong> (Coupon: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'monospace' }}>{tier.coupon}</code>)
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="btn-admin sm"
                            style={{ background: 'var(--admin-navy)', color: '#fff' }}
                            onClick={() => copyCoupon(tier.coupon)}
                          >
                            {copiedCode === tier.coupon ? '✓ Copied' : '📋 Copy Code'}
                          </button>
                          <button
                            type="button"
                            className="btn-admin sm"
                            style={{ background: '#25D366', borderColor: '#128C7E', color: '#fff', fontWeight: 600 }}
                            onClick={() => sendWhatsAppWelcome(selectedCustomer, tier)}
                          >
                            💬 Send WhatsApp Offer
                          </button>
                        </div>
                      </div>
                    );
                  })()}

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

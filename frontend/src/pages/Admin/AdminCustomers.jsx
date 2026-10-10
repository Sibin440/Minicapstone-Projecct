import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'repeat', 'new'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
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

  const getCustomerTier = (ordersCount) => {
    const count = Number(ordersCount) || 0;
    if (count >= 10) {
      return {
        tier: 'VIP',
        isRepeat: true,
        label: '🏆 VIP Repeat Customer',
        discount: '15% OFF',
        coupon: 'LOYAL15',
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
        desc: '15% VIP Loyalty Discount (Auto-applied at checkout)',
      };
    }
    if (count >= 5) {
      return {
        tier: 'Loyal',
        isRepeat: true,
        label: '⭐ Loyal Repeat Customer',
        discount: '10% OFF',
        coupon: 'LOYAL10',
        bg: '#ecfdf5',
        color: '#065f46',
        border: '#a7f3d0',
        desc: '10% Repeat Customer Discount (Auto-applied at checkout)',
      };
    }
    if (count >= 2) {
      return {
        tier: 'Repeat',
        isRepeat: true,
        label: '🔁 Repeat Customer',
        discount: '5% OFF',
        coupon: 'LOYAL5',
        bg: '#eff6ff',
        color: '#1e40af',
        border: '#bfdbfe',
        desc: '5% Repeat Customer Discount (Auto-applied at checkout)',
      };
    }
    if (count === 1) {
      return {
        tier: 'FirstOrder',
        isRepeat: false,
        label: '🌱 New Customer (1 Order)',
        discount: '5% on Next',
        coupon: 'LOYAL5',
        bg: '#f1f5f9',
        color: '#475569',
        border: '#e2e8f0',
        desc: 'Unlocks 5% OFF on 2nd purchase',
      };
    }
    return {
      tier: 'Registered',
      isRepeat: false,
      label: '👤 New Customer (0 Orders)',
      discount: '10% Welcome',
      coupon: 'WELCOME10',
      bg: '#f8fafc',
      color: '#64748b',
      border: '#e2e8f0',
      desc: '10% Welcome discount on 1st order',
    };
  };

  const repeatCount = customers.filter(c => (Number(c.total_orders) || 0) >= 2).length;
  const newCount = customers.filter(c => (Number(c.total_orders) || 0) < 2).length;

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
    if (!matchesSearch) return false;

    const count = Number(c.total_orders) || 0;
    if (filterTab === 'repeat') return count >= 2;
    if (filterTab === 'new') return count < 2;
    return true;
  });

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendWhatsAppOffer = (customer, tierInfo) => {
    const code = tierInfo.coupon;
    const phone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const text = encodeURIComponent(
      `Hello ${customer.name}! 🍬\n\nThank you for choosing *Creamy Bites*.\n\nWe have an exclusive special offer for you:\n🎁 Use coupon code *${code}* to get *${tierInfo.discount}* on your next bakery order!\n\nOrder online now: ${window.location.origin}\n\nHave a sweet day! 🎂`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div className="admin-table-card">
        {/* ─── Table Header with Repeated & New Customer in Empty Space ─── */}
        <div className="admin-table-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span className="admin-table-title" style={{ margin: 0 }}>Customers ({filtered.length})</span>

            {/* ─── Repeated Customer and New Customer in the empty space ─── */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f0f2f8', padding: '3px 4px', borderRadius: 20 }}>
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  border: 'none',
                  background: filterTab === 'all' ? 'var(--admin-navy)' : 'transparent',
                  color: filterTab === 'all' ? '#ffffff' : '#6b7a9d',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all .15s ease'
                }}
              >
                All ({customers.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('repeat')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  border: 'none',
                  background: filterTab === 'repeat' ? '#2563eb' : 'transparent',
                  color: filterTab === 'repeat' ? '#ffffff' : '#2563eb',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all .15s ease'
                }}
              >
                🔁 Repeated Customers ({repeatCount})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('new')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  fontSize: '.75rem',
                  fontWeight: 700,
                  border: 'none',
                  background: filterTab === 'new' ? '#475569' : 'transparent',
                  color: filterTab === 'new' ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all .15s ease'
                }}
              >
                🌱 New Customers ({newCount})
              </button>
            </div>
          </div>

          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, stroke: '#6b7a9d', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7.5" />
                <path d="M16.5 16.5L21 21" strokeWidth="2.8" />
                <path d="M8 8.5A5 5 0 0 1 13 7" strokeWidth="1.8" />
              </svg>
              <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <th>TOTAL SPEND</th>
                <th>LOYALTY POINTS</th>
                <th>LAST ORDER</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No customers found</td></tr>
              ) : (
                filtered.map(c => {
                  const tier = getCustomerTier(c.total_orders);
                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: '.75rem', color: '#6b7a9d' }}>{c.email}</div>
                      </td>
                      <td>{c.phone || '—'}</td>
                      <td>
                        <strong>{c.total_orders}</strong>
                        {tier.isRepeat && (
                          <span style={{ fontSize: '.7rem', color: '#2563eb', fontWeight: 700, marginLeft: 6 }}>
                            (Repeat)
                          </span>
                        )}
                      </td>
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
                  {getCustomerTier(selectedCustomer.total_orders).label} • {selectedCustomer.email}
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>✕</button>
            </div>
            <div className="admin-modal-body">
              {detailsLoading ? (
                <div className="admin-loading"><div className="admin-spinner" /></div>
              ) : customerDetails ? (
                <div>
                  {/* Repeated / Customer Status & Special Offer Box */}
                  {(() => {
                    const tier = getCustomerTier((customerDetails.orders || []).length);
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
                            Special Offer: <strong>{tier.discount}</strong> (Coupon: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontFamily: 'monospace' }}>{tier.coupon}</code>)
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
                            onClick={() => sendWhatsAppOffer(selectedCustomer, tier)}
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

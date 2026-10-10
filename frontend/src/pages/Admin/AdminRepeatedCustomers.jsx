import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminRepeatedCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [offerModalCustomer, setOfferModalCustomer] = useState(null);
  const [selectedOfferCode, setSelectedOfferCode] = useState('LOYAL');
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

  const getRepeatTier = (ordersCount) => {
    const count = Number(ordersCount) || 0;
    if (count >= 10) {
      return {
        tier: 'VIP',
        label: '🏆 VIP Customer',
        discount: '15% OFF',
        coupon: 'LOYAL15',
        bg: '#fef3c7',
        color: '#92400e',
        border: '#fde68a',
        desc: '15% VIP Loyalty Discount (Auto-applied at checkout)',
      };
    }
    if (count >= 5) {
      return {
        tier: 'Loyal',
        label: '⭐ Loyal Customer',
        discount: '10% OFF',
        coupon: 'LOYAL10',
        bg: '#ecfdf5',
        color: '#065f46',
        border: '#a7f3d0',
        desc: '10% Repeat Customer Discount (Auto-applied at checkout)',
      };
    }
    return {
      tier: 'Repeat',
      label: '🔁 Repeat Customer',
      discount: '5% OFF',
      coupon: 'LOYAL5',
      bg: '#eff6ff',
      color: '#1e40af',
      border: '#bfdbfe',
      desc: '5% Repeat Customer Discount (Auto-applied at checkout)',
    };
  };

  // Only repeated customers (>= 2 orders)
  const repeatedList = customers.filter(c => (Number(c.total_orders) || 0) >= 2);

  const filtered = repeatedList.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const totalRepeatSpend = repeatedList.reduce((sum, c) => sum + (Number(c.total_spend) || 0), 0);
  const totalRepeatOrders = repeatedList.reduce((sum, c) => sum + (Number(c.total_orders) || 0), 0);

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sendWhatsAppOffer = (customer, tierInfo, customCode) => {
    const code = customCode || tierInfo.coupon;
    const phone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : '';
    const cleanPhone = phone.length === 10 ? `91${phone}` : phone;

    const text = encodeURIComponent(
      `Hello ${customer.name}! 🍬\n\nThank you for being a valued Repeat Customer at *Creamy Bites*.\n\nWe have an exclusive special offer for you:\n🎁 Use coupon code *${code}* to get *${tierInfo.discount}* on your next bakery order!\n\nOrder online now: ${window.location.origin}\n\nHave a sweet day! 🎂`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      {/* ─── Metric Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>Repeated Customers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginTop: 4 }}>{repeatedList.length}</div>
          <div style={{ fontSize: '.75rem', color: '#059669', marginTop: 4, fontWeight: 600 }}>Repeat Retention Active</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>Repeat Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--admin-navy)', marginTop: 4 }}>₹{totalRepeatSpend.toFixed(2)}</div>
          <div style={{ fontSize: '.75rem', color: '#6b7a9d', marginTop: 4 }}>From {totalRepeatOrders} completed orders</div>
        </div>

        <div style={{ background: '#fff', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--admin-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '.78rem', color: '#6b7a9d', textTransform: 'uppercase', fontWeight: 600 }}>Active Auto Offers</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669', marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontSize: '.75rem' }}>LOYAL5 (5%)</span>
            <span style={{ background: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: 6, fontSize: '.75rem' }}>LOYAL10 (10%)</span>
            <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 6, fontSize: '.75rem' }}>LOYAL15 (15%)</span>
          </div>
          <div style={{ fontSize: '.75rem', color: '#6b7a9d', marginTop: 4 }}>Auto-applied at checkout</div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">Repeated Customers ({filtered.length})</span>
          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, stroke: '#6b7a9d', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="7.5" />
                <path d="M16.5 16.5L21 21" strokeWidth="2.8" />
                <path d="M8 8.5A5 5 0 0 1 13 7" strokeWidth="1.8" />
              </svg>
              <input placeholder="Search repeated customers..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <th>SPECIAL OFFER</th>
                <th>TOTAL SPEND</th>
                <th>LOYALTY POINTS</th>
                <th>LAST ORDER</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="admin-empty">No repeated customers found</td></tr>
              ) : (
                filtered.map(c => {
                  const tier = getRepeatTier(c.total_orders);
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
                        <strong style={{ fontSize: '.95rem', color: '#2563eb' }}>{c.total_orders}</strong>
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
                            Auto-applied repeat discount
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
                            title="View customer order history"
                          >
                            📜 History
                          </button>
                          <button
                            className="btn-admin sm"
                            style={{
                              background: '#f59e0b',
                              borderColor: '#d97706',
                              color: '#fff',
                              fontWeight: 600,
                              fontSize: '.74rem',
                              padding: '4px 8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            onClick={() => {
                              setSelectedOfferCode(tier.coupon);
                              setOfferModalCustomer(c);
                            }}
                            title="Share special offer via WhatsApp"
                          >
                            🎁 Offer
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

      {/* ─── Special Offer Modal ─── */}
      {offerModalCustomer && (() => {
        const tier = getRepeatTier(offerModalCustomer.total_orders);
        const availableOffers = [
          { code: tier.coupon, label: `${tier.discount} (${tier.label} Default)`, desc: tier.desc },
          { code: 'SWEET20', label: '20% OFF — Festive Special', desc: '20% discount on orders above ₹500' },
          { code: 'FLAT50', label: '₹50 Flat OFF — Special Treat', desc: 'Flat ₹50 discount on any purchase' },
        ];

        return (
          <div className="admin-modal-overlay" onClick={() => setOfferModalCustomer(null)}>
            <div className="admin-modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <div>
                  <span className="admin-modal-title">🎁 Special Offer: {offerModalCustomer.name}</span>
                  <div style={{ fontSize: '.78rem', color: '#6b7a9d', marginTop: 2 }}>
                    {tier.label} • {offerModalCustomer.total_orders} Orders Completed
                  </div>
                </div>
                <button className="admin-modal-close" onClick={() => setOfferModalCustomer(null)}>✕</button>
              </div>

              <div className="admin-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: tier.bg, border: `1px solid ${tier.border}`, padding: 14, borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: tier.color, fontSize: '.9rem' }}>{tier.label}</span>
                    <span style={{ fontWeight: 800, color: '#059669', fontSize: '.95rem' }}>{tier.discount}</span>
                  </div>
                  <div style={{ fontSize: '.8rem', color: '#475569' }}>{tier.desc}</div>
                </div>

                <div>
                  <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--admin-navy)', display: 'block', marginBottom: 8 }}>
                    Select Special Offer to Share:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {availableOffers.map(off => (
                      <div
                        key={off.code}
                        onClick={() => setSelectedOfferCode(off.code)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 8,
                          border: selectedOfferCode === off.code ? '2px solid #2563eb' : '1px solid var(--admin-border)',
                          background: selectedOfferCode === off.code ? '#eff6ff' : '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--admin-navy)' }}>{off.label}</div>
                          <div style={{ fontSize: '.74rem', color: '#64748b' }}>{off.desc}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.8rem', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                            {off.code}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyCoupon(off.code); }}
                            style={{
                              border: 'none',
                              background: copiedCode === off.code ? '#22c55e' : 'var(--admin-navy)',
                              color: '#fff',
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: '.7rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            {copiedCode === off.code ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                  <button
                    className="btn-admin"
                    style={{
                      flex: 1,
                      background: '#25D366',
                      borderColor: '#128C7E',
                      color: '#fff',
                      fontWeight: 700,
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                    onClick={() => sendWhatsAppOffer(offerModalCustomer, tier, selectedOfferCode)}
                  >
                    <span>💬 Send Offer on WhatsApp</span>
                  </button>
                  <button className="btn-admin outline" style={{ padding: '10px 16px' }} onClick={() => setOfferModalCustomer(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Customer Details Drawer / Modal ─── */}
      {selectedCustomer && (
        <div className="admin-modal-overlay" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>
          <div className="admin-modal" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-title">Customer Details: {selectedCustomer.name}</span>
                <div style={{ fontSize: '.78rem', color: '#6b7a9d', marginTop: 2 }}>
                  {getRepeatTier(selectedCustomer.total_orders).label} • {selectedCustomer.email}
                </div>
              </div>
              <button className="admin-modal-close" onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}>✕</button>
            </div>
            <div className="admin-modal-body">
              {detailsLoading ? (
                <div className="admin-loading"><div className="admin-spinner" /></div>
              ) : customerDetails ? (
                <div>
                  {/* Repeated Customer & Special Offer Box */}
                  {(() => {
                    const tier = getRepeatTier((customerDetails.orders || []).length);
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
                            onClick={() => sendWhatsAppOffer(selectedCustomer, tier, tier.coupon)}
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

import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import './UserPages.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAll().then(data => {
      setOrders(data.orders);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="user-page page-enter container">
      <h1 className="user-page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-user-card">
          <p>You have not placed any orders yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{String(order.id).slice(-6)}</h3>
                  <span className="order-date">{new Date(order.createdAt || order.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {order.delivery_otp && order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
                    <div style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}>
                      🔐 Delivery OTP: <span style={{ fontSize: '0.95rem', letterSpacing: '1px' }}>{order.delivery_otp}</span>
                    </div>
                  )}
                  <span className={`status-badge status-${order.order_status}`}>{(order.order_status || 'placed').toUpperCase()}</span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.product_name} ({item.weight}) x {item.quantity}</span>
                    <span>₹{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span>Total Amount: <strong>₹{(order.total || 0).toFixed(2)}</strong></span>
                  <span style={{ marginLeft: '12px', fontSize: '0.82rem', color: '#64748b' }}>
                    Payment: {(order.payment_method || 'cod').toUpperCase()}
                  </span>
                </div>

                {order.whatsapp_url && (
                  <button
                    onClick={() => window.open(order.whatsapp_url, '_blank')}
                    style={{
                      background: '#25D366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontWeight: '600',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    📱 Share Receipt on WhatsApp
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

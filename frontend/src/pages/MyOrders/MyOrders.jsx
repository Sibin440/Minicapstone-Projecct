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
                  <h3>Order #{order.id}</h3>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <span className={`status-badge status-${order.order_status}`}>{order.order_status.toUpperCase()}</span>
              </div>

              <div className="order-items-preview">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>{item.product_name} ({item.weight}) x {item.quantity}</span>
                    <span>₹{item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <span>Total Amount: <strong>₹{order.total.toFixed(2)}</strong></span>
                <span>Payment: {order.payment_method.toUpperCase()} ({order.payment_status})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

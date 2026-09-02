import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

const ALL_STATUSES = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];
const NEXT_STATUS = { placed: 'confirmed', confirmed: 'preparing', preparing: 'packed', packed: 'out_for_delivery', out_for_delivery: 'delivered' };

function OrderPipeline({ status }) {
  const steps = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered'];
  const idx = steps.indexOf(status);
  return (
    <div className="order-pipeline">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <div className={`pipeline-line ${i <= idx ? 'done' : ''}`} />}
          <div className="pipeline-step">
            <div className={`pipeline-dot ${i < idx ? 'done' : i === idx ? 'current' : ''}`}>
              {i < idx ? '✓' : i + 1}
            </div>
            <div className={`pipeline-label ${i < idx ? 'done' : i === idx ? 'current' : ''}`}>
              {s.replace(/_/g, ' ')}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(null);

  const load = (status = statusFilter) => {
    setLoading(true);
    adminAPI.getOrders({ status: status || undefined, limit: 50 })
      .then(r => setOrders(r.orders || []))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      load();
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, order_status: status }));
    } catch (e) { alert(e.message || 'Update failed'); }
    finally { setUpdating(null); }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">Orders ({orders.length})</span>
          <div className="admin-table-actions">
            <div className="admin-tabs">
              {['', ...ALL_STATUSES].map(s => (
                <button key={s} className={`admin-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                  {s ? s.replace(/_/g, ' ') : 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan="7" className="admin-empty">No orders found</td></tr>
                : orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{String(o.id).slice(-6)}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.87rem' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '.72rem', color: '#6b7a9d' }}>{o.customer_email}</div>
                    </td>
                    <td>{o.items?.length || 0} items</td>
                    <td><strong>₹{(o.total || 0).toFixed(2)}</strong></td>
                    <td style={{ fontSize: '.78rem', color: '#6b7a9d' }}>{new Date(o.created_at).toLocaleString('en-IN')}</td>
                    <td><span className={`status-pill ${o.order_status}`}>{(o.order_status || 'placed').replace(/_/g, ' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-admin outline sm" onClick={() => setSelectedOrder(o)}>View</button>
                        {NEXT_STATUS[o.order_status] && (
                          <button className="btn-admin gold sm" disabled={updating === o.id}
                            onClick={() => updateStatus(o.id, NEXT_STATUS[o.order_status])}>
                            {updating === o.id ? '...' : `→ ${NEXT_STATUS[o.order_status]?.replace(/_/g, ' ')}`}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Order Detail Drawer ─── */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">Order #{String(selectedOrder.id).slice(-6)} Details</span>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#6b7a9d', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Customer</div>
                  <div style={{ fontWeight: 700 }}>{selectedOrder.customer_name}</div>
                  <div style={{ fontSize: '.8rem', color: '#6b7a9d' }}>{selectedOrder.customer_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.75rem', color: '#6b7a9d', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Placed On</div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <OrderPipeline status={selectedOrder.order_status} />

              <div style={{ marginTop: 20, marginBottom: 12, fontWeight: 700, color: '#1a2744' }}>Items Ordered</div>
              <table className="admin-table" style={{ borderRadius: 8, overflow: 'hidden' }}>
                <thead><tr><th>Product</th><th>Weight</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
                <tbody>
                  {(selectedOrder.items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td>{item.weight}</td>
                      <td>{item.quantity}</td>
                      <td>₹{(item.unit_price || 0).toFixed(2)}</td>
                      <td>₹{(item.total_price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 16, borderTop: '1px solid #e4e8f0', paddingTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 24 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '.8rem', color: '#6b7a9d' }}>Subtotal: ₹{(selectedOrder.subtotal || 0).toFixed(2)}</div>
                  {(selectedOrder.discount_amount || 0) > 0 && <div style={{ fontSize: '.8rem', color: '#22c55e' }}>Discount: -₹{(selectedOrder.discount_amount || 0).toFixed(2)}</div>}
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a2744', marginTop: 4 }}>Total: ₹{(selectedOrder.total || 0).toFixed(2)}</div>
                </div>
              </div>

              {NEXT_STATUS[selectedOrder.order_status] && (
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-admin gold" onClick={() => { updateStatus(selectedOrder.id, NEXT_STATUS[selectedOrder.order_status]); setSelectedOrder(null); }}>
                    Mark as {NEXT_STATUS[selectedOrder.order_status]?.replace(/_/g, ' ')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

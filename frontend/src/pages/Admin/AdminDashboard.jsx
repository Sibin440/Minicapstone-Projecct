import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

function BarChart({ data = [], valueKey = 'value', labelKey = 'label', color = 'gold' }) {
  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map(d => Number(d[valueKey]) || 0), 1);
  return (
    <div className="bar-chart">
      {safeData.map((d, i) => {
        const val = Number(d[valueKey]) || 0;
        const h = Math.round((val / max) * 120);
        return (
          <div key={i} className="bar-col">
            <div className="bar-spacer" />
            <div
              className={`bar-fill ${color}`}
              style={{ height: `${Math.max(h, 2)}px` }}
              data-val={`₹${val}`}
            />
            <div className="bar-label">{d[labelKey] || ''}</div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }) {
  const COLORS = ['#c8972b','#1a2744','#22c55e','#3b82f6','#ef4444','#9333ea'];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r;

  return (
    <div className="donut-wrap">
      <svg className="donut-svg" viewBox="0 0 110 110">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f8" strokeWidth="16" />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const dash = `${len} ${circ - len}`;
          const seg = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={COLORS[i % COLORS.length]}
              strokeWidth="16" strokeDasharray={dash}
              strokeDashoffset={-offset} strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '55px 55px' }} />
          );
          offset += len;
          return seg;
        })}
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill="#1a2744">{data.length}</text>
        <text x={cx} y={cx + 12} textAnchor="middle" fontSize="7" fill="#6b7a9d">types</text>
      </svg>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span style={{ flex: 1, color: '#1a2744', fontWeight: 500 }}>{d.label}</span>
            <span style={{ color: '#6b7a9d', fontWeight: 600 }}>{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tier badge helper
function TierBadge({ orderCount }) {
  if (orderCount >= 10) return <span className="rc-tier-badge vip">🏆 VIP (15% off)</span>;
  if (orderCount >= 5)  return <span className="rc-tier-badge loyal10">⭐ Loyal (10% off)</span>;
  if (orderCount >= 3)  return <span className="rc-tier-badge loyal5">🎁 Repeat (5% off)</span>;
  return <span className="rc-tier-badge new-cust">🆕 New</span>;
}

const STATUS_ORDER = ['placed', 'confirmed', 'preparing', 'packed', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setData(r)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!data) return <div className="admin-empty">Failed to load dashboard data.</div>;

  const { stats, dailySales, monthlyRevenue, statusBreakdown, topProducts, recentOrders, lowStockProducts, repeatCustomerStats } = data;
  const rc = repeatCustomerStats || { total: 0, new: 0, loyal5: 0, loyal10: 0, vip: 0, topRepeat: [] };

  const donutData = Object.entries(statusBreakdown || {}).map(([k, v]) => ({ label: k, value: v }));

  // Repeat customer tier donut data
  const rcDonutData = [
    rc.new     > 0 ? { label: '🆕 New (1 order)',       value: rc.new }     : null,
    rc.loyal5  > 0 ? { label: '🎁 Repeat (3–4 orders)', value: rc.loyal5 }  : null,
    rc.loyal10 > 0 ? { label: '⭐ Loyal (5–9 orders)',  value: rc.loyal10 } : null,
    rc.vip     > 0 ? { label: '🏆 VIP (10+ orders)',    value: rc.vip }     : null,
  ].filter(Boolean);

  return (
    <div>
      {/* ─── Stat Cards ─── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card gold">
          <span className="stat-icon">💰</span>
          <div className="stat-value">₹{(stats.todaySales || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Today's Sales</div>
        </div>
        <div className="admin-stat-card navy">
          <span className="stat-icon">📊</span>
          <div className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card success">
          <span className="stat-icon">📦</span>
          <div className="stat-value">{stats.totalOrders || 0}</div>
          <div className="stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card info">
          <span className="stat-icon">👥</span>
          <div className="stat-value">{stats.totalCustomers || 0}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        {/* ── NEW: Repeat Customers Stat Card ── */}
        <div className="admin-stat-card warning">
          <span className="stat-icon">🔁</span>
          <div className="stat-value">{stats.totalRepeatCustomers || 0}</div>
          <div className="stat-label">Repeat Customers</div>
        </div>
        <div className="admin-stat-card danger">
          <span className="stat-icon">⚠️</span>
          <div className="stat-value">{stats.lowStockCount || 0}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
      </div>

      {/* ─── Charts Row ─── */}
      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <div className="chart-title">Daily Sales — Last 7 Days</div>
          <div className="chart-sub">Revenue trend for the current week</div>
          <BarChart data={dailySales} valueKey="value" labelKey="label" color="gold" />
        </div>
        <div className="admin-chart-card">
          <div className="chart-title">Monthly Revenue — Last 6 Months</div>
          <div className="chart-sub">Month-over-month revenue comparison</div>
          <BarChart data={monthlyRevenue} valueKey="value" labelKey="label" color="navy" />
        </div>
      </div>

      <div className="admin-charts-row" style={{ marginBottom: 24 }}>
        <div className="admin-chart-card">
          <div className="chart-title">Order Status Breakdown</div>
          <div className="chart-sub">Distribution of all orders by status</div>
          {donutData.length > 0 ? <DonutChart data={donutData} /> : <div className="admin-empty" style={{ padding: 24 }}>No orders yet</div>}
        </div>
        <div className="admin-chart-card">
          <div className="chart-title">Best-Selling Products</div>
          <div className="chart-sub">Top 5 products by order quantity</div>
          {(topProducts || []).length === 0
            ? <div className="admin-empty" style={{ padding: 24 }}>No sales data yet</div>
            : (topProducts || []).map((p, i) => (
              <div key={i} className="top-product-row">
                <div className={`top-product-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>{i + 1}</div>
                <span className="top-product-name">{p.name}</span>
                <span className="top-product-qty">{p.qty} sold</span>
              </div>
            ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ─── REPEAT CUSTOMERS SECTION ───
      ══════════════════════════════════════════════════ */}
      <div className="rc-section">
        <div className="rc-section-header">
          <div>
            <div className="rc-section-title">🔁 Repeat Customers Overview</div>
            <div className="rc-section-sub">Customers segmented by loyalty tier &amp; discount eligibility</div>
          </div>
        </div>

        {/* Tier Summary Cards */}
        <div className="rc-tier-grid">
          <div className="rc-tier-card new-bg">
            <div className="rc-tier-icon">🆕</div>
            <div className="rc-tier-count">{rc.new}</div>
            <div className="rc-tier-label">New Customers</div>
            <div className="rc-tier-desc">1 order placed<br/>No discount yet</div>
          </div>
          <div className="rc-tier-card loyal5-bg">
            <div className="rc-tier-icon">🎁</div>
            <div className="rc-tier-count">{rc.loyal5}</div>
            <div className="rc-tier-label">Repeat Customers</div>
            <div className="rc-tier-desc">3–4 orders placed<br/>5% off (LOYAL5)</div>
          </div>
          <div className="rc-tier-card loyal10-bg">
            <div className="rc-tier-icon">⭐</div>
            <div className="rc-tier-count">{rc.loyal10}</div>
            <div className="rc-tier-label">Loyal Customers</div>
            <div className="rc-tier-desc">5–9 orders placed<br/>10% off (LOYAL10)</div>
          </div>
          <div className="rc-tier-card vip-bg">
            <div className="rc-tier-icon">🏆</div>
            <div className="rc-tier-count">{rc.vip}</div>
            <div className="rc-tier-label">VIP Customers</div>
            <div className="rc-tier-desc">10+ orders placed<br/>15% off (LOYAL15)</div>
          </div>
        </div>

        {/* Tier Breakdown Chart + Top Repeat Customers Table */}
        <div className="rc-bottom-grid">
          {/* Donut — tier distribution */}
          <div className="admin-chart-card">
            <div className="chart-title">Customer Tier Distribution</div>
            <div className="chart-sub">How your customers are segmented by loyalty</div>
            {rcDonutData.length > 0
              ? <DonutChart data={rcDonutData} />
              : <div className="admin-empty" style={{ padding: 24 }}>No customer data yet</div>}
          </div>

          {/* Top Repeat Customers Table */}
          <div className="admin-table-card">
            <div className="admin-table-header">
              <span className="admin-table-title">Top Repeat Customers</span>
              <span style={{ fontSize: '.75rem', color: '#6b7a9d' }}>Ranked by order count</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Orders</th>
                  <th>Loyalty Tier</th>
                  <th>Offer Applied</th>
                </tr>
              </thead>
              <tbody>
                {rc.topRepeat.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7a9d', padding: 24 }}>
                    No repeat customers yet. Encourage customers to order again!
                  </td></tr>
                ) : rc.topRepeat.map((c, i) => (
                  <tr key={String(c._id)}>
                    <td>
                      <div className={`top-product-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}
                        style={{ display: 'inline-flex' }}>{i + 1}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '.73rem', color: '#6b7a9d' }}>{c.email}</div>
                    </td>
                    <td><strong>{c.order_count}</strong> orders</td>
                    <td><TierBadge orderCount={c.order_count} /></td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      {c.order_count >= 10 ? 'LOYAL15 (−15%)'
                        : c.order_count >= 5 ? 'LOYAL10 (−10%)'
                        : 'LOYAL5 (−5%)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Recent Orders & Low Stock ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 24 }}>
        <div className="admin-table-card">
          <div className="admin-table-header">
            <span className="admin-table-title">Recent Orders</span>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders || []).length === 0
                ? <tr><td colSpan="5" style={{ textAlign: 'center', color: '#6b7a9d', padding: 24 }}>No orders yet</td></tr>
                : (recentOrders || []).map(o => (
                  <tr key={o.id}>
                    <td><strong>#{String(o.id).slice(-6)}</strong></td>
                    <td>{o.customer_name}</td>
                    <td>₹{(o.total || 0).toFixed(2)}</td>
                    <td><span className={`status-pill ${o.order_status}`}>{(o.order_status || 'placed').replace(/_/g, ' ')}</span></td>
                    <td style={{ fontSize: '.78rem', color: '#6b7a9d' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="admin-chart-card">
          <div className="chart-title">Low Stock Alert</div>
          <div className="chart-sub">Products needing restock</div>
          {(lowStockProducts || []).length === 0
            ? <div className="admin-empty" style={{ padding: 24 }}>All items well-stocked</div>
            : (lowStockProducts || []).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #e4e8f0' }}>
                <img
                  src={p.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'}
                  alt={p.name}
                  className="product-thumb"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.83rem', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '.72rem', color: '#ef4444', marginTop: 2 }}>{p.stock_qty || 0} remaining</div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

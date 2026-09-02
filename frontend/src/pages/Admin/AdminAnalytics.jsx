import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminAnalytics() {
  const [range, setRange] = useState('7days');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAnalytics(range)
      .then(r => setData(r))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!data) return <div className="admin-empty">Failed to load sales analytics.</div>;

  const { totalRevenue, totalOrders, avgOrderValue, revenueByDay, bestCategories, bestProducts } = data;
  const maxCatRev = Math.max(...(bestCategories || []).map(c => c.revenue || 0), 1);

  return (
    <div>
      {/* ─── Filter Tabs ─── */}
      <div className="analytics-filters">
        <div className="admin-tabs">
          {[
            { id: 'today', label: "Today's Sales" },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'month', label: 'This Month' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${range === tab.id ? 'active' : ''}`}
              onClick={() => setRange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Key Metrics ─── */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi">
          <div className="kpi-val">₹{(totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
          <div className="kpi-label">Total Revenue</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-val">{totalOrders || 0}</div>
          <div className="kpi-label">Total Orders</div>
        </div>
        <div className="analytics-kpi">
          <div className="kpi-val">₹{(avgOrderValue || 0).toFixed(0)}</div>
          <div className="kpi-label">Avg Order Value</div>
        </div>
      </div>

      {/* ─── Category Breakdown & Best Products ─── */}
      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <div className="chart-title">Best-Performing Categories</div>
          <div className="chart-sub">Revenue share by bakery category</div>
          {(bestCategories || []).length === 0 ? (
            <div className="admin-empty" style={{ padding: 24 }}>No category data</div>
          ) : (
            (bestCategories || []).map((cat, i) => {
              const pct = Math.round(((cat.revenue || 0) / maxCatRev) * 100);
              return (
                <div key={i} className="cat-bar-row">
                  <div className="cat-bar-name">{cat.name}</div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="cat-bar-val">₹{(cat.revenue || 0).toFixed(0)}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="admin-chart-card">
          <div className="chart-title">Top Products Sold</div>
          <div className="chart-sub">Most frequently ordered items in selected timeframe</div>
          {(bestProducts || []).length === 0 ? (
            <div className="admin-empty" style={{ padding: 24 }}>No product sales</div>
          ) : (
            (bestProducts || []).map((p, i) => (
              <div key={i} className="top-product-row">
                <div className={`top-product-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i + 1}
                </div>
                <span className="top-product-name">{p.name}</span>
                <span className="top-product-qty">{p.qty} units sold</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Daily Breakdown Table ─── */}
      <div className="admin-table-card" style={{ marginTop: 24 }}>
        <div className="admin-table-header">
          <span className="admin-table-title">Daily Breakdown</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Avg Ticket</th>
            </tr>
          </thead>
          <tbody>
            {(revenueByDay || []).length === 0 ? (
              <tr><td colSpan="4" className="admin-empty">No daily data available for this range</td></tr>
            ) : (
              (revenueByDay || []).map((d, i) => (
                <tr key={i}>
                  <td><strong>{d.label}</strong> ({d.date})</td>
                  <td>{d.orders} orders</td>
                  <td>₹{(d.revenue || 0).toFixed(2)}</td>
                  <td>₹{d.orders > 0 ? ((d.revenue || 0) / d.orders).toFixed(0) : '0'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminPrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getPrediction()
      .then(r => setData(r.prediction))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;
  if (!data) return <div className="admin-empty">Sales prediction model unavailable.</div>;

  return (
    <div>
      {/* ─── Hero Prediction Banner ─── */}
      <div className="prediction-hero">
        <div className="prediction-date">🔮 Forecast for Tomorrow ({data.day_name}, {data.date})</div>
        <div className="prediction-title">Tomorrow's Sales & Demand Prediction</div>
        <div className="prediction-confidence">
          <span>🎯 Model Confidence:</span>
          <strong>{data.confidence || 'High'}</strong>
        </div>

        <div className="prediction-metrics">
          <div className="pred-metric">
            <div className="pred-metric-val">₹{(data.revenue || 0).toLocaleString('en-IN')}</div>
            <div className="pred-metric-label">Predicted Revenue</div>
          </div>
          <div className="pred-metric">
            <div className="pred-metric-val">{data.orders || 0}</div>
            <div className="pred-metric-label">Expected Orders</div>
          </div>
          <div className="pred-metric">
            <div className="pred-metric-val">
              ₹{data.orders > 0 ? Math.round((data.revenue || 0) / data.orders) : 0}
            </div>
            <div className="pred-metric-label">Estimated Avg Order</div>
          </div>
        </div>
      </div>

      {/* ─── Predictions & Recommendations Grid ─── */}
      <div className="prediction-cards">
        {/* Expected High Demand Products */}
        <div className="pred-card">
          <div className="pred-card-title">🔥 Expected Best-Selling Products</div>
          {(data.topProducts || []).length === 0 ? (
            <div className="admin-empty">Insufficient sales history</div>
          ) : (
            (data.topProducts || []).map((p, i) => (
              <div key={i} className="top-product-row">
                <div className={`top-product-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i + 1}
                </div>
                <span className="top-product-name">{p.name}</span>
                <span className="top-product-qty">High Demand</span>
              </div>
            ))
          )}
        </div>

        {/* Recommended Prep Inventory */}
        <div className="pred-card">
          <div className="pred-card-title">👨‍🍳 Recommended Inventory Preparation</div>
          {(data.inventory || []).length === 0 ? (
            <div className="admin-empty">No inventory recommendations</div>
          ) : (
            (data.inventory || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e4e8f0' }}>
                <span style={{ fontWeight: 600, fontSize: '.85rem' }}>{item.product}</span>
                <span className="status-pill active" style={{ fontSize: '.8rem' }}>
                  Bake / Prep {item.recommended_qty} units
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── Forecast Model Insights ─── */}
      <div className="pred-card" style={{ marginTop: 24 }}>
        <div className="pred-card-title">🧠 Forecast Engine Insights & Rationale</div>
        {(data.insights || []).map((insight, i) => (
          <div key={i} className="insight-item">
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import CalendarIcon from '../../components/CalendarIcon';

export default function AdminPrediction() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  const fetchPrediction = (targetDate) => {
    setLoading(true);
    adminAPI.getPrediction(targetDate)
      .then(r => setData(r.prediction))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrediction('');
  }, []);

  const handleDateChange = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    fetchPrediction(val);
  };

  const handleResetDate = () => {
    setSelectedDate('');
    fetchPrediction('');
  };

  if (loading && !data) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      {/* ─── Date Picker Selector Toolbar ─── */}
      <div className="pred-card" style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #cbd5e1' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={22} color="#0f172a" /> Interactive Date Selection Prediction
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '.85rem', color: '#64748b' }}>
            Choose any custom calendar date or festival day to predict sales revenue, order volume, and baking stock demand.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '.85rem', fontWeight: 600, color: '#334155' }}>Select Target Date:</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={handleDateChange}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid #94a3b8',
              fontSize: '.9rem',
              fontWeight: 600,
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer',
              background: '#fff'
            }}
          />

          {selectedDate && (
            <button 
              onClick={handleResetDate}
              style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#334155', fontSize: '.85rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Reset to Tomorrow
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : !data ? (
        <div className="admin-empty">Sales prediction model unavailable.</div>
      ) : (
        <>
          {/* ─── Hero Prediction Banner ─── */}
          <div className="prediction-hero">
            <div className="prediction-date" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarIcon size={16} color="#fbbf24" /> Sales Forecast for ({data.day_name}, {data.date})
            </div>
            <div className="prediction-title">Demand & Sales Revenue Prediction ({data.day_name})</div>
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
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminLoyalty() {
  const [config, setConfig] = useState({ earn_rate_per_100: 5 });
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([adminAPI.getLoyaltyConfig(), adminAPI.getLoyaltyLedger()])
      .then(([cfgRes, ledgerRes]) => {
        if (cfgRes.config) setConfig(cfgRes.config);
        setLedger(ledgerRes.ledger || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      await adminAPI.updateLoyaltyConfig(config);
      alert('Loyalty reward rule updated successfully!');
      load();
    } catch (e) {
      alert(e.message || 'Failed to update rule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        {/* ─── Reward Rule Configuration ─── */}
        <div className="loyalty-config-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-navy)', marginBottom: 6 }}>
            ⚙️ Loyalty Reward Rule
          </h3>
          <p style={{ fontSize: '.8rem', color: 'var(--admin-muted)', marginBottom: 16 }}>
            Configure points earned automatically when an order is marked as Delivered.
          </p>

          <div className="admin-form-group">
            <label>Points Earned Per ₹100 Spent</label>
            <input
              type="number"
              value={config.earn_rate_per_100}
              onChange={e => setConfig({ ...config, earn_rate_per_100: Number(e.target.value) })}
              min="1"
            />
          </div>

          <div className="loyalty-formula">
            <div>
              <div style={{ fontSize: '.75rem', color: 'var(--admin-muted)', textTransform: 'uppercase' }}>Formula preview</div>
              <div style={{ fontSize: '.88rem', fontWeight: 600, marginTop: 2 }}>
                Every ₹100 spent = <span style={{ color: 'var(--admin-gold)', fontWeight: 800 }}>{config.earn_rate_per_100 || 5}</span> loyalty points
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--admin-bg)', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: '.78rem', color: '#6b7a9d' }}>
            <strong>Calculation Example:</strong>
            <br />• ₹500 order = {5 * (config.earn_rate_per_100 || 5)} points
            <br />• ₹1,000 order = {10 * (config.earn_rate_per_100 || 5)} points
            <br />• ₹2,500 order = {25 * (config.earn_rate_per_100 || 5)} points
          </div>

          <button className="btn-admin gold" onClick={saveConfig} disabled={saving} style={{ width: '100%' }}>
            {saving ? 'Saving...' : 'Save Loyalty Rule'}
          </button>
        </div>

        {/* ─── Customer Loyalty Ledger ─── */}
        <div className="admin-table-card">
          <div className="admin-table-header">
            <span className="admin-table-title">Customer Loyalty Ledger</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Current Balance</th>
                  <th>Total Earned / Transactions</th>
                  <th>Last Transaction</th>
                </tr>
              </thead>
              <tbody>
                {ledger.length === 0 ? (
                  <tr><td colSpan="4" className="admin-empty">No loyalty transactions recorded yet</td></tr>
                ) : (
                  ledger.map(item => {
                    const lastTx = item.transactions?.[item.transactions.length - 1];
                    return (
                      <tr key={item.user_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{item.name || 'Customer'}</div>
                          <div style={{ fontSize: '.75rem', color: '#6b7a9d' }}>{item.email}</div>
                        </td>
                        <td>
                          <span className="status-pill active" style={{ fontSize: '.85rem' }}>
                            🪙 {item.balance || 0} pts
                          </span>
                        </td>
                        <td>{item.transactions?.length || 0} activity logs</td>
                        <td style={{ fontSize: '.78rem', color: '#6b7a9d' }}>
                          {lastTx ? `${lastTx.reason} (+${lastTx.pts} pts)` : 'None'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

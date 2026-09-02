import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getInventory()
      .then(r => setInventory(r.inventory || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleQtyChange = (id, newQty) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, stock_qty: Number(newQty) } : item));
  };

  const saveStock = async (item) => {
    setSavingId(item.id);
    try {
      await adminAPI.updateStock(item.id, {
        stock_qty: Number(item.stock_qty),
        low_stock_threshold: Number(item.low_stock_threshold)
      });
      load();
    } catch (e) {
      alert(e.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const quickAdd = (item, amount) => {
    const updatedQty = Math.max(0, (item.stock_qty || 0) + amount);
    handleQtyChange(item.id, updatedQty);
  };

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase();
    return !q || item.name?.toLowerCase().includes(q) || item.category_name?.toLowerCase().includes(q);
  });

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">Inventory Control ({filtered.length} products)</span>
          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <span>🔍</span>
              <input placeholder="Search stock items..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Stock Bar</th>
                <th>Threshold</th>
                <th>Quick Restock</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="admin-empty">No inventory items found</td></tr>
              ) : (
                filtered.map(item => {
                  const isLow = (item.stock_qty || 0) <= (item.low_stock_threshold || 10);
                  const pct = Math.min(100, Math.round(((item.stock_qty || 0) / 50) * 100));
                  return (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <img
                            src={item.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'}
                            alt={item.name}
                            className="product-thumb"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {isLow && <span className="status-pill low" style={{ marginTop: 2 }}>⚠️ Low Stock</span>}
                          </div>
                        </div>
                      </td>
                      <td>{item.category_name}</td>
                      <td>
                        <input
                          type="number"
                          className="stock-input"
                          value={item.stock_qty}
                          onChange={e => handleQtyChange(item.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <div className="stock-bar-wrap">
                          <div className="stock-bar">
                            <div
                              className={`stock-bar-fill ${isLow ? 'low' : pct < 50 ? 'warn' : ''}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span style={{ fontSize: '.75rem', color: '#6b7a9d' }}>{item.stock_qty} units</span>
                        </div>
                      </td>
                      <td>{item.low_stock_threshold}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-admin outline sm" onClick={() => quickAdd(item, 10)}>+10</button>
                          <button className="btn-admin outline sm" onClick={() => quickAdd(item, 25)}>+25</button>
                          <button className="btn-admin outline sm" onClick={() => quickAdd(item, 50)}>+50</button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn-admin gold sm"
                          onClick={() => saveStock(item)}
                          disabled={savingId === item.id}
                        >
                          {savingId === item.id ? '...' : 'Save'}
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
    </div>
  );
}

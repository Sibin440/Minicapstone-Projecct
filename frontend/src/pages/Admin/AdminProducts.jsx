import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = { name: '', category_id: '', description: '', image_url: '', base_price: '', discount_percent: 0, is_bestseller: false, is_new: false, is_offer: false, is_pure_veg: true, stock_qty: 30, low_stock_threshold: 10, is_active: true, weights: [{ weight: '250 gms', price: '' }, { weight: '500 gms', price: '' }] };
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    Promise.all([adminAPI.getProducts(), adminAPI.getCategories()])
      .then(([pr, cr]) => { setProducts(pr.products || []); setCategories(cr.categories || []); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.category_name?.toLowerCase().includes(q))
      && (!catFilter || String(p.category_id) === catFilter);
  });

  const openAdd = () => { setForm({ ...emptyForm, category_id: categories[0]?.id || '' }); setEditing(null); setModal('add'); };
  const openEdit = (p) => {
    setForm({
      name: p.name, category_id: p.category_id?._id || p.category_id || '', description: p.description || '',
      image_url: p.image_url || '', base_price: p.base_price, discount_percent: p.discount_percent || 0,
      is_bestseller: p.is_bestseller === 1, is_new: p.is_new === 1,
      is_offer: p.is_offer === 1, is_pure_veg: p.is_pure_veg === 1,
      stock_qty: p.stock_qty || 30, low_stock_threshold: p.low_stock_threshold || 10,
      is_active: p.is_active === 1,
      weights: p.weights?.length ? p.weights.map(w => ({ weight: w.weight, price: w.price })) : [{ weight: '500 gms', price: p.base_price }]
    });
    setEditing(p);
    setModal('edit');
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id,
        base_price: Number(form.base_price),
        discount_percent: Number(form.discount_percent || 0),
        stock_qty: Number(form.stock_qty || 30),
        low_stock_threshold: Number(form.low_stock_threshold || 10),
        weights: form.weights.filter(w => w.weight && w.price !== '').map(w => ({ weight: w.weight, price: Number(w.price) }))
      };
      if (modal === 'add') await adminAPI.createProduct(payload);
      else await adminAPI.updateProduct(editing.id, payload);
      setModal(null);
      load();
    } catch (e) { alert(e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const doDelete = async () => {
    if (!deleteConfirm) return;
    try { await adminAPI.deleteProduct(deleteConfirm.id); setDeleteConfirm(null); load(); }
    catch (e) { alert(e.message || 'Delete failed'); }
  };

  const toggleActive = async (p) => {
    try { await adminAPI.updateProduct(p.id, { is_active: p.is_active !== 1 }); load(); }
    catch (e) { alert('Failed to update'); }
  };

  const updateWeight = (i, field, val) => {
    const w = [...form.weights];
    w[i] = { ...w[i], [field]: val };
    setForm({ ...form, weights: w });
  };

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">All Products ({filtered.length})</span>
          <div className="admin-table-actions">
            <div className="admin-search-bar">
              <span>🔍</span>
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="admin-filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn-admin gold" onClick={openAdd}>+ Add Product</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price</th><th>Discount</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="7" className="admin-empty">No products found</td></tr>
                : filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="product-thumb"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '.87rem' }}>{p.name}</div>
                          <div style={{ fontSize: '.72rem', color: '#6b7a9d' }}>{p.weights?.length} weight options</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.category_name}</td>
                    <td>₹{(p.base_price || 0).toFixed(2)}</td>
                    <td>{p.discount_percent > 0 ? <span className="status-pill warning">{p.discount_percent}% Off</span> : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 600, color: (p.stock_qty || 0) <= (p.low_stock_threshold || 10) ? '#ef4444' : '#1a2744' }}>{p.stock_qty || 0}</span>
                        {(p.stock_qty || 0) <= (p.low_stock_threshold || 10) && <span className="status-pill low">Low</span>}
                      </div>
                    </td>
                    <td>
                      <button onClick={() => toggleActive(p)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                        <span className={`status-pill ${p.is_active === 1 ? 'active' : 'inactive'}`}>{p.is_active === 1 ? '● Active' : '○ Hidden'}</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-admin outline sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn-admin danger sm" onClick={() => setDeleteConfirm(p)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add/Edit Modal ─── */}
      {modal && (
        <div className="admin-modal-overlay" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">{modal === 'add' ? '+ Add New Product' : '✏️ Edit Product'}</span>
              <button className="admin-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Product Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kaju Katli" />
                </div>
                <div className="admin-form-group">
                  <label>Category *</label>
                  <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label>Base Price (₹) *</label>
                  <input type="number" value={form.base_price} onChange={e => setForm({ ...form, base_price: e.target.value })} placeholder="0.00" />
                </div>
                <div className="admin-form-group">
                  <label>Discount (%)</label>
                  <input type="number" value={form.discount_percent} onChange={e => setForm({ ...form, discount_percent: e.target.value })} placeholder="0" min="0" max="100" />
                </div>
                <div className="admin-form-group">
                  <label>Stock Qty</label>
                  <input type="number" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label>Low Stock Alert</label>
                  <input type="number" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
                </div>
                <div className="admin-form-group full">
                  <label>Image URL</label>
                  <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                  {form.image_url && <img src={form.image_url} alt="preview" className="img-preview" onError={e => e.target.style.display='none'} />}
                </div>
                <div className="admin-form-group full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the product..." />
                </div>
              </div>

              <div style={{ marginTop: 20, marginBottom: 10, fontSize: '.8rem', fontWeight: 700, color: '#6b7a9d', textTransform: 'uppercase', letterSpacing: '.4px' }}>Weight & Price Options</div>
              <div className="weights-list">
                {form.weights.map((w, i) => (
                  <div key={i} className="weight-row">
                    <input placeholder="e.g. 500 gms" value={w.weight} onChange={e => updateWeight(i, 'weight', e.target.value)} />
                    <input type="number" placeholder="Price ₹" value={w.price} onChange={e => updateWeight(i, 'price', e.target.value)} />
                    <button onClick={() => setForm({ ...form, weights: form.weights.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
                <button className="btn-admin outline sm" style={{ marginTop: 6, width: 'fit-content' }} onClick={() => setForm({ ...form, weights: [...form.weights, { weight: '', price: '' }] })}>+ Add Weight</button>
              </div>

              <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
                {[['is_bestseller', '⭐ Best Seller'], ['is_new', '✨ New Arrival'], ['is_offer', '🏷️ On Offer'], ['is_active', '✅ Active']].map(([key, label]) => (
                  <label key={key} className="admin-toggle">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-admin gold" onClick={save} disabled={saving}>{saving ? 'Saving...' : modal === 'add' ? 'Create Product' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {deleteConfirm && (
        <div className="admin-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span className="admin-modal-title">🗑️ Delete Product</span>
              <button className="admin-modal-close" onClick={() => setDeleteConfirm(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p style={{ color: '#6b7a9d' }}>Are you sure you want to delete <strong style={{ color: '#1a2744' }}>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="btn-admin outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-admin danger" onClick={doDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

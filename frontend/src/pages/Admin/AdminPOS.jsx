import React, { useState, useEffect } from 'react';
import api, { adminAPI } from '../../services/api';

export default function AdminPOS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');

  // Cart
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  // Customer & Loyalty
  const [custSearch, setCustSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCust, setSelectedCust] = useState(null);
  const [usePoints, setUsePoints] = useState(false);

  // New Customer Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [regError, setRegError] = useState('');

  // Sale Complete Receipt Modal
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [posError, setPosError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        adminAPI.getProducts(),
        adminAPI.getCategories(),
      ]);
      setProducts(pRes?.products || []);
      setCategories(cRes?.categories || []);
    } catch (err) {
      console.error('Failed to load POS products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Search
  useEffect(() => {
    if (!custSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/pos/customers/search?query=${encodeURIComponent(custSearch)}`);
        setSearchResults(res?.customers || []);
      } catch (err) {
        console.error('Customer lookup failed:', err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [custSearch]);

  const handleSelectCustomer = (c) => {
    setSelectedCust(c);
    setCustSearch('');
    setSearchResults([]);
    setUsePoints(false);
  };

  const handleQuickRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!newCustName || !newCustPhone) {
      setRegError('Please provide both name and phone number');
      return;
    }
    try {
      const res = await api.post('/pos/customers/quick-register', {
        name: newCustName,
        phone: newCustPhone,
      });
      if (res?.success) {
        setSelectedCust(res.customer);
        setShowRegModal(false);
        setNewCustName('');
        setNewCustPhone('');
      }
    } catch (err) {
      setRegError(err?.message || 'Failed to register customer');
    }
  };

  // Cart operations
  const addToCart = (product) => {
    const itemStock = product.stock_qty !== undefined ? product.stock_qty : (product.stock !== undefined ? product.stock : 30);
    if (itemStock <= 0) return;

    const pId = String(product._id || product.id);
    const itemPrice = Number(product.base_price || product.price || 0);
    const itemWeight = product.weights?.[0]?.weight || 'Standard';

    setCart((prev) => {
      const existing = prev.find((item) => String(item.id || item._id) === pId);
      if (existing) {
        if (existing.quantity >= itemStock) return prev;
        return prev.map((item) =>
          String(item.id || item._id) === pId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: pId,
          _id: pId,
          product_id: pId,
          name: product.name,
          price: itemPrice,
          image: product.image_url || product.image || '/logo.png',
          stock: itemStock,
          weight: itemWeight,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (id, delta) => {
    const targetId = String(id);
    setCart((prev) =>
      prev
        .map((item) => {
          if (String(item.id || item._id) === targetId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    const targetId = String(id);
    setCart((prev) => prev.filter((item) => String(item.id || item._id) !== targetId));
  };

  // Calculations
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const maxRedeemablePoints = selectedCust
    ? Math.min(selectedCust.points || 0, Math.floor(subtotal))
    : 0;

  const pointsDiscount = usePoints ? maxRedeemablePoints : 0;
  const grandTotal = Math.max(0, subtotal - pointsDiscount);
  const pointsToEarn = Math.floor(grandTotal / 100) * 5;

  // Submit POS Order
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setPosError('');
    setIsSubmitting(true);

    try {
      const payload = {
        user_id: selectedCust ? (selectedCust.id || selectedCust._id) : null,
        items: cart.map((i) => ({
          product_id: i.product_id || i.id || i._id,
          product_name: i.name,
          quantity: i.quantity,
          unit_price: i.price,
          weight: i.weight,
        })),
        payment_method: paymentMethod,
        redeem_points: usePoints ? maxRedeemablePoints : 0,
      };

      const res = await api.post('/pos/sale', payload);
      if (res?.success) {
        setCompletedOrder(res.order);
        setCart([]);
        setSelectedCust(null);
        setUsePoints(false);
        fetchData(); // refresh stock counts
      }
    } catch (err) {
      setPosError(err?.message || 'Sale processing failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const pCatId = p.category_id?._id ? String(p.category_id._id) : String(p.category_id || '');
    const matchCat = !selectedCat || pCatId === selectedCat || String(p.category_name) === selectedCat;
    return matchSearch && matchCat;
  });

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', minHeight: '80vh' }}>
      
      {/* LEFT COLUMN: PRODUCT CATALOG */}
      <div>
        {/* Header & Search */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="admin-search-bar" style={{ flex: 1, minWidth: '240px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, stroke: '#6b7a9d', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="7.5" />
              <path d="M16.5 16.5L21 21" strokeWidth="2.8" />
              <path d="M8 8.5A5 5 0 0 1 13 7" strokeWidth="1.8" />
            </svg>
            <input
              placeholder="Search products for billing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c._id} value={String(c.id || c._id)}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Product Grid - Compact & Scrollable */}
        <div style={{
          maxHeight: 'calc(100vh - 210px)',
          overflowY: 'auto',
          paddingRight: '6px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
          gap: '12px'
        }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              No products found matching your search.
            </div>
          ) : (
            filteredProducts.map((p) => {
              const pId = String(p._id || p.id);
              const itemStock = p.stock_qty !== undefined ? p.stock_qty : (p.stock !== undefined ? p.stock : 30);
              const itemPrice = p.base_price || p.price || 0;
              const outOfStock = itemStock <= 0;

              return (
                <div
                  key={pId}
                  onClick={() => !outOfStock && addToCart(p)}
                  style={{
                    background: 'var(--color-surface, #1e2538)',
                    borderRadius: '10px',
                    padding: '10px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    opacity: outOfStock ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  className="pos-prod-card"
                >
                  <div>
                    <div style={{ height: '75px', width: '100%', borderRadius: '6px', overflow: 'hidden', marginBottom: '6px', background: '#121724' }}>
                      <img
                        src={p.image_url || p.image || '/logo.png'}
                        alt={p.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                    </div>
                    <h4 style={{ margin: '0 0 2px 0', fontSize: '0.85rem', color: '#fff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.name}>
                      {p.name}
                    </h4>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.weights?.[0]?.weight || 'Standard pack'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontWeight: '700', color: '#f59e0b', fontSize: '0.88rem', display: 'block' }}>₹{itemPrice}</span>
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: '600',
                          color: outOfStock ? '#ef4444' : itemStock <= 10 ? '#f59e0b' : '#22c55e',
                        }}
                      >
                        {outOfStock ? 'Out of stock' : `${itemStock} in stock`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); !outOfStock && addToCart(p); }}
                      disabled={outOfStock}
                      style={{
                        background: outOfStock ? '#334155' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: outOfStock ? '#94a3b8' : '#000',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontWeight: '700',
                        fontSize: '0.75rem',
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: POS BILLING WORKSTATION */}
      <div style={{ background: 'var(--color-surface, #1e2538)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 'fit-content', position: 'sticky', top: '20px' }}>
        
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>🛒 Shop Counter Sale</h3>
            <button
              onClick={() => setShowRegModal(true)}
              style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
            >
              + New Customer
            </button>
          </div>

          {/* Customer Selection */}
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Customer Mobile / Name (For Reward Points):
            </label>

            {selectedCust ? (
              <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{selectedCust.name}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>📱 {selectedCust.phone}</div>
                  <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '700', marginTop: '2px' }}>
                    ⭐ {selectedCust.points || 0} Loyalty Points (₹{selectedCust.points || 0} Value)
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedCust(null); setUsePoints(false); }}
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                  title="Remove customer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  placeholder="Enter phone number or name..."
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                  style={{ width: '100%', background: '#121724', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                />
                
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#181f32', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', marginTop: '4px', zIndex: 50, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                    {searchResults.map((c) => (
                      <div
                        key={c.id || c._id}
                        onClick={() => handleSelectCustomer(c)}
                        style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.88rem' }}>{c.name} ({c.phone})</div>
                        <div style={{ color: '#f59e0b', fontSize: '0.78rem' }}>⭐ {c.points || 0} Points Available</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '0.9rem' }}>
                🛒 Cart is empty.<br />Click products on the left to add items.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id || item._id}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div style={{ flex: 1, paddingRight: '8px' }}>
                    <div style={{ color: '#fff', fontSize: '0.88rem', fontWeight: '600' }}>{item.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}</div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => updateQuantity(item.id || item._id, -1)}
                      style={{ background: '#121724', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.88rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id || item._id, 1)}
                      style={{ background: '#121724', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', width: '26px', height: '26px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id || item._id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '6px' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Checkout Controls */}
        <div>
          {/* Points Redemption Checkbox */}
          {selectedCust && selectedCust.points > 0 && subtotal > 0 && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px dashed rgba(245, 158, 11, 0.4)', borderRadius: '10px', padding: '10px 12px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#fff', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={usePoints}
                  onChange={(e) => setUsePoints(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#f59e0b' }}
                />
                <span>Redeem <strong>{maxRedeemablePoints} Points</strong> for <strong>₹{maxRedeemablePoints} OFF</strong></span>
              </label>
            </div>
          )}

          {/* Payment Method Selector */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Payment Mode:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {['cash', 'upi', 'card'].map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: paymentMethod === m ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                    background: paymentMethod === m ? 'rgba(245, 158, 11, 0.15)' : '#121724',
                    color: paymentMethod === m ? '#f59e0b' : '#94a3b8',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {m === 'cash' ? '💵 Cash' : m === 'upi' ? '📱 UPI' : '💳 Card'}
                </button>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div style={{ background: '#121724', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            {pointsDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#22c55e', marginBottom: '6px' }}>
                <span>Reward Discount:</span>
                <span>- ₹{pointsDiscount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '700', color: '#fff', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <span>Grand Total:</span>
              <span style={{ color: '#f59e0b' }}>₹{grandTotal}</span>
            </div>
            {selectedCust && (
              <div style={{ fontSize: '0.78rem', color: '#22c55e', marginTop: '6px', textAlign: 'right' }}>
                ⭐ Customer will earn +{pointsToEarn} Reward Points
              </div>
            )}
          </div>

          {posError && (
            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '10px', textAlign: 'center' }}>
              ⚠️ {posError}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleCompleteSale}
            disabled={cart.length === 0 || isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              background: cart.length === 0 ? '#334155' : 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: cart.length === 0 ? '#94a3b8' : '#000',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: cart.length === 0 || isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: cart.length > 0 ? '0 4px 15px rgba(245, 158, 11, 0.3)' : 'none',
            }}
          >
            {isSubmitting ? 'Processing Bill...' : '⚡ Complete Sale & Generate Receipt'}
          </button>
        </div>
      </div>

      {/* QUICK REGISTER MODAL */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1e2538', borderRadius: '16px', padding: '24px', width: '380px', border: '1px solid rgba(255,255,255,0.15)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>👤 Register Customer</h3>
            <form onSubmit={handleQuickRegister}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121724', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#121724', border: '1px solid rgba(255,255,255,0.15)', color: '#fff' }}
                  placeholder="e.g. 9876543210"
                />
              </div>

              {regError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '12px' }}>{regError}</div>}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRegModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#f59e0b', color: '#000', fontWeight: '700', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save & Select</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED RECEIPT MODAL */}
      {completedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', color: '#000', borderRadius: '16px', padding: '28px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontFamily: 'monospace' }}>
            
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '12px', marginBottom: '12px' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem' }}>🍬 SVS SWEETS & BAKERY</h2>
              <div style={{ fontSize: '0.8rem', color: '#444' }}>Store Counter Invoice</div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>Date: {new Date(completedOrder.createdAt || Date.now()).toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>Order #{completedOrder._id ? completedOrder._id.toString().slice(-6).toUpperCase() : completedOrder.id}</div>
            </div>

            {/* Customer Info */}
            <div style={{ fontSize: '0.8rem', marginBottom: '12px', borderBottom: '1px solid #ddd', paddingBottom: '8px' }}>
              <div><strong>Customer:</strong> {completedOrder.customer_name || 'Walk-in'}</div>
              {completedOrder.customer_phone && <div><strong>Phone:</strong> {completedOrder.customer_phone}</div>}
              <div><strong>Payment:</strong> {completedOrder.payment_method?.toUpperCase()} (PAID)</div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', fontSize: '0.8rem', marginBottom: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                  <th style={{ paddingBottom: '4px' }}>Item</th>
                  <th style={{ textAlign: 'center', paddingBottom: '4px' }}>Qty</th>
                  <th style={{ textAlign: 'right', paddingBottom: '4px' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {completedOrder.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '4px 0' }}>{it.product_name}</td>
                    <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{it.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ borderTop: '2px dashed #000', paddingTop: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal:</span>
                <span>₹{completedOrder.subtotal}</span>
              </div>
              {completedOrder.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b91c1c' }}>
                  <span>Points Discount ({completedOrder.points_redeemed} pts):</span>
                  <span>- ₹{completedOrder.discount_amount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '6px', borderTop: '1px solid #000', paddingTop: '6px' }}>
                <span>TOTAL PAID:</span>
                <span>₹{completedOrder.total}</span>
              </div>
            </div>

            {/* Points Summary Badge */}
            {completedOrder.customer_phone && (
              <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '8px', marginTop: '12px', textAlign: 'center', fontSize: '0.78rem' }}>
                ⭐ Points Earned: <strong>+{completedOrder.points_earned}</strong> | Balance: <strong>{completedOrder.points_balance} pts</strong>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.75rem', color: '#666' }}>
              Thank you for shopping with SVS Sweets! 🍬<br />Visit Again!
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => window.print()}
                style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

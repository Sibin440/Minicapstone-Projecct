import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import './CartDrawer.css';

export default function CartDrawer() {
  const { cart = { items: [], subtotal: 0, item_count: 0 }, cartOpen, closeCart, updateItem, removeItem } = useCart();
  const { addToast } = useToast();

  const items = cart?.items || [];
  const itemCount = cart?.item_count || 0;
  const subtotal = cart?.subtotal || 0;

  const handleUpdate = async (itemId, qty) => {
    try { await updateItem(itemId, qty); }
    catch (e) { addToast('Failed to update cart', 'error'); }
  };

  const handleRemove = async (itemId, name) => {
    try {
      await removeItem(itemId);
      addToast(`${name} removed from cart`, 'info');
    } catch (e) { addToast('Failed to remove item', 'error'); }
  };

  return (
    <>
      <div className={`drawer-backdrop ${cartOpen ? 'open' : ''}`} onClick={closeCart} />
      <div className={`cart-drawer ${cartOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span>🛒</span>
            <h2>Your Cart</h2>
            {itemCount > 0 && <span className="drawer-count">{itemCount}</span>}
          </div>
          <button className="drawer-close" onClick={closeCart}>✕</button>
        </div>

        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="drawer-empty">
              <div className="drawer-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some delicious treats!</p>
              <Link to="/products" className="btn-primary" onClick={closeCart}>Start Shopping</Link>
            </div>
          ) : (
            <div className="drawer-items">
              {items.map(item => (
                <div key={item.id} className="drawer-item">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'}
                    alt={item.name}
                    className="drawer-item-img"
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'; }}
                  />
                  <div className="drawer-item-details">
                    <h4 className="drawer-item-name">{item.name}</h4>
                    <p className="drawer-item-weight">{item.weight}</p>
                    <p className="drawer-item-price">₹{(item.unit_price || 0).toFixed(2)} each</p>
                    <div className="drawer-item-controls">
                      <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity - 1)}>−</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => handleUpdate(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="drawer-item-right">
                    <p className="drawer-item-total">₹{(item.total_price || 0).toFixed(2)}</p>
                    <button className="remove-btn" onClick={() => handleRemove(item.id, item.name)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="drawer-footer">
            <div className="drawer-subtotal">
              <span>Subtotal ({itemCount} items)</span>
              <span className="subtotal-amount">₹{subtotal.toFixed(2)}</span>
            </div>
            {subtotal < 500 && (
              <p className="free-delivery-hint">Add ₹{(500 - subtotal).toFixed(2)} more for free delivery!</p>
            )}
            <Link to="/cart" className="btn-primary drawer-view-cart" onClick={closeCart}>View Cart</Link>
            <Link to="/checkout" className="btn-navy drawer-checkout" onClick={closeCart}>Checkout →</Link>
          </div>
        )}
      </div>
    </>
  );
}

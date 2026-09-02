import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { couponAPI } from '../../services/api';
import './Cart.css';

export default function Cart() {
  const { cart, updateItem, removeItem, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.apply({ code: couponCode, cart_total: cart.subtotal });
      setAppliedCoupon(res.coupon);
      addToast(`Coupon ${res.coupon.code} applied! Saved ₹${res.coupon.discount_amount}`, 'success');
    } catch (e) {
      addToast(e.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const deliveryCharge = cart.subtotal >= 500 || cart.subtotal === 0 ? 0 : 50;
  const grandTotal = Math.max(0, cart.subtotal - discountAmount + deliveryCharge);

  if (cart.items.length === 0) {
    return (
      <div className="cart-page page-enter container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', margin: '1rem 0' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Explore our sweets and savouries to fill your cart!</p>
        <Link to="/products" className="btn-primary">Browse Delicacies</Link>
      </div>
    );
  }

  return (
    <div className="cart-page page-enter container">
      <h1 className="cart-page-title">Shopping Cart</h1>

      <div className="cart-grid">
        <div className="cart-items-section">
          <div className="cart-table-header">
            <span>Product</span>
            <span>Weight</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span>Action</span>
          </div>

          <div className="cart-table-body">
            {cart.items.map(item => (
              <div key={item.id} className="cart-row">
                <div className="cart-col-product">
                  <img src={item.image_url} alt={item.name} className="cart-img" />
                  <div>
                    <h4 className="cart-item-name">{item.name}</h4>
                    {item.is_pure_veg === 1 && <span style={{ fontSize: '0.7rem', color: 'var(--green-badge)' }}>🌿 Pure Veg</span>}
                  </div>
                </div>

                <div className="cart-col-weight">{item.weight}</div>

                <div className="cart-col-price">₹{item.unit_price.toFixed(2)}</div>

                <div className="cart-col-qty">
                  <div className="details-qty-stepper">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="cart-col-total">₹{item.total_price.toFixed(2)}</div>

                <div className="cart-col-action">
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-actions-row">
            <button className="btn-outline" onClick={clearCart}>Clear Cart</button>
            <Link to="/products" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary-card">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cart.subtotal.toFixed(2)}</span>
          </div>

          {appliedCoupon && (
            <div className="summary-row discount-row">
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Charge</span>
            <span>{deliveryCharge === 0 ? <strong style={{ color: 'var(--green-badge)' }}>FREE</strong> : `₹${deliveryCharge.toFixed(2)}`}</span>
          </div>

          {cart.subtotal < 500 && (
            <p className="free-delivery-hint" style={{ marginTop: '0.5rem' }}>
              Add ₹{(500 - cart.subtotal).toFixed(2)} more for FREE Delivery!
            </p>
          )}

          <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

          <div className="summary-row grand-total-row">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>

          <form onSubmit={handleApplyCoupon} className="coupon-form">
            <input
              type="text"
              placeholder="Coupon Code (e.g. SWEET20)"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
            />
            <button type="submit" className="btn-navy" disabled={couponLoading}>Apply</button>
          </form>

          <button
            className="btn-primary checkout-btn"
            onClick={() => navigate('/checkout', { state: { coupon_code: appliedCoupon?.code } })}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

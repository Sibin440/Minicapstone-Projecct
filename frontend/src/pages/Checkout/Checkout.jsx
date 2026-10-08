import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

const MIN_ORDER_AMOUNT = 400;

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [address, setAddress] = useState({
    name: '', phone: '', address_line1: '', address_line2: '', city: 'Mumbai', state: 'Maharashtra', pincode: ''
  });
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);
  const [loyaltyOffer, setLoyaltyOffer] = useState(null);

  const couponCode = location.state?.coupon_code || '';

  const subtotal = cart.subtotal || 0;
  const isBelowMinimum = subtotal < MIN_ORDER_AMOUNT;
  const amountNeeded = MIN_ORDER_AMOUNT - subtotal;

  // Compute discount from loyalty offer (auto-applied) or coupon
  const loyaltyDiscount = loyaltyOffer?.coupon
    ? Math.round((subtotal * loyaltyOffer.discount) / 100)
    : 0;
  const discountedSubtotal = subtotal - loyaltyDiscount;
  const deliveryCharge = discountedSubtotal >= 500 ? 0 : 50;
  const total = discountedSubtotal + deliveryCharge;

  // Fetch loyalty offer for logged-in users
  useEffect(() => {
    if (!user) return;
    orderAPI.getLoyaltyOffer()
      .then(data => setLoyaltyOffer(data.offer))
      .catch(() => {});
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.address_line1 || !address.pincode) {
      addToast('Please fill all required address fields', 'error');
      return;
    }
    if (isBelowMinimum) {
      addToast(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Add ₹${amountNeeded} more to proceed.`, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await orderAPI.create({
        address_id: null,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
        coupon_code: couponCode,
      });

      if (res.loyalty_offer_msg) {
        addToast(res.loyalty_offer_msg, 'success');
      }
      addToast('🎉 Order placed successfully!', 'success');
      clearCart();
      navigate('/my-orders');
    } catch (err) {
      addToast(err.message || 'Failed to place order. Please login first.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page page-enter container">
      <h1 className="checkout-title">Checkout</h1>

      {/* ── Minimum Order Banner ── */}
      {isBelowMinimum && (
        <div className="checkout-alert checkout-alert--warning">
          <span>🚚</span>
          <div>
            <strong>Minimum ₹{MIN_ORDER_AMOUNT} required for online delivery</strong>
            <p>Add items worth ₹{amountNeeded.toFixed(2)} more to place your order.</p>
          </div>
        </div>
      )}

      {/* ── Loyalty Offer Banner ── */}
      {loyaltyOffer?.coupon && (
        <div className="checkout-alert checkout-alert--success">
          <span>🎁</span>
          <div>
            <strong>{loyaltyOffer.label}</strong>
            <p>
              {loyaltyOffer.description} — Coupon <code>{loyaltyOffer.coupon}</code> will be auto-applied!
              You've placed <strong>{loyaltyOffer.orders_placed}</strong> orders with us. Thank you! 🙏
            </p>
          </div>
        </div>
      )}
      {loyaltyOffer && !loyaltyOffer.coupon && (
        <div className="checkout-alert checkout-alert--info">
          <span>⭐</span>
          <div>
            <strong>Earn Loyalty Rewards!</strong>
            <p>{loyaltyOffer.description}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="checkout-grid">
        <div className="checkout-form-section">
          {/* Step 1: Address */}
          <div className="checkout-card">
            <h3>1. Delivery Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input type="text" value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Address Line 1 *</label>
              <input type="text" value={address.address_line1} onChange={e => setAddress({ ...address, address_line1: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Address Line 2 (Optional)</label>
              <input type="text" value={address.address_line2} onChange={e => setAddress({ ...address, address_line2: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input type="text" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Pincode *</label>
                <input type="text" value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} required />
              </div>
            </div>
          </div>

          {/* Step 2: Slot */}
          <div className="checkout-card">
            <h3>2. Preferred Delivery Slot</h3>
            <div className="slot-options">
              {['Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 8 PM)'].map(slot => (
                <label key={slot} className={`slot-radio ${deliverySlot === slot ? 'active' : ''}`}>
                  <input type="radio" name="slot" value={slot} checked={deliverySlot === slot} onChange={() => setDeliverySlot(slot)} />
                  <span>{slot}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 3: Payment */}
          <div className="checkout-card">
            <h3>3. Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-radio ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input type="radio" name="pay" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                <span>💰 Cash on Delivery (COD)</span>
              </label>
              <label className={`payment-radio ${paymentMethod === 'online' ? 'active' : ''}`}>
                <input type="radio" name="pay" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                <span>📱 UPI / NetBanking / Cards</span>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary Right */}
        <div className="checkout-summary-card">
          <h3>Your Order ({cart.items.length} items)</h3>
          <div className="summary-items-list">
            {cart.items.map(item => (
              <div key={item.id} className="summary-item">
                <span>{item.name} ({item.weight}) x {item.quantity}</span>
                <span>₹{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          {loyaltyDiscount > 0 && (
            <div className="summary-row summary-row--discount">
              <span>🎁 Loyalty Discount ({loyaltyOffer?.discount}%)</span>
              <span>−₹{loyaltyDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Delivery Charge</span>
            <span>{deliveryCharge === 0 ? <span className="free-delivery">FREE</span> : `₹${deliveryCharge}`}</span>
          </div>

          {deliveryCharge === 0 && (
            <div className="summary-note">🚚 Free delivery on orders above ₹500!</div>
          )}

          <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />
          <div className="summary-row grand-total-row">
            <span>Total Payable</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {/* Minimum order warning */}
          {isBelowMinimum && (
            <div className="min-order-bar">
              <div className="min-order-progress">
                <div
                  className="min-order-fill"
                  style={{ width: `${Math.min((subtotal / MIN_ORDER_AMOUNT) * 100, 100)}%` }}
                />
              </div>
              <p className="min-order-text">Add ₹{amountNeeded.toFixed(2)} more to unlock delivery</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary place-order-btn"
            disabled={loading || isBelowMinimum}
            title={isBelowMinimum ? `Add ₹${amountNeeded} more to place order` : ''}
          >
            {loading ? 'Placing Order...' : isBelowMinimum ? `Add ₹${amountNeeded.toFixed(0)} More` : 'Confirm & Place Order →'}
          </button>
        </div>
      </form>
    </div>
  );
}

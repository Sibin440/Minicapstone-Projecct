import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderAPI } from '../../services/api';
import './Checkout.css';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [address, setAddress] = useState({
    name: '', phone: '', address_line1: '', address_line2: '', city: 'Mumbai', state: 'Maharashtra', pincode: ''
  });
  const [deliverySlot, setDeliverySlot] = useState('Morning (8 AM - 12 PM)');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const couponCode = location.state?.coupon_code || '';

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.address_line1 || !address.pincode) {
      addToast('Please fill all required address fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await orderAPI.create({
        address_id: null,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
        coupon_code: couponCode
      });
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
            <span>₹{cart.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row grand-total-row">
            <span>Total Payable</span>
            <span>₹{cart.subtotal.toFixed(2)}</span>
          </div>
          <button type="submit" className="btn-primary place-order-btn" disabled={loading}>
            {loading ? 'Placing Order...' : 'Confirm & Place Order →'}
          </button>
        </div>
      </form>
    </div>
  );
}

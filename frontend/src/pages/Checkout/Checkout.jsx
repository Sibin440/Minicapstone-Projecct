import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Checkout.css';

const MIN_ORDER_AMOUNT = 400;
const DELIVERY_CITY = 'Chennai';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [address, setAddress] = useState({
    name: '', phone: '', address_line1: '', address_line2: '', city: 'Chennai', state: 'Tamil Nadu', pincode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'online'
  const [loading, setLoading] = useState(false);
  const [loyaltyOffer, setLoyaltyOffer] = useState(null);

  // Razorpay Gateway Modal State
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [activeGatewayTab, setActiveGatewayTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'processing' | 'success'

  // Form input states inside Razorpay modal
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('paytm');

  const couponCode = location.state?.coupon_code || '';

  // ── Auto-fill address from registration / profile details ──
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        name: user.name || prev.name || '',
        phone: user.phone || prev.phone || '',
        address_line1: user.address_line1 || prev.address_line1 || '',
        address_line2: user.address_line2 || prev.address_line2 || '',
        city: user.city || prev.city || 'Chennai',
        state: user.state || prev.state || 'Tamil Nadu',
        pincode: user.pincode || prev.pincode || '',
      }));
      setCardName(user.name || '');
    }
  }, [user]);

  const subtotal = cart.subtotal || 0;
  const isBelowMinimum = subtotal < MIN_ORDER_AMOUNT;
  const amountNeeded = MIN_ORDER_AMOUNT - subtotal;
  const isWrongCity = address.city.trim().toLowerCase() !== DELIVERY_CITY.toLowerCase();

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

  // Card number formatter
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  // Card Expiry formatter
  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  const validateAddress = () => {
    if (!address.name || !address.phone || !address.address_line1 || !address.pincode) {
      addToast('Please fill all required address fields', 'error');
      return false;
    }
    if (isWrongCity) {
      addToast(`Sorry! We only deliver within ${DELIVERY_CITY}. Please update your city.`, 'error');
      return false;
    }
    if (isBelowMinimum) {
      addToast(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Add ₹${amountNeeded} more to proceed.`, 'error');
      return false;
    }
    return true;
  };

  // Main submission handler
  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!validateAddress()) return;

    if (paymentMethod === 'online') {
      // Open Razorpay gateway modal UI
      setPaymentStep('select');
      setShowGatewayModal(true);
      return;
    }

    // Direct Cash On Delivery Order
    executeOrderCreation('cod');
  };

  // Final order creation execution
  const executeOrderCreation = async (method = 'cod') => {
    setLoading(true);
    try {
      const res = await orderAPI.create({
        address_id: null,
        address: address, // Send the complete current address
        delivery_slot: 'Standard Delivery',
        payment_method: method,
        coupon_code: couponCode,
      });

      if (res.loyalty_offer_msg) {
        addToast(res.loyalty_offer_msg, 'success');
      }
      addToast('🎉 Order placed successfully!', 'success');
      clearCart();
      setShowGatewayModal(false);
      navigate('/my-orders');
    } catch (err) {
      addToast(err.message || 'Failed to place order. Please login first.', 'error');
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  // Simulated Razorpay payment execution
  const handleRazorpayPay = () => {
    setProcessingPayment(true);
    setPaymentStep('processing');

    // Simulate 1.5s gateway authentication delay
    setTimeout(() => {
      setPaymentStep('success');
      setTimeout(() => {
        executeOrderCreation('online');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="checkout-page page-enter container">
      <h1 className="checkout-title">Checkout</h1>

      {/* ── Wrong City Warning ── */}
      {isWrongCity && (
        <div className="checkout-alert checkout-alert--danger">
          <span>🚫</span>
          <div>
            <strong>"{address.city}" is not serviceable</strong>
            <p>We only deliver within <strong>Chennai</strong>. Please change your city to Chennai to place the order.</p>
          </div>
        </div>
      )}

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
                <input
                  type="text"
                  value={address.name}
                  onChange={e => setAddress({ ...address, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="text"
                  value={address.phone}
                  onChange={e => setAddress({ ...address, phone: e.target.value })}
                  required
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <input
                type="text"
                value={address.address_line1}
                placeholder="House / Flat No., Street, Landmark"
                onChange={e => setAddress({ ...address, address_line1: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City * <span style={{ fontSize: '.72rem', color: '#dc2626', fontWeight: 600 }}>(Chennai only)</span></label>
                <input
                  type="text"
                  value={address.city}
                  onChange={e => setAddress({ ...address, city: e.target.value })}
                  required
                  placeholder="Chennai"
                  style={{ borderColor: isWrongCity ? '#ef4444' : undefined, background: isWrongCity ? '#fef2f2' : undefined }}
                />
                {isWrongCity && (
                  <span style={{ fontSize: '.72rem', color: '#dc2626', marginTop: '4px', display: 'block' }}>
                    ⚠️ Only Chennai is serviceable
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={e => setAddress({ ...address, state: e.target.value })}
                  placeholder="Tamil Nadu"
                  style={{ background: '#f8fafc', color: '#6b7a9d' }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  value={address.pincode}
                  onChange={e => setAddress({ ...address, pincode: e.target.value })}
                  required
                  placeholder="6-digit pincode"
                  maxLength={6}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-card">
            <div className="payment-card-header">
              <h3>2. Select Payment Method</h3>
              <div className="secure-badge">
                <span>🔒 256-Bit SSL Encrypted</span>
              </div>
            </div>

            <div className="payment-options-enhanced">
              {/* Option 1: Cash on Delivery */}
              <div
                className={`enhanced-pay-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="pay-card-top">
                  <div className="pay-radio-circle">
                    {paymentMethod === 'cod' && <div className="pay-radio-dot" />}
                  </div>
                  <div className="pay-card-icon">💵</div>
                  <div className="pay-card-details">
                    <div className="pay-card-title">Cash on Delivery (COD)</div>
                    <div className="pay-card-sub">Pay via cash or scan QR upon doorstep arrival</div>
                  </div>
                  <span className="pay-pill standard">Available</span>
                </div>
              </div>

              {/* Option 2: Online Payment (Razorpay Gateway) */}
              <div
                className={`enhanced-pay-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('online')}
              >
                <div className="pay-card-top">
                  <div className="pay-radio-circle">
                    {paymentMethod === 'online' && <div className="pay-radio-dot" />}
                  </div>
                  <div className="pay-card-icon">⚡</div>
                  <div className="pay-card-details">
                    <div className="pay-card-title-row">
                      <span className="pay-card-title">Online Payment</span>
                      <span className="razorpay-inline-badge">Razorpay</span>
                    </div>
                    <div className="pay-card-sub">Instant confirmation via UPI, Cards, NetBanking, Wallets</div>
                  </div>
                  <span className="pay-pill recommended">Fast &amp; Secure</span>
                </div>

                {/* Sub-logos and preview badges */}
                <div className="pay-gateway-channels">
                  <div className="channel-item">
                    <span className="channel-icon">📱</span>
                    <span>UPI / GPay / PhonePe</span>
                  </div>
                  <div className="channel-item">
                    <span className="channel-icon">💳</span>
                    <span>Credit / Debit Cards</span>
                  </div>
                  <div className="channel-item">
                    <span className="channel-icon">🏦</span>
                    <span>50+ Banks Netbanking</span>
                  </div>
                  <div className="channel-item">
                    <span className="channel-icon">👛</span>
                    <span>Paytm &amp; Wallets</span>
                  </div>
                </div>

                {paymentMethod === 'online' && (
                  <div className="online-selected-notice">
                    <span className="notice-icon">🛡️</span>
                    <span>You will complete payment through Razorpay's secure checkout gateway.</span>
                  </div>
                )}
              </div>
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
            className={`btn-primary place-order-btn ${paymentMethod === 'online' ? 'rzp-glow-btn' : ''}`}
            disabled={loading || isBelowMinimum || isWrongCity}
            title={isWrongCity ? 'Only Chennai is serviceable' : isBelowMinimum ? `Add ₹${amountNeeded} more to place order` : ''}
          >
            {loading ? 'Processing Order...'
              : isWrongCity ? '🚫 Chennai Delivery Only'
              : isBelowMinimum ? `Add ₹${amountNeeded.toFixed(0)} More`
              : paymentMethod === 'online' ? `Pay ₹${total.toFixed(2)} with Razorpay →`
              : 'Confirm & Place Order (COD) →'}
          </button>

          <div className="gateway-trust-footer">
            <div className="trust-lock">🔒 Verified Secure Checkout</div>
            <div className="trust-methods">Razorpay • UPI • RuPay • Visa • MC</div>
          </div>
        </div>
      </form>

      {/* ════════════════════════════════════════════════════════════════
          ─── RAZORPAY PAYMENT GATEWAY MODAL (MOCKUP UI) ───
      ════════════════════════════════════════════════════════════════ */}
      {showGatewayModal && (
        <div className="rzp-modal-overlay" onClick={() => !processingPayment && setShowGatewayModal(false)}>
          <div className="rzp-modal-container" onClick={e => e.stopPropagation()}>
            
            {/* Razorpay Top Header */}
            <div className="rzp-modal-header">
              <div className="rzp-header-left">
                <div className="rzp-merchant-avatar">🍬</div>
                <div className="rzp-header-info">
                  <div className="rzp-merchant-name">CREAMY BITES BAKERY</div>
                  <div className="rzp-order-id">Order Amount: <strong>₹{total.toFixed(2)}</strong></div>
                </div>
              </div>
              <div className="rzp-header-right">
                <div className="rzp-brand-logo">
                  <span className="rzp-brand-title">Razorpay</span>
                  <span className="rzp-brand-badge">SECURE</span>
                </div>
                {!processingPayment && (
                  <button className="rzp-close-btn" onClick={() => setShowGatewayModal(false)}>✕</button>
                )}
              </div>
            </div>

            {/* Modal Body: Processing / Success / Payment Selection */}
            {paymentStep === 'processing' ? (
              <div className="rzp-processing-view">
                <div className="rzp-spinner"></div>
                <h4>Connecting to Bank Gateway...</h4>
                <p>Authenticating your transaction securely with Razorpay. Please do not close or refresh this window.</p>
                <div className="rzp-secure-indicator">🔒 256-Bit Encrypted Communication</div>
              </div>
            ) : paymentStep === 'success' ? (
              <div className="rzp-success-view">
                <div className="rzp-success-icon">✓</div>
                <h4>Payment Successful!</h4>
                <p>₹{total.toFixed(2)} received successfully via Razorpay.</p>
                <div className="rzp-sub-text">Finalizing your bakery order...</div>
              </div>
            ) : (
              <div className="rzp-modal-body">
                {/* User Contact Preview Bar */}
                <div className="rzp-contact-bar">
                  <span>👤 {address.name || 'Customer'}</span>
                  <span>📱 +91 {address.phone || '9876543210'}</span>
                  <span>📍 {address.city}, Tamil Nadu</span>
                </div>

                <div className="rzp-body-layout">
                  {/* Left Navigation Tabs */}
                  <div className="rzp-tabs-sidebar">
                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeGatewayTab === 'upi' ? 'active' : ''}`}
                      onClick={() => setActiveGatewayTab('upi')}
                    >
                      <span className="tab-icon">📱</span>
                      <div className="tab-texts">
                        <span className="tab-title">UPI / QR</span>
                        <span className="tab-sub">Google Pay, PhonePe, Paytm</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeGatewayTab === 'card' ? 'active' : ''}`}
                      onClick={() => setActiveGatewayTab('card')}
                    >
                      <span className="tab-icon">💳</span>
                      <div className="tab-texts">
                        <span className="tab-title">Cards</span>
                        <span className="tab-sub">Credit or Debit (Visa, RuPay)</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeGatewayTab === 'netbanking' ? 'active' : ''}`}
                      onClick={() => setActiveGatewayTab('netbanking')}
                    >
                      <span className="tab-icon">🏦</span>
                      <div className="tab-texts">
                        <span className="tab-title">Netbanking</span>
                        <span className="tab-sub">All Indian Banks</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`rzp-tab-btn ${activeGatewayTab === 'wallet' ? 'active' : ''}`}
                      onClick={() => setActiveGatewayTab('wallet')}
                    >
                      <span className="tab-icon">👛</span>
                      <div className="tab-texts">
                        <span className="tab-title">Wallets</span>
                        <span className="tab-sub">Paytm, Amazon Pay, Mobikwik</span>
                      </div>
                    </button>
                  </div>

                  {/* Right Tab Content */}
                  <div className="rzp-tab-content">
                    {/* ── TAB 1: UPI ── */}
                    {activeGatewayTab === 'upi' && (
                      <div className="rzp-upi-view">
                        <div className="rzp-qr-box">
                          <div className="rzp-qr-header">Scan QR Code with any UPI App</div>
                          <div className="rzp-qr-mockup">
                            {/* Realistic SVG QR Pattern */}
                            <svg viewBox="0 0 100 100" className="rzp-qr-svg">
                              <rect width="100" height="100" fill="white"/>
                              <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M20,20 h5 v5 h-5 z" fill="#0c2340"/>
                              <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M75,20 h5 v5 h-5 z" fill="#0c2340"/>
                              <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M20,75 h5 v5 h-5 z" fill="#0c2340"/>
                              <circle cx="50" cy="50" r="10" fill="#3395ff"/>
                              <path d="M45,15 h10 v5 h-10 z M15,45 h5 v10 h-5 z M45,45 h10 v10 h-10 z M65,45 h20 v5 h-20 z M45,65 h10 v20 h-10 z M65,65 h20 v20 h-20 z" fill="#0c2340"/>
                            </svg>
                            <div className="qr-brand-overlay">UPI</div>
                          </div>
                          <div className="rzp-qr-apps">
                            <span className="app-badge gpay">GPay</span>
                            <span className="app-badge phonepe">PhonePe</span>
                            <span className="app-badge paytm">Paytm</span>
                            <span className="app-badge bhim">BHIM</span>
                          </div>
                        </div>

                        <div className="rzp-divider-or"><span>OR PAY VIA UPI ID</span></div>

                        <div className="rzp-input-group">
                          <label>Enter Virtual Payment Address (VPA / UPI ID)</label>
                          <div className="rzp-input-action-wrap">
                            <input
                              type="text"
                              placeholder="e.g. mobileNumber@upi or name@okhdfcbank"
                              value={upiId}
                              onChange={e => setUpiId(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── TAB 2: CARDS ── */}
                    {activeGatewayTab === 'card' && (
                      <div className="rzp-card-view">
                        <div className="rzp-input-group">
                          <label>Card Number</label>
                          <div className="rzp-card-input-wrap">
                            <input
                              type="text"
                              placeholder="4532 •••• •••• 8910"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                            />
                            <div className="rzp-card-logos">
                              <span className="card-chip">VISA</span>
                              <span className="card-chip master">MC</span>
                              <span className="card-chip rupay">RuPay</span>
                            </div>
                          </div>
                        </div>

                        <div className="rzp-form-inline">
                          <div className="rzp-input-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM / YY"
                              value={cardExpiry}
                              onChange={handleExpiryChange}
                              maxLength={5}
                            />
                          </div>
                          <div className="rzp-input-group">
                            <label>CVV / CVC</label>
                            <input
                              type="password"
                              placeholder="•••"
                              value={cardCvv}
                              onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <div className="rzp-input-group">
                          <label>Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="Name on card"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                          />
                        </div>

                        <label className="rzp-checkbox-label">
                          <input type="checkbox" defaultChecked />
                          <span>Save this card securely according to RBI guidelines</span>
                        </label>
                      </div>
                    )}

                    {/* ── TAB 3: NETBANKING ── */}
                    {activeGatewayTab === 'netbanking' && (
                      <div className="rzp-netbanking-view">
                        <label className="nb-label">Popular Indian Banks</label>
                        <div className="rzp-banks-grid">
                          {[
                            { code: 'HDFC', name: 'HDFC Bank', icon: '🏛️' },
                            { code: 'SBI', name: 'State Bank of India', icon: '🏦' },
                            { code: 'ICICI', name: 'ICICI Bank', icon: '🏢' },
                            { code: 'AXIS', name: 'Axis Bank', icon: '🏧' },
                            { code: 'KOTAK', name: 'Kotak Mahindra', icon: '🏦' },
                            { code: 'PNB', name: 'Punjab National Bank', icon: '🏛️' },
                          ].map(bank => (
                            <button
                              key={bank.code}
                              type="button"
                              className={`rzp-bank-card ${selectedBank === bank.code ? 'selected' : ''}`}
                              onClick={() => setSelectedBank(bank.code)}
                            >
                              <span className="bank-icon">{bank.icon}</span>
                              <span className="bank-name">{bank.name}</span>
                            </button>
                          ))}
                        </div>

                        <div className="rzp-input-group" style={{ marginTop: '12px' }}>
                          <label>Other Banks</label>
                          <select className="rzp-bank-select" defaultValue="">
                            <option value="" disabled>-- Select from all other banks --</option>
                            <option value="BOB">Bank of Baroda</option>
                            <option value="CANARA">Canara Bank</option>
                            <option value="UNION">Union Bank of India</option>
                            <option value="INDUSIND">IndusInd Bank</option>
                            <option value="YES">Yes Bank</option>
                            <option value="IDBI">IDBI Bank</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* ── TAB 4: WALLETS ── */}
                    {activeGatewayTab === 'wallet' && (
                      <div className="rzp-wallet-view">
                        <label className="nb-label">Select Digital Wallet</label>
                        <div className="rzp-wallets-list">
                          {[
                            { id: 'paytm', name: 'Paytm Wallet', icon: '🅿️', desc: 'Link & pay with 1-click OTP' },
                            { id: 'amazon', name: 'Amazon Pay Balance', icon: '🛒', desc: 'Use your Amazon Pay account' },
                            { id: 'phonepe', name: 'PhonePe Wallet', icon: '🟣', desc: 'Direct wallet deduction' },
                            { id: 'mobikwik', name: 'MobiKwik', icon: '⚡', desc: 'Pay with wallet or ZIP' },
                          ].map(w => (
                            <label
                              key={w.id}
                              className={`rzp-wallet-item ${selectedWallet === w.id ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                name="rzp_wallet"
                                value={w.id}
                                checked={selectedWallet === w.id}
                                onChange={() => setSelectedWallet(w.id)}
                              />
                              <span className="wallet-emoji">{w.icon}</span>
                              <div className="wallet-info">
                                <div className="wallet-name">{w.name}</div>
                                <div className="wallet-desc">{w.desc}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gateway Modal Footer */}
                <div className="rzp-modal-footer">
                  <div className="rzp-footer-security">
                    <span className="sec-icon">🔒</span>
                    <div>
                      <strong>Razorpay Trusted Payment Gateway</strong>
                      <span>PCI-DSS Level 1 Compliant • 100% Buyer Protection</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rzp-pay-submit-btn"
                    onClick={handleRazorpayPay}
                    disabled={processingPayment}
                  >
                    <span>Pay ₹{total.toFixed(2)}</span>
                    <span className="arrow-icon">→</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

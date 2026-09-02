import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span>🪔</span>
              <div>
                <p className="footer-brand-name">SVS Sweets & Bakery</p>
                <p className="footer-brand-tagline">Traditional Taste. Timeless Joy.</p>
              </div>
            </Link>
            <p className="footer-desc">Delivering authentic Indian sweets, bakery, and savouries since generations. Made with love, pure ingredients, and traditional recipes.</p>
            <div className="footer-badges">
              <span className="footer-badge">💬 "Sweet by tradition"</span>
              <span className="footer-badge">👨‍🍳 Authentic</span>
              <span className="footer-badge">🏅 Trusted</span>
            </div>
          </div>
          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/products">All Products</Link>
            <Link to="/my-orders">My Orders</Link>
            <Link to="/profile">My Profile</Link>
          </div>
          <div className="footer-links-group">
            <h4>Categories</h4>
            <Link to="/category/sweets">Sweets</Link>
            <Link to="/category/savouries">Savouries</Link>
            <Link to="/category/cakes">Cakes</Link>
            <Link to="/category/snacks">Snacks</Link>
            <Link to="/category/cookies-biscuits">Cookies & Biscuits</Link>
            <Link to="/category/breads">Breads</Link>
            <Link to="/category/beverages">Beverages</Link>
          </div>
          <div className="footer-contact">
            <h4>Get in Touch</h4>
            <p>📞 1800-XXX-XXXX</p>
            <p>✉️ hello@mithaimandir.com</p>
            <p>📍 Mumbai, Maharashtra</p>
            <p>🕐 Mon–Sat, 9am–8pm</p>
            <div className="footer-social">
              <a href="#" className="social-btn">📘</a>
              <a href="#" className="social-btn">📸</a>
              <a href="#" className="social-btn">🐦</a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© 2024 SVS Sweets & Bakery. All rights reserved. | Made with ❤️ in India</p>
          <div className="payment-methods">
            <span className="payment-badge">💳 Cards</span>
            <span className="payment-badge">📱 UPI</span>
            <span className="payment-badge">🏦 Net Banking</span>
            <span className="payment-badge">💰 COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

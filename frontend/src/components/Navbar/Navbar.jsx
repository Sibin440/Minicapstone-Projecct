import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productAPI, adminAPI } from '../../services/api';
import './Navbar.css';

const LOCATIONS = ['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const [locationOpen, setLocationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);
  const searchRef = useRef(null);
  const userRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    if (!user) { setRewardPoints(0); return; }
    adminAPI.getMyLoyalty()
      .then(r => setRewardPoints(r.balance || 0))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
      if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) { setSearchOpen(false); setSearchResults([]); }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await productAPI.search(searchQuery);
        setSearchResults(data.products.slice(0, 6));
      } catch (_) {}
      finally { setSearchLoading(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-topbar">
        <div className="container topbar-inner">
          <div className="location-selector" ref={locationRef} onClick={() => setLocationOpen(o => !o)}>
            <svg className="nav-svg-icon location-pin-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className="location-text">{selectedLocation}</span>
            <span className={`location-chevron ${locationOpen ? 'open' : ''}`}>▾</span>
            {locationOpen && (
              <div className="location-dropdown">
                <p className="location-dropdown-title">Select Your City</p>
                {LOCATIONS.map(loc => (
                  <button key={loc} className={`location-option ${selectedLocation === loc ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); setLocationOpen(false); }}>
                    {loc}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="topbar-tabs">
            {user ? (
              <Link to="/profile" className="topbar-tab reward-tab" title="Earned based on your previous purchases">
                🪙 Reward Points: <strong>{rewardPoints} pts</strong>
              </Link>
            ) : (
              <Link to="/login" className="topbar-tab reward-tab">
                🪙 Earn Reward Points
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="navbar-main">
        <div className="container navbar-main-inner">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">
              <img src="/logo.png" alt="SVS Bakery" className="custom-brand-logo-img" onError={(e) => { e.target.onerror = null; e.target.src = 'http://localhost:5000/uploads/logo.png'; }} />
              <div className="brand-text">
                <span className="brand-name">SVS Bakery</span>
                <span className="brand-tagline">Sweets & Snacks</span>
              </div>
            </div>
          </Link>

          <nav className="navbar-nav" aria-label="Main navigation">
            <Link to="/category/sweets" className="nav-link">Sweets</Link>
            <Link to="/category/savouries" className="nav-link">Savouries</Link>
            <Link to="/category/cakes" className="nav-link">Cakes</Link>
            <Link to="/category/snacks" className="nav-link">Snacks</Link>
            <Link to="/products" className="nav-link">All Products</Link>
          </nav>

          {/* Prominent Always-Visible Search Bar */}
          <form onSubmit={handleSearchSubmit} className="header-search-form" ref={searchRef}>
            <input
              type="text"
              placeholder="Search sweets, cakes, savouries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              className="header-search-input"
            />
            <button type="submit" className="header-search-btn" aria-label="Search">
              <svg className="nav-svg-icon search-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {searchOpen && (searchLoading || searchResults.length > 0) && (
              <div className="search-panel">
                {searchLoading && <div className="search-loading">Searching...</div>}
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map(p => (
                      <Link key={p.id} to={`/products/${p.slug}`} className="search-result-item"
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'}
                          alt={p.name}
                          className="search-result-img"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=100&q=80'; }}
                        />
                        <div>
                          <p className="search-result-name">{p.name}</p>
                          <p className="search-result-price">₹{(p.base_price || 0).toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="navbar-actions">
            <div className="user-wrapper" ref={userRef}>
              <button className="nav-icon-btn" onClick={() => setUserMenuOpen(o => !o)} aria-label="User menu">
                <svg className="nav-svg-icon user-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  {user ? (
                    <>
                      <div className="user-dropdown-header">
                        <p className="user-dropdown-name">{user.name}</p>
                        <p className="user-dropdown-email">{user.email}</p>
                      </div>
                      <Link to="/my-orders" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>📦 My Orders</Link>
                      <Link to="/profile" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>⚙️ Profile</Link>
                      <button className="user-dropdown-link logout" onClick={handleLogout}>🚪 Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>🔑 Login</Link>
                      <Link to="/register" className="user-dropdown-link" onClick={() => setUserMenuOpen(false)}>✨ Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/wishlist" className="nav-icon-btn wishlist-nav-btn" aria-label="Wishlist">
              <svg className="nav-svg-icon wishlist-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && <span className="cart-badge" style={{ background: 'var(--gold)' }}>{wishlistCount}</span>}
            </Link>

            <button className="nav-icon-btn cart-btn" onClick={openCart} aria-label="Cart">
              <svg className="nav-svg-icon cart-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cart.item_count > 0 && <span className="cart-badge">{cart.item_count}</span>}
            </button>

            <button className="hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>

      <div className="navbar-secondary">
        <div className="container">
          <div className="secondary-links">
            <Link to="/products?tag=festival" className="secondary-link">Festival Pack</Link>
            <Link to="/category/sweets" className="secondary-link">Ready To Cook</Link>
            <Link to="/category/cakes" className="secondary-link">Bakery</Link>
            <Link to="/category/beverages" className="secondary-link">Coffee & Spices</Link>
            <Link to="/category/cookies-biscuits" className="secondary-link">Cookies</Link>
            <Link to="/products?bestseller=true" className="secondary-link">Best Sellers</Link>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/category/sweets" className="mobile-link">Sweets</Link>
          <Link to="/category/savouries" className="mobile-link">Savouries</Link>
          <Link to="/category/cakes" className="mobile-link">Cakes</Link>
          <Link to="/category/snacks" className="mobile-link">Snacks</Link>
          <Link to="/products" className="mobile-link">All Products</Link>
          {user ? (
            <>
              <Link to="/my-orders" className="mobile-link">My Orders</Link>
              <Link to="/profile" className="mobile-link">Profile</Link>
              <button className="mobile-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link">Login</Link>
              <Link to="/register" className="mobile-link">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { productAPI, adminAPI } from '../../services/api';
import './Navbar.css';

const CITIES = [
  { name: 'Chennai', state: 'Tamil Nadu', available: true, tag: '⚡ Delivering Now' },
  { name: 'Tambaram, Chennai', state: 'Tamil Nadu', available: true, tag: '⚡ Delivering Now' },
  { name: 'Velachery, Chennai', state: 'Tamil Nadu', available: true, tag: '⚡ Delivering Now' },
  { name: 'Anna Nagar, Chennai', state: 'Tamil Nadu', available: true, tag: '⚡ Delivering Now' },
  { name: 'Coimbatore', state: 'Tamil Nadu', available: false, tag: 'Coming Soon' },
  { name: 'Madurai', state: 'Tamil Nadu', available: false, tag: 'Coming Soon' },
  { name: 'Bengaluru', state: 'Karnataka', available: false, tag: 'Coming Soon' },
  { name: 'Hyderabad', state: 'Telangana', available: false, tag: 'Coming Soon' },
  { name: 'Mumbai', state: 'Maharashtra', available: false, tag: 'Coming Soon' },
  { name: 'Delhi', state: 'Delhi', available: false, tag: 'Coming Soon' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem('svs_delivery_location') || 'Chennai';
  });
  const [locationOpen, setLocationOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
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

  const isLocationAvailable = selectedLocation.toLowerCase().includes('chennai');

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
    setLocationOpen(false);
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

  const handleSelectCity = (cityName) => {
    setSelectedLocation(cityName);
    localStorage.setItem('svs_delivery_location', cityName);
    setLocationOpen(false);
    setCitySearch('');
  };

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

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      {/* ── Top Bar: Location & Delivery Availability ── */}
      <div className="navbar-topbar">
        <div className="container topbar-inner">
          {/* Location Selector */}
          <div className="location-selector-wrap" ref={locationRef}>
            <div
              className={`location-selector-btn ${isLocationAvailable ? 'avail' : 'unavail'}`}
              onClick={() => setLocationOpen(o => !o)}
            >
              <svg className="nav-svg-icon location-pin-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div className="loc-label-group">
                <span className="loc-prefix">Deliver to:</span>
                <span className="location-text">{selectedLocation}</span>
              </div>

              {/* Availability Indicator Badge */}
              <span className={`loc-avail-badge ${isLocationAvailable ? 'available' : 'unavailable'}`}>
                {isLocationAvailable ? (
                  <>
                    <span className="loc-pulse-dot"></span>
                    <span>Available</span>
                  </>
                ) : (
                  <span>🚫 Chennai Only</span>
                )}
              </span>

              <span className={`location-chevron ${locationOpen ? 'open' : ''}`}>▾</span>
            </div>

            {/* Dropdown Location Picker */}
            {locationOpen && (
              <div className="location-dropdown-panel">
                <div className="loc-drop-header">
                  <strong>📍 Check Delivery Availability</strong>
                  <p>Online delivery is currently live across <strong>Chennai</strong>.</p>
                </div>

                <div className="loc-search-box">
                  <input
                    type="text"
                    placeholder="Search city or area..."
                    value={citySearch}
                    onChange={e => setCitySearch(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="loc-options-list">
                  {filteredCities.map(city => (
                    <button
                      key={city.name}
                      type="button"
                      className={`loc-option-row ${selectedLocation === city.name ? 'active' : ''}`}
                      onClick={() => handleSelectCity(city.name)}
                    >
                      <div className="loc-opt-info">
                        <span className="loc-opt-name">{city.name}</span>
                        <span className="loc-opt-state">{city.state}</span>
                      </div>
                      <span className={`loc-status-pill ${city.available ? 'green' : 'gray'}`}>
                        {city.tag}
                      </span>
                    </button>
                  ))}

                  {filteredCities.length === 0 && (
                    <div className="loc-custom-pick">
                      <p>City "{citySearch}" not in list.</p>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '6px 12px', fontSize: '.8rem', width: '100%' }}
                        onClick={() => handleSelectCity(citySearch)}
                      >
                        Set to "{citySearch}" (Check status)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Delivery Note in Middle */}
          <div className="topbar-announcement">
            <span>🚚 Free Delivery on orders above ₹500 across Chennai!</span>
          </div>

          {/* Reward Points on Right */}
          <div className="topbar-tabs">
            {user ? (
              <Link to="/profile" className="topbar-tab reward-tab" title="Earned from previous purchases">
                🪙 Reward Points: <strong>{rewardPoints} pts</strong>
              </Link>
            ) : (
              <Link to="/login" className="topbar-tab reward-tab">
                🪙 Earn 5% Rewards on Orders
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <div className="navbar-main">
        <div className="container navbar-main-inner">
          {/* Logo on Left */}
          <Link to="/" className="navbar-brand">
            <div className="brand-logo">
              <img
                src="/logo.png"
                alt="Creamy Bites"
                className="custom-brand-logo-img"
                onError={(e) => { e.target.onerror = null; e.target.src = 'http://localhost:5000/uploads/logo.png'; }}
              />
              <div className="brand-text">
                <span className="brand-name">Creamy Bites</span>
                <span className="brand-tagline">BAKERY &amp; SWEETS</span>
              </div>
            </div>
          </Link>

          {/* Horizontal Navigation items - All Products FIRST */}
          <nav className="navbar-nav" aria-label="Main navigation">
            <Link to="/products" className="nav-link">All Products</Link>
            <Link to="/category/sweets" className="nav-link">Sweets</Link>
            <Link to="/category/savouries" className="nav-link">Savouries</Link>
            <Link to="/category/cakes" className="nav-link">Cakes</Link>
            <Link to="/category/snacks" className="nav-link">Snacks</Link>
            <Link to="/category/cookies-biscuits" className="nav-link">Cookies</Link>
            <Link to="/category/breads" className="nav-link">Breads</Link>
          </nav>

          {/* Search Input Bar */}
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

          {/* Actions */}
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

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="mobile-menu">
          {/* Mobile location bar */}
          <div style={{ padding: '0.6rem 0', borderBottom: '1px solid #eee5d3', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '.85rem' }}>
            <span>📍 {selectedLocation}</span>
            <span className={`loc-avail-badge ${isLocationAvailable ? 'available' : 'unavailable'}`}>
              {isLocationAvailable ? '✅ Available' : '🚫 Chennai Only'}
            </span>
          </div>

          <Link to="/" className="mobile-link">Home</Link>
          <Link to="/products" className="mobile-link">All Products</Link>
          <Link to="/category/sweets" className="mobile-link">Sweets</Link>
          <Link to="/category/savouries" className="mobile-link">Savouries</Link>
          <Link to="/category/cakes" className="mobile-link">Cakes</Link>
          <Link to="/category/snacks" className="mobile-link">Snacks</Link>
          <Link to="/category/cookies-biscuits" className="mobile-link">Cookies</Link>
          <Link to="/category/breads" className="mobile-link">Breads</Link>
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

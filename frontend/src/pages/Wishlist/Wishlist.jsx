import React, { useState, useEffect } from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { productAPI } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import { Link } from 'react-router-dom';
import '../MyOrders/UserPages.css';

export default function Wishlist() {
  const { wishlistIds } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productAPI.getAll({ limit: 100 }).then(data => {
      const ids = Array.from(wishlistIds);
      const filtered = data.products.filter(p => ids.includes(p.id));
      setWishlistProducts(filtered);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <div className="user-page page-enter container">
      <h1 className="user-page-title">My Wishlist ❤️</h1>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : wishlistProducts.length === 0 ? (
        <div className="empty-user-card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🤍</div>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)' }}>Your Wishlist is Empty</h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>Save your favorite sweets and snacks to buy them later!</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="product-grid">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import './ProductCard.css';

function StarRating({ rating = 0 }) {
  const numRating = Number(rating) || 0;
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star ${i <= Math.round(numRating) ? '' : 'empty'}`}>★</span>
      ))}
      <span className="rating-num">({numRating})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart, openCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { addToast } = useToast();

  if (!product) return null;

  const weights = product.weights || [];
  const [selectedWeight, setSelectedWeight] = useState(weights[0] || null);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!selectedWeight && weights.length > 0) return;
    setAdding(true);
    try {
      await addToCart(product.id, selectedWeight?.id, 1, product);
      addToast(`${product.name} added to cart!`, 'success');
      openCart();
    } catch (err) {
      addToast(err?.message || 'Error adding to cart', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const added = await toggle(product.id);
      addToast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist', added ? 'success' : 'info');
    } catch (err) {
      addToast(err?.message || 'Error updating wishlist', 'error');
    }
  };

  const rawPrice = selectedWeight?.price ?? product.base_price ?? 0;
  const price = typeof rawPrice === 'number' ? rawPrice : (parseFloat(rawPrice) || 0);
  const discountPercent = Number(product.discount_percent) || 0;
  const discountedPrice = discountPercent > 0 ? price * (1 - discountPercent / 100) : null;
  const wishlisted = isWishlisted ? isWishlisted(product.id) : false;

  return (
    <div className="product-card">
      <Link to={`/products/${product.slug || ''}`} className="product-card-img-wrap">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'}
          alt={product.name || 'Product'}
          className="product-card-img"
          loading="lazy"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'; }}
        />
        <div className="product-card-badges">
          {product.is_bestseller === 1 && <span className="badge badge-bestseller">⭐ Best Seller</span>}
          {product.is_new === 1 && <span className="badge badge-new">✨ New</span>}
          {product.is_offer === 1 && discountPercent > 0 && <span className="badge badge-offer">{discountPercent}% Off</span>}
        </div>
        <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </Link>

      <div className="product-card-body">
        <Link to={`/products/${product.slug || ''}`}>
          <h3 className="product-card-name">{product.name}</h3>
        </Link>
        <StarRating rating={product.rating} />

        {weights.length > 0 && (
          <div className="weight-pills">
            {weights.map(w => (
              <button
                key={w.id}
                className={`weight-pill ${selectedWeight?.id === w.id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setSelectedWeight(w); }}
              >
                {w.weight}
              </button>
            ))}
          </div>
        )}

        <div className="product-card-price">
          {discountedPrice ? (
            <>
              <span className="price-current">₹{discountedPrice.toFixed(2)}</span>
              <span className="price-original">₹{price.toFixed(2)}</span>
            </>
          ) : (
            <span className="price-current">₹{price.toFixed(2)}</span>
          )}
          <span className="price-onwards">onwards</span>
        </div>

        <button className={`add-to-cart-btn ${adding ? 'loading' : ''}`} onClick={handleAddToCart} disabled={adding}>
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}


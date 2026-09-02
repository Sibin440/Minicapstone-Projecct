import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI, reviewAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetails.css';

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', body: '' });

  const { addToCart, openCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    productAPI.getBySlug(slug).then(data => {
      setProduct(data.product);
      if (data.product.weights?.length > 0) {
        setSelectedWeight(data.product.weights[0]);
      }
      productAPI.getAll({ category: data.product.category_slug, limit: 4 }).then(res => {
        setRelated(res.products.filter(p => p.id !== data.product.id));
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!product) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Product Not Found</h2></div>;

  const currentPrice = selectedWeight ? selectedWeight.price : product.base_price;
  const discountedPrice = product.discount_percent > 0 ? currentPrice * (1 - product.discount_percent / 100) : null;

  const handleCartAdd = async () => {
    if (!selectedWeight) return;
    try {
      await addToCart(product.id, selectedWeight.id, quantity);
      addToast(`Added ${quantity} x ${product.name} (${selectedWeight.weight}) to cart!`, 'success');
      openCart();
    } catch (e) {
      addToast(e.message || 'Error adding to cart', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await reviewAPI.add(product.id, newReview);
      addToast('Review submitted successfully!', 'success');
      const updated = await productAPI.getBySlug(slug);
      setProduct(updated.product);
      setNewReview({ rating: 5, title: '', body: '' });
    } catch (e) {
      addToast(e.message || 'Error submitting review', 'error');
    }
  };

  return (
    <div className="product-details-page page-enter">
      <div className="container details-container">
        <div className="details-grid">
          <div className="details-image-wrap">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'}
              alt={product.name}
              className="details-image"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'; }}
            />
          </div>

          <div className="details-info">
            <p className="details-category">{product.category_name}</p>
            <h1 className="details-title">{product.name}</h1>

            <div className="details-rating">
              <div className="stars">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`star ${i <= Math.round(product.rating) ? '' : 'empty'}`}>★</span>
                ))}
              </div>
              <span className="rating-text">{product.rating} ({product.rating_count} reviews)</span>
            </div>

            <div className="details-price-row">
              {discountedPrice ? (
                <>
                  <span className="details-price">₹{(discountedPrice * quantity).toFixed(2)}</span>
                  <span className="details-original-price">₹{(currentPrice * quantity).toFixed(2)}</span>
                  <span className="details-discount-badge">{product.discount_percent}% OFF</span>
                </>
              ) : (
                <span className="details-price">₹{(currentPrice * quantity).toFixed(2)}</span>
              )}
            </div>

            <p className="details-desc">{product.description}</p>

            <div className="details-section">
              <label>Select Weight / Size:</label>
              <div className="weight-options">
                {product.weights?.map(w => (
                  <button
                    key={w.id}
                    className={`weight-opt ${selectedWeight?.id === w.id ? 'active' : ''}`}
                    onClick={() => setSelectedWeight(w)}
                  >
                    <span>{w.weight}</span>
                    <span className="opt-price">₹{w.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="details-section">
              <label>Quantity:</label>
              <div className="details-qty-stepper">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>

            <div className="details-actions">
              <button className="btn-primary details-add-btn" onClick={handleCartAdd}>🛒 Add to Cart</button>
              <button
                className={`btn-outline details-wish-btn ${isWishlisted(product.id) ? 'active' : ''}`}
                onClick={() => toggle(product.id)}
              >
                {isWishlisted(product.id) ? '❤️ Wishlisted' : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>
          <div className="reviews-grid">
            <div className="reviews-list">
              {product.reviews?.length === 0 ? <p>No reviews yet. Be the first!</p> : (
                product.reviews?.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <strong>{r.user_name}</strong>
                      <span className="stars">{'★'.repeat(r.rating)}</span>
                    </div>
                    <h4>{r.title}</h4>
                    <p>{r.body}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReviewSubmit} className="review-form">
              <h3>Write a Review</h3>
              <div className="form-group">
                <label>Rating</label>
                <select value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Review Title</label>
                <input type="text" value={newReview.title} onChange={e => setNewReview({ ...newReview, title: e.target.value })} placeholder="Summarize your thoughts" required />
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea rows="3" value={newReview.body} onChange={e => setNewReview({ ...newReview, body: e.target.value })} placeholder="Describe taste, quality, freshness..." required />
              </div>
              <button type="submit" className="btn-navy">Submit Review</button>
            </form>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="related-section">
            <h2>You May Also Like</h2>
            <div className="product-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

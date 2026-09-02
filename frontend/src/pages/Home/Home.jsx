import React, { useState, useEffect } from 'react';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import './Home.css';

const WHY_CARDS = [
  { icon: '🧈', title: 'Pure Ghee & Butter', desc: 'All our products are crafted with premium pure ghee, rich butter, and finest ingredients.' },
  { icon: '👨‍🍳', title: 'Authentic Recipes', desc: 'Recipes passed down through generations, preserving the true taste of traditional India.' },
  { icon: '🚚', title: 'Fresh Delivery', desc: 'Made fresh and delivered to your doorstep within hours of preparation.' },
  { icon: '⭐', title: 'Trusted Quality', desc: 'Loved by millions of families across India for over decades of consistent quality.' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', city: 'Mumbai', rating: 5, text: 'The Kaju Katli is absolutely divine! Melts in your mouth. I order it every Diwali without fail.' },
  { name: 'Rajesh Kumar', city: 'Delhi', rating: 5, text: 'Best Mysore Pak I have ever had outside of Mysore itself. The ghee quality is outstanding.' },
  { name: 'Ananya Nair', city: 'Chennai', rating: 5, text: 'Filter Coffee Blend is exactly what I was looking for. Authentic South Indian taste at home!' },
];

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newest, setNewest] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    productAPI.getFeatured().then(data => {
      setBestsellers(data.bestsellers || []);
      setOffers(data.offers || []);
      setNewest(data.newest || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSelectCategory = (catSlug) => {
    if (selectedCategory === catSlug) {
      setSelectedCategory(null);
      setCategoryProducts([]);
      return;
    }
    setSelectedCategory(catSlug);
    setCatLoading(true);
    productAPI.getAll({ category: catSlug }).then(data => {
      setCategoryProducts(data.products || []);
    }).catch(() => { setCategoryProducts([]); }).finally(() => setCatLoading(false));
  };

  return (
    <div className="home-page page-enter">
      {/* Permanent Fixed Hero Banner Carousel */}
      <HeroBanner />

      {/* Category Selection Grid */}
      <section className="category-section">
        <div className="container">
          <div className="section-heading">
            <h2>Shop by Category</h2>
            <p className="subtitle">Select a category below to view items without leaving the page</p>
            <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
          </div>
          <CategoryGrid selectedCategory={selectedCategory} onSelectCategory={handleSelectCategory} />
        </div>
      </section>

      {/* Filtered Category Products Section (if selected) */}
      {selectedCategory && (
        <section className="home-section home-section-category-filtered" id="filtered-products">
          <div className="container">
            <div className="section-heading">
              <h2>{selectedCategory.toUpperCase()} COLLECTION</h2>
              <p className="subtitle">Showing products for {selectedCategory}</p>
              <button className="btn-outline reset-cat-btn" onClick={() => handleSelectCategory(selectedCategory)}>View All Sections ✕</button>
            </div>
            {catLoading ? (
              <div className="loading-container"><div className="spinner"/></div>
            ) : (
              <div className="product-grid">
                {categoryProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {!selectedCategory && (
        <section className="home-section">
          <div className="container">
            <div className="section-heading">
              <h2>Our Best Sellers</h2>
              <p className="subtitle">The most loved sweets and treats by our customers</p>
              <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
            </div>
            {loading ? (
              <div className="loading-container"><div className="spinner"/></div>
            ) : (
              <div className="product-grid">
                {bestsellers.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
            <div className="section-cta">
              <Link to="/products?bestseller=true" className="btn-outline">View All Best Sellers →</Link>
            </div>
          </div>
        </section>
      )}

      <div className="offer-banner">
        <div className="container offer-banner-inner">
          <div className="offer-text">
            <p className="offer-tag">🎉 LIMITED TIME OFFER</p>
            <h2>Get 20% Off on Orders Above ₹500</h2>
            <p>Use code: <strong>SWEET20</strong> at checkout</p>
          </div>
          <Link to="/products" className="offer-btn">Shop Now →</Link>
        </div>
      </div>

      {newest.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-heading">
              <h2>New Arrivals</h2>
              <p className="subtitle">Fresh additions to our collection</p>
              <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
            </div>
            <div className="product-grid">
              {newest.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="home-section home-section-gold">
          <div className="container">
            <div className="section-heading">
              <h2>Special Offers</h2>
              <p className="subtitle">Exclusive deals just for you</p>
              <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
            </div>
            <div className="product-grid">
              {offers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="why-section">
        <div className="container">
          <div className="section-heading">
            <h2>Why Choose SVS Sweets & Bakery?</h2>
            <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
          </div>
          <div className="why-grid">
            {WHY_CARDS.map(c => (
              <div key={c.title} className="why-card">
                <div className="why-icon">{c.icon}</div>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <div className="section-heading">
            <h2>What Our Customers Say</h2>
            <div className="heading-ornament"><span/><div className="diamond"/><span/></div>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <p className="testimonial-name">{t.name}</p>
                    <p className="testimonial-city">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

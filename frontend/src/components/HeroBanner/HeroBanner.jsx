import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const slides = [
  {
    tag: 'A World of',
    headline: 'Sweets',
    sub: 'TRADITIONAL TASTE. TIMELESS JOY.',
    cta: 'Shop Sweets',
    ctaLink: '/category/sweets',
    images: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&h=450&fit=crop',
      'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop',
    ]
  },
  {
    tag: 'Freshly Baked',
    headline: 'Cakes & Breads',
    sub: 'CRAFTED WITH LOVE. BAKED TO PERFECTION.',
    cta: 'Explore Bakery',
    ctaLink: '/category/cakes',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=450&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    ]
  },
  {
    tag: 'Crispy & Crunchy',
    headline: 'Savouries',
    sub: 'AUTHENTIC FLAVOURS. PURE INGREDIENTS.',
    cta: 'Shop Savouries',
    ctaLink: '/category/savouries',
    images: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=450&fit=crop',
      'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=300&fit=crop',
    ]
  },
];

const TRUST_BADGES = [
  { icon: '💬', label: '"Sweetness that lasts a lifetime"' },
  { icon: '👨‍🍳', label: 'Authentic Recipes' },
  { icon: '🏅', label: 'Hygienic' },
  { icon: '👨‍👩‍👧‍👦', label: 'Trusted by Generations' },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const slide = slides[active];

  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-left">
          <div className="hero-ornament">✦ ───── ✦ ───── ✦</div>
          <p className="hero-tag">{slide.tag}</p>
          <h1 className="hero-headline">{slide.headline}</h1>
          <p className="hero-sub">{slide.sub}</p>
          <div className="hero-ornament">✦ ───── ✦ ───── ✦</div>
          <div className="hero-trust-badges">
            {TRUST_BADGES.map(b => (
              <div key={b.label} className="trust-badge">
                <span className="trust-icon">{b.icon}</span>
                <span className="trust-label">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-ctas">
            <Link to={slide.ctaLink} className="btn-primary hero-cta">{slide.cta}</Link>
            <Link to="/products" className="btn-outline hero-cta-2">View All</Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-img-grid">
            <div className="hero-img-main">
              <img
                src={slide.images[0]}
                alt="Featured sweet"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80'; }}
              />
            </div>
            <div className="hero-img-secondary">
              <div className="hero-img-sm">
                <img
                  src={slide.images[1]}
                  alt="Sweet 2"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1624454002302-36b824d7bd0a?auto=format&fit=crop&w=400&q=80'; }}
                />
              </div>
              <div className="hero-img-sm">
                <img
                  src={slide.images[2]}
                  alt="Sweet 3"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=400&q=80'; }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-bottom">
        <p className="hero-bottom-text">🎉 CELEBRATING TRADITIONS. CREATING MEMORIES.</p>
        <div className="hero-dots">
          {slides.map((_, i) => (
            <button key={i} className={`hero-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

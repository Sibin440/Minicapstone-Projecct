import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryAPI } from '../../services/api';
import './CategoryGrid.css';

export default function CategoryGrid({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    categoryAPI.getAll().then(data => {
      setCategories(data.categories || []);
    }).catch(() => { setCategories([]); }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="category-grid">
      {[...Array(7)].map((_, i) => <div key={i} className="category-skeleton" />)}
    </div>
  );

  const handleClick = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat.slug);
    } else {
      navigate(`/category/${cat.slug}`);
    }
  };

  return (
    <div className="category-grid">
      {categories.map(cat => {
        const isSelected = selectedCategory === cat.slug;
        return (
          <div
            key={cat.id}
            className={`category-tile ${isSelected ? 'selected' : ''}`}
            onClick={() => handleClick(cat)}
            style={{ cursor: 'pointer' }}
          >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'}
                alt={cat.name}
                className="category-img"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80'; }}
              />
            <div className="category-info">
              <h3 className="category-name">{cat.name}</h3>
              <p className="category-count">{cat.product_count} products</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import HeroBanner from '../../components/HeroBanner/HeroBanner';
import CategoryGrid from '../../components/CategoryGrid/CategoryGrid';
import { productAPI, categoryAPI } from '../../services/api';
import './ProductListing.css';

export default function ProductListing() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const bestseller = searchParams.get('bestseller') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(slug || '');
  const [sort, setSort] = useState('');
  const [priceRange, setPriceRange] = useState(2000);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    categoryAPI.getAll().then(data => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    if (slug) setSelectedCat(slug);
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedCat) params.category = selectedCat;
    if (search) params.search = search;
    if (bestseller) params.bestseller = bestseller;
    if (sort) params.sort = sort;
    if (priceRange < 2000) params.max_price = priceRange;

    productAPI.getAll(params).then(data => {
      setProducts(data.products || []);
      setTotal(data.total || 0);
    }).catch(() => { setProducts([]); setTotal(0); }).finally(() => setLoading(false));
  }, [selectedCat, search, bestseller, sort, priceRange]);

  return (
    <div className="listing-page page-enter">
      {/* 1. Same Hero Banner as Home page */}
      <HeroBanner />

      {/* 2. Same Category Grid navigation bar */}
      <section className="category-section" style={{ padding: '2rem 0 1rem' }}>
        <div className="container">
          <CategoryGrid selectedCategory={selectedCat} onSelectCategory={(slug) => setSelectedCat(slug)} />
        </div>
      </section>

      <div className="container listing-content-full">
        <div className="listing-toolbar">
          <p className="results-count">Showing <strong>{products.length}</strong> of <strong>{total}</strong> products</p>

          <div className="toolbar-controls">
            <div className="toolbar-filter-item">
              <label>Max Price: ₹{priceRange} </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-slider-inline"
              />
            </div>

            <div className="toolbar-filter-item">
              <label>Sort By: </label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="">Popularity</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        <main className="listing-main-full">
          {loading ? (
            <div className="loading-container"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <h3>No products found</h3>
              <p>Try clearing filters or searching for something else.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

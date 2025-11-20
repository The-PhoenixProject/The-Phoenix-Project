// pages/Marketplace.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CreateProductModal from '../components/CreateProductModal';
import toast from 'react-hot-toast';
import '../styles/MarketPlace/MarketPlace.css';

const categories = ['All', 'Furniture', 'Electronics', 'Home Decor', 'Books & Media', 'Sporting Goods', 'Toys & Games', 'Crafts & DIY Materials', 'Jewelry', 'Miscellaneous'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Used'];

function Marketplace() {
  const { currentUser, token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: 'All',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '-createdAt'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  // ---------- FETCH PRODUCTS ----------
  const fetchProducts = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort,
        ...(filters.category !== 'All' && { category: filters.category }),
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
        ...(filters.search.trim() && { search: filters.search.trim() })
      };

      const response = await productAPI.getAllProducts(queryParams, token);
      if (response.success) {
        const prods = response.data?.products || response.products || [];
        const pag = response.data?.pagination || response.pagination || {};
        setProducts(prods);
        setPagination(prev => ({
          ...prev,
          total: pag.total || 0,
          pages: pag.pages || 0
        }));
      } else {
        toast.error(response.message || 'Failed to load products');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [
    token,
    pagination.page,
    pagination.limit,
    filters.category,
    filters.condition,
    filters.minPrice,
    filters.maxPrice,
    filters.search,
    filters.sort
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ---------- FILTER HANDLERS ----------
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      condition: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sort: '-createdAt'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // ---------- PRODUCT CLICK ----------
  const handleProductClick = async (product) => {
    try {
      const res = await productAPI.getProductById(product._id, token);
      if (res.success) {
        setSelectedProduct(res.data?.product || res.product);
      } else {
        setSelectedProduct(product);
      }
    } catch {
      setSelectedProduct(product);
    }
  };

  // ---------- WISHLIST TOGGLE ----------
  const handleToggleWishlist = async (productId) => {
    if (!token) return toast.error('Please login to add to wishlist');
    try {
      const res = await productAPI.toggleWishlist(productId, token);
      if (res.success) {
        const isFav = res.data?.isFavorited ?? !res.isFavorited;
        toast.success(isFav ? 'Added to wishlist' : 'Removed from wishlist');

        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, isFavorited: isFav } : p
        ));

        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, isFavorited: isFav }));
        }
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleProductCreated = () => {
    setShowCreateModal(false);
    fetchProducts();
    toast.success('Product created successfully!');
  };

  return (
    <div className="marketplace-container">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-content">
          <h1>Marketplace</h1>
          <p>Discover sustainable treasures and give items a second life</p>
        </div>
        {currentUser && (
          <button className="btn-create-product" onClick={() => setShowCreateModal(true)}>
            + List Product
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="search-filter-section">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
          />
        </div>
        <button className="btn-filters" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal size={20} />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filters</h3>
            <button onClick={clearFilters} className="btn-clear">Clear All</button>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <div className="category-chips">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`chip ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => handleFilterChange('category', cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition - FIXED */}
          <div className="filter-group">
            <label>Condition</label>
            <select 
              value={filters.condition} 
              onChange={e => handleFilterChange('condition', e.target.value)}
            >
              <option value="">All Conditions</option>
              {conditions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Price */}
          <div className="filter-group">
            <label>Price Range</label>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minPrice}
                onChange={e => handleFilterChange('minPrice', e.target.value)} 
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPrice}
                onChange={e => handleFilterChange('maxPrice', e.target.value)} 
              />
            </div>
          </div>

          {/* Sort */}
          <div className="filter-group">
            <label>Sort By</label>
            <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-views">Most Viewed</option>
            </select>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-section">
        <div className="products-header">
          <p>{pagination.total} products found</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found</p>
            <button onClick={clearFilters}>Clear filters</button>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onClick={() => handleProductClick(p)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button 
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: pagination.pages }, (_, i) => (
                    <button
                      key={i + 1}
                      className={pagination.page === i + 1 ? 'active' : ''}
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}
      {showCreateModal && (
        <CreateProductModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleProductCreated}
        />
      )}
    </div>
  );
}

export default Marketplace;
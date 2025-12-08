// FIXED Marketplace.jsx - Key improvements highlighted with // ✅

import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Heart, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

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

  // ✅ Fetch wishlist count
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (!token) return;
      try {
        const res = await productAPI.getWishlist(token);
        if (res.success) {
          const prods = res.data?.products || res.products || [];
          setWishlistCount(prods.length);
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        console.error('Failed to fetch wishlist count');
      }
    };
    fetchWishlistCount();
  }, [token]);

  // ✅ Fetch products with proper error handling
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
  }, [token, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  // ✅ Fetch full product details when clicking
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

  // ✅ Toggle wishlist with optimistic updates
  const handleToggleWishlist = async (productId) => {
    if (!token) return toast.error('Please login to add to wishlist');
    
    try {
      // Optimistic update
      const currentProduct = products.find(p => p._id === productId);
      const wasFavorited = currentProduct?.isFavorited;
      
      setProducts(prev => prev.map(p =>
        p._id === productId ? { ...p, isFavorited: !wasFavorited } : p
      ));
      
      if (selectedProduct?._id === productId) {
        setSelectedProduct(prev => ({ ...prev, isFavorited: !wasFavorited }));
      }
      
      setWishlistCount(prev => wasFavorited ? prev - 1 : prev + 1);

      // API call
      const res = await productAPI.toggleWishlist(productId, token);
      
      if (res.success) {
        const isFav = res.data?.isFavorited ?? res.isFavorited;
        toast.success(isFav ? 'Added to wishlist' : 'Removed from wishlist');
        
        // Confirm update with server response
        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, isFavorited: isFav } : p
        ));
        
        if (selectedProduct?._id === productId) {
          setSelectedProduct(prev => ({ ...prev, isFavorited: isFav }));
        }
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Revert on error
      setProducts(prev => prev.map(p =>
        p._id === productId ? { ...p, isFavorited: !p.isFavorited } : p
      ));
      
      if (selectedProduct?._id === productId) {
        setSelectedProduct(prev => ({ ...prev, isFavorited: !prev.isFavorited }));
      }
      
      toast.error('Failed to update wishlist');
    }
  };

  // ✅ Refresh marketplace after product creation
  const handleProductCreated = () => {
    setShowCreateModal(false);
    fetchProducts(); // Refresh the list
    toast.success('Product created successfully!');
  };

  return (
    <div className="marketplace-container">
      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Filters Sidebar */}
      <aside className={`filters-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="btn-close-sidebar" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>

        <div className="sidebar-header">
          <h3><SlidersHorizontal size={22} /> Filters</h3>
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

        {/* Condition */}
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

        {/* Price Range */}
        <div className="filter-group">
          <label>Price Range</label>
          <div className="price-inputs">
            <input 
              type="number" 
              placeholder="Min" 
              value={filters.minPrice}
              onChange={e => handleFilterChange('minPrice', e.target.value)} 
            />
            <span>—</span>
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
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <div className="marketplace-header">
          <div className="header-content">
            <h1>Marketplace</h1>
            <p>Discover sustainable treasures and give items a second life</p>
          </div>
          <div className="header-actions">
            {token && (
              <button className="btn-wishlist-nav" onClick={() => navigate('/wishlist')}>
                <Heart size={20} />
                My Wishlist
                {wishlistCount > 0 && <span className="wishlist-count">{wishlistCount}</span>}
              </button>
            )}
            {currentUser && (
              <button className="btn-create-product" onClick={() => setShowCreateModal(true)}>
                <Plus size={20} />
                List Product
              </button>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-bar">
            <Search size={22} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search for products..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </div>
          <button className="btn-mobile-filters" onClick={() => setSidebarOpen(true)}>
            <SlidersHorizontal size={20} />
            Filters
          </button>
        </div>

        {/* Products Section */}
        <div className="products-section">
          <div className="products-header">
            <p>{pagination.total} products found</p>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button onClick={clearFilters}>Clear Filters</button>
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
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          className={pagination.page === page ? 'active' : ''}
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </button>
                      );
                    })}
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
      </main>

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
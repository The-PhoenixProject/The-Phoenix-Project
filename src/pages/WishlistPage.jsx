// pages/WishlistPage.jsx - CLEAN MINIMAL DESIGN
import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, MessageCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { productAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import ProductModal from '../components/ProductModal';  
import toast from 'react-hot-toast';
import '../styles/MarketPlace/WishList.css';

function Wishlist() {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  const fetchWishlist = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    try {
      setLoading(true);
      const res = await productAPI.getWishlist(token);
      if (res.success) {
        setProducts(res.data?.products || res.products || []);
      } else {
        toast.error(res.message || 'Failed to load wishlist');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist, currentUser]);

  const handleToggleWishlist = async (productId) => {
    try {
      const res = await productAPI.toggleWishlist(productId, token);
      if (res.success) {
        toast.success('Removed from wishlist');
        setProducts(prev => prev.filter(p => p._id !== productId));
        if (selectedProduct?._id === productId) setSelectedProduct(null);
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleProductClick = (product) => setSelectedProduct(product);

  const handleChatWithSeller = (product) => {
    const sellerId = typeof product.seller === 'object' && product.seller
      ? product.seller._id
      : typeof product.seller === 'string' ? product.seller : null;

    if (!sellerId) return toast.error('Seller information not available');
    navigate(`/chat?userId=${sellerId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Heart SVG Component
  const HeartIcon = () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </svg>
  );

  if (!token) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-breadcrumb">
          <Link to="/">Home</Link> / Wishlist
        </div>
        <div className="wishlist-header">
          <div className="heart-icon-wrapper"><HeartIcon /></div>
          <h1>My Wishlist</h1>
        </div>
        <div className="empty-state">
          <div className="heart-icon-wrapper"><HeartIcon /></div>
          <h2>Please login to view your wishlist</h2>
          <p>Sign in to save and view your favorite items</p>
          <button className="btn-browse" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="wishlist-breadcrumb">
          <Link to="/">Home</Link> / Wishlist
        </div>
        <div className="wishlist-header">
          <div className="heart-icon-wrapper"><HeartIcon /></div>
          <h1>My Wishlist</h1>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      {/* Breadcrumb */}
      <div className="wishlist-breadcrumb">
        <Link to="/">Home</Link> / Wishlist
      </div>

      {/* Header */}
      <div className="wishlist-header">
        <div className="heart-icon-wrapper"><HeartIcon /></div>
        <h1>My Wishlist</h1>
        <p>{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
      </div>

      {/* Content */}
      <div className="wishlist-content">
        {/* Back to Marketplace */}
        <Link to="/marketplace" className="back-to-marketplace">
          <ArrowLeft size={18} />
          Back to Marketplace
        </Link>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="heart-icon-wrapper"><HeartIcon /></div>
            <h2>Your wishlist is empty</h2>
            <p>Start adding products you love to your wishlist</p>
            <button className="btn-browse" onClick={() => navigate('/marketplace')}>
              <ShoppingBag size={18} />
              Browse Marketplace
            </button>
          </div>
        ) : (
          <>
            {products.map(product => {
              const imageUrl = Array.isArray(product.images) && product.images[0]
                ? getImageUrl(product.images[0])
                : product.image ? getImageUrl(product.image) : '/placeholder-image.jpg';

              const sellerName = typeof product.seller === 'object' && product.seller
                ? product.seller.fullName || product.seller.name || 'Unknown Seller'
                : product.sellerName || 'Unknown Seller';

              return (
                <div key={product._id} className="wishlist-item">
                  {/* Image */}
                  <div className="item-image" onClick={() => handleProductClick(product)}>
                    <img 
                      src={imageUrl} 
                      alt={product.title}
                      onError={e => e.target.src = '/placeholder-image.jpg'} 
                    />
                  </div>

                  {/* Details */}
                  <div className="item-details">
                    <h3 className="item-title" onClick={() => handleProductClick(product)}>
                      {product.title}
                    </h3>
                    
                    <div className="item-meta">
                      <div className="item-meta-row">
                        <span className="item-meta-label">Added on:</span>
                        <span className="item-meta-value">{formatDate(product.createdAt)}</span>
                      </div>
                      <div className="item-meta-row">
                        <span className="item-meta-label">Price:</span>
                        <span className="item-meta-value price">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="item-meta-row">
                        <span className="item-meta-label">Condition:</span>
                        <span className={`condition-badge ${product.condition.toLowerCase().replace(' ', '-')}`}>
                          {product.condition}
                        </span>
                      </div>
                      <div className="item-meta-row">
                        <span className="item-meta-label">Seller:</span>
                        <span className="item-meta-value">{sellerName}</span>
                      </div>
                    </div>

                    <div className="stock-row">
                      <span className="stock-label">Status:</span>
                      <span className={`stock-status ${product.status === 'available' ? 'in-stock' : 'out-of-stock'}`}>
                        {product.status === 'available' ? 'Available' : 'Sold'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="item-actions">
                    <button 
                      className="btn-chat-seller" 
                      onClick={() => handleChatWithSeller(product)}
                    >
                      <MessageCircle size={16} />
                      Chat with Seller
                    </button>
                    <button 
                      className="btn-remove" 
                      onClick={() => handleToggleWishlist(product._id)}
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onToggleWishlist={handleToggleWishlist}
        />
      )}
    </div>
  );
}

export default Wishlist;
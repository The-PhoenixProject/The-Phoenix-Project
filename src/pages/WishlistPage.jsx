// pages/WishlistPage.jsx - FIXED
import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Trash2, MessageCircle } from 'lucide-react';
import { productAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProductModal from '../components/ProductModal';  
import toast from 'react-hot-toast';
import '../styles/MarketPlace/WishList.css'

function Wishlist() {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  // Re-fetch when user changes
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

  if (!token) {
    return (
      <div className="wishlist-container">
            <div className="empty-state">
              <Heart size={64} color="#d1d5db" />
              <h2>Please login to view your wishlist</h2>
              <button className="btn-browse" onClick={() => navigate('/login')}>Login</button>
            </div>
          </div>
    );
  }

  if (loading) {
    return (
      <div className="wishlist-container">
            <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
          </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="header-content">
          <Heart size={32} className="heart-icon" />
          <div>
            <h1>My Wishlist</h1>
            <p>{products.length} item{products.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <Heart size={64} color="#d1d5db" />
          <h2>Your wishlist is empty</h2>
          <p>Start adding products you love to your wishlist</p>
          <button className="btn-browse" onClick={() => navigate('/marketplace')}>Browse Marketplace</button>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map(product => {
            const imageUrl = Array.isArray(product.images) && product.images[0]
              ? product.images[0]
              : product.image || '/placeholder-image.jpg';

            const sellerName = typeof product.seller === 'object' && product.seller
              ? product.seller.fullName || product.seller.name || 'Unknown Seller'
              : product.sellerName || 'Unknown Seller';

            return (
              <div key={product._id} className="wishlist-item">
                <div className="item-image" onClick={() => handleProductClick(product)}>
                  <img src={imageUrl} alt={product.title}
                    onError={e => e.target.src = '/placeholder-image.jpg'} />
                  {product.isEcoFriendly && <span className="badge eco-badge">Eco-Friendly</span>}
                </div>

                <div className="item-details">
                  <div className="item-header">
                    <h3 onClick={() => handleProductClick(product)}>{product.title}</h3>
                    <button className="btn-remove" onClick={() => handleToggleWishlist(product._id)}
                      title="Remove from wishlist"><Trash2 size={18} /></button>
                  </div>

                  <p className="item-seller">by {sellerName}</p>

                  <div className="item-footer">
                    <div className="item-info">
                      <span className="price">${Number(product.price).toFixed(2)}</span>
                      <span className={`condition ${product.condition.toLowerCase().replace(' ', '-')}`}>
                        {product.condition}
                      </span>
                    </div>
                    <button className="btn-chat-seller" onClick={() => handleChatWithSeller(product)}>
                      <MessageCircle size={18} /> Chat
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
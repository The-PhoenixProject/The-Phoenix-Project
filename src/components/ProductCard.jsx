// src/components/ProductCard.jsx - ✅ FIXED IMAGE URLS
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onClick, onToggleWishlist }) => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  // ✅ FIXED: Properly construct image URL (SAME AS MODAL)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads, prepend the API base URL
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Otherwise, assume it needs /uploads prefix
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // ✅ Get first image with proper URL construction
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? getImageUrl(product.images[0])
    : product.image 
      ? getImageUrl(product.image) 
      : '/placeholder-image.jpg';

  const sellerName = typeof product.seller === 'object' && product.seller
    ? product.seller.fullName || product.seller.name || 'Unknown Seller'
    : product.sellerName || 'Unknown Seller';

  const sellerId = typeof product.seller === 'object' && product.seller
    ? product.seller._id
    : typeof product.seller === 'string' ? product.seller : null;

  // ✅ Chat handler with better navigation
  const handleChat = async (e) => {
    e.stopPropagation();
    
    if (!token) {
      toast.error('Please login to chat with seller');
      navigate('/login');
      return;
    }
    
    if (!sellerId) {
      toast.error('Seller information not available');
      return;
    }
    
    if (currentUser?._id === sellerId) {
      toast.error('You cannot chat with yourself');
      return;
    }

    try {
      const loadingToast = toast.loading('Starting conversation...');
      
      const res = await chatAPI.startConversation(sellerId, token);
      
      toast.dismiss(loadingToast);
      
      if (res.success && res.data?.conversationId) {
        navigate('/chat', { 
          state: { 
            conversationId: res.data.conversationId 
          } 
        });
        toast.success('Conversation started!');
      } else {
        navigate('/chat');
        toast.info('Opening chat...');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to start conversation. Please try again.');
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!token) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    onToggleWishlist?.(product._id);
  };

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={product.title} 
          className="product-image"
          onError={(e) => {
            console.log('Image failed to load:', imageUrl);
            e.target.src = '/placeholder-image.jpg';
          }}
        />
        {product.isEcoFriendly && <span className="eco-badge">Eco-Friendly</span>}
        {token && (
          <button 
            className={`wishlist-btn ${product.isFavorited ? 'active' : ''}`}
            onClick={handleWishlist}
            title={product.isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            ❤️
          </button>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-seller">by {sellerName}</p>

        <div className="product-footer">
          <div className="product-details">
            <span className="product-price">${Number(product.price).toFixed(2)}</span>
            <span className={`product-condition ${product.condition.toLowerCase().replace(' ', '-')}`}>
              {product.condition}
            </span>
          </div>
          {token && currentUser?._id !== sellerId && (
            <button className="btn-chat" onClick={handleChat}>
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
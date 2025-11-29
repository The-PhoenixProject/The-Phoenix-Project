// FIXED ProductCard.jsx - Improved image handling

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/MarketPlace/ProductCard.css';

const ProductCard = ({ product, onClick, onToggleWishlist }) => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  // ✅ IMPROVED: Better image URL construction with fallback
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    
    // Already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Starts with /uploads
    if (imagePath.startsWith('/uploads')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    // Starts with uploads/ (no leading slash)
    if (imagePath.startsWith('uploads/')) {
      return `${API_BASE_URL}/${imagePath}`;
    }
    
    // Default: assume it needs /uploads prefix
    return `${API_BASE_URL}/uploads/${imagePath}`;
  };

  // ✅ Get first available image from images array or fallback to image field
  const getProductImage = () => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return getImageUrl(product.images[0]);
    }
    if (product.image) {
      return getImageUrl(product.image);
    }
    return '/placeholder-image.jpg';
  };

  const imageUrl = getProductImage();

  // ✅ Get seller information safely
  const sellerName = typeof product.seller === 'object' && product.seller
    ? product.seller.fullName || product.seller.name || 'Unknown Seller'
    : product.sellerName || 'Unknown Seller';

  const sellerId = typeof product.seller === 'object' && product.seller
    ? product.seller._id
    : typeof product.seller === 'string' ? product.seller : null;

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
        navigate('/chat', { state: { conversationId: res.data.conversationId } });
        toast.success('Conversation started!');
      } else {
        navigate('/chat');
        toast('Opening chat...');
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
            <Heart 
              size={22} 
              fill={product.isFavorited ? '#ef4444' : 'none'}
              stroke={product.isFavorited ? '#ef4444' : '#9ca3af'}
            />
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
              <MessageCircle size={18} />
              Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
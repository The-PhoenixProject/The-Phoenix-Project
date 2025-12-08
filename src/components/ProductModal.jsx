// src/components/ProductModal.jsx - ✅ FIXED IMAGE URLS
import React, { useState } from 'react';
import { X, Heart, MessageCircle, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/MarketPlace/ProductModal.css'

const ProductModal = ({ product, onClose, onToggleWishlist }) => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  // ✅ FIXED: Properly construct image URLs
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

  const images = Array.isArray(product.images) && product.images.length
    ? product.images.map(img => getImageUrl(img))
    : product.image 
      ? [getImageUrl(product.image)] 
      : ['/placeholder-image.jpg'];

  const sellerName = typeof product.seller === 'object' && product.seller
    ? product.seller.fullName || product.seller.name || 'Unknown Seller'
    : product.sellerName || 'Unknown Seller';

  const sellerId = typeof product.seller === 'object' && product.seller
    ? product.seller._id
    : typeof product.seller === 'string' ? product.seller : null;

  const sellerLocation = typeof product.seller === 'object' && product.seller
    ? product.seller.location : product.location;

  const isOwnProduct = currentUser && sellerId && currentUser._id === sellerId;

  const handleChat = async () => {
    if (!token) return toast.error('Please login to chat with seller');
    if (isOwnProduct) return toast.error('You cannot chat with yourself');
    if (!sellerId) return toast.error('Seller information not available');

    try {
      const res = await chatAPI.startConversation(sellerId, token);
      if (res.success && res.data?.conversationId) {
        navigate(`/chat/${res.data.conversationId}`);
      } else {
        navigate('/chat');
      }
      onClose();
    } catch {
      toast.error('Failed to start conversation');
    }
  };

  const handleWishlist = () => {
    if (!token) return toast.error('Please login to add to wishlist');
    onToggleWishlist?.(product._id);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="btn-close"><X size={24} /></button>

        <div className="modal-body">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={images[selectedImage]} 
                alt={product.title}
                onError={(e) => {
                  console.log('Image failed to load:', images[selectedImage]);
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              {product.isEcoFriendly && <span className="eco-badge">Eco-Friendly</span>}
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`${product.title} ${i + 1}`}
                    className={selectedImage === i ? 'active' : ''}
                    onClick={() => setSelectedImage(i)}
                    onError={(e) => {
                      console.log('Thumbnail failed to load:', img);
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="product-details">
            <div className="product-header">
              <div>
                <h2>{product.title}</h2>
                <p className="product-category">{product.category}</p>
              </div>
              <span className="product-price">${Number(product.price).toFixed(2)}</span>
            </div>

            <div className="product-meta">
              <span className={`condition-badge ${product.condition.toLowerCase().replace(' ', '-')}`}>
                {product.condition}
              </span>
              {product.views !== undefined && (
                <span className="views"><Eye size={16} />{product.views} views</span>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description || 'No description available'}</p>
            </div>

            <div className="seller-info">
              <h3>Seller Information</h3>
              <div className="seller-details">
                <p className="seller-name">{sellerName}</p>
                {sellerLocation && (
                  <p className="seller-location"><MapPin size={16} />{sellerLocation}</p>
                )}
              </div>
            </div>

            <div className="product-actions">
              {!isOwnProduct && token && (
                <>
                  <button className="btn-primary" onClick={handleChat}>
                    <MessageCircle size={20} /> Chat with Seller
                  </button>
                  <button className={`btn-wishlist ${product.isFavorited ? 'active' : ''}`}
                    onClick={handleWishlist}>
                    <Heart size={20} fill={product.isFavorited ? 'currentColor' : 'none'} />
                    {product.isFavorited ? 'Saved' : 'Save'}
                  </button>
                </>
              )}
              {isOwnProduct && <div className="own-product-notice"><p>This is your listing</p></div>}
              {!token && (
                <button className="btn-primary"
                  onClick={() => { navigate('/login'); onClose(); }}>
                  Login to Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
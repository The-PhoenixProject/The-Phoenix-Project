// src/components/CreateProductModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { productAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import '../styles/MarketPlace/CreateProductModal.css'
const categories = ['Furniture','Electronics','Home Decor','Books & Media','Sporting Goods','Toys & Games','Crafts & DIY Materials','Jewelry','Miscellaneous'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Used'];

const CreateProductModal = ({ onClose, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '', condition: '', isEcoFriendly: false
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Clean object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [images]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setImages(prev => {
      const combined = [...prev, ...newPreviews];
      return combined.slice(0, 5); // max 5
    });
  };

  const removeImage = (idx) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !formData.condition) {
      return toast.error('Please fill in all required fields');
    }
    if (images.length > 5) return toast.error('Maximum 5 images allowed');

    setUploading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      images.forEach(img => data.append('images', img.file));

      const res = await productAPI.createProduct(data, token);
      // Accept a few possible response shapes from the backend
      // e.g. { success: true, product: {...} } OR { product: {...} } OR { data: { product: {...} } }
      const createdProduct = res?.product || res?.data?.product || res?.data || (res && typeof res === 'object' ? res : null);
      const isSuccess = res?.success || !!createdProduct;

      console.debug('Create product response:', res);

      if (isSuccess) {
        toast.success('Product listed successfully!');
        onSuccess && onSuccess(createdProduct);
      } else {
        // Fallback: still call onSuccess to refresh lists, but show info
        toast('Product listed (server returned unexpected response)', { icon: 'ℹ️' });
        onSuccess && onSuccess(createdProduct);
      }
    } catch (err) {
      console.error('Create product error:', err);
      toast.error(err.message || 'Failed to create product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-product-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>List a New Product</h2>
          <button onClick={onClose} className="btn-close"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="create-product-form">
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange}
              placeholder="e.g., Vintage Wooden Chair" required />
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange}
              placeholder="Describe your item..." rows="4" />
          </div>

          {/* Price & Category */}
          <div className="form-row">
            <div className="form-group">
              <label>Price ($) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                min="0" step="0.01" required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required>
                <option value="">Select category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Condition & Eco */}
          <div className="form-row">
            <div className="form-group">
              <label>Condition *</label>
              <select name="condition" value={formData.condition} onChange={handleInputChange} required>
                <option value="">Select condition</option>
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group checkbox">
              <label><input type="checkbox" name="isEcoFriendly"
                checked={formData.isEcoFriendly} onChange={handleInputChange} /> Eco-Friendly</label>
            </div>
          </div>

          {/* Images */}
          <div className="form-group">
            <label>Photos (up to 5)</label>
            <div className="image-upload-area">
              <input type="file" id="images" multiple accept="image/*"
                onChange={handleImageChange} style={{ display: 'none' }} />
              <label htmlFor="images" className="upload-btn"><Upload size={20} /> Choose Images</label>

              <div className="image-previews">
                {images.map((img, i) => (
                  <div key={i} className="image-preview">
                    <img src={img.preview} alt={`Preview ${i + 1}`} />
                    <button type="button" onClick={() => removeImage(i)} className="remove-image"><X size={16} /></button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label htmlFor="images" className="add-more"><Plus size={24} /></label>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? 'Listing...' : 'List Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
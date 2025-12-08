import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { maintenanceAPI } from "../services/api";

function ServiceProvidersList({ onDelete }) {
  const { token, currentUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultImage = "/assets/landingImgs/logo-icon.png";

  useEffect(() => {
    const loadProviders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('📤 Fetching service offers...');
        const response = await maintenanceAPI.getAllOffers(token);
        console.log('✅ Service offers response:', response);

        // ✅ FIXED: Handle correct response structure from backend
        const offersData = response.data?.offers || response.data || [];
        
        // ✅ FIXED: Transform backend data correctly
        const transformedProviders = offersData.map((offer) => ({
          id: offer._id,
          name: offer.name || "Service Provider",  // Backend uses "name" not "serviceName"
          description: offer.description,
          startingPrice: offer.startingPrice || "$50",
          category: offer.category || "General",
          rating: offer.user?.rating || 4.5,
          reviews: offer.user?.reviewCount || 0,
          image: offer.image || defaultImage,
          userId: offer.user?._id,
          status: offer.status || "Active"
        }));

        console.log('✅ Transformed providers:', transformedProviders);
        setProviders(transformedProviders);
      } catch (err) {
        console.error('❌ Failed to load providers:', err);
        setError(err.message || "Failed to load service providers");
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [token]);

  const renderStars = (rating) => {
    const r = Number(rating) || 0;
    const fullStars = Math.floor(r);
    const hasHalf = r - fullStars >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="bi bi-star-fill star-filled" aria-hidden="true"></i>
      );
    }

    if (hasHalf) {
      stars.push(
        <i key="half" className="bi bi-star-half star-half" aria-hidden="true"></i>
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="bi bi-star star-empty" aria-hidden="true"></i>
      );
    }

    return stars;
  };

  const handleDelete = async (providerId) => {
    if (!window.confirm("Are you sure you want to delete this service offer?")) {
      return;
    }

    try {
      console.log('🗑️ Deleting offer:', providerId);
      await maintenanceAPI.deleteOffer(providerId, token);
      
      // ✅ Update local state
      setProviders(prev => prev.filter(p => p.id !== providerId));
      
      // ✅ Notify parent
      if (onDelete) onDelete();
      
      alert("Service offer deleted successfully");
    } catch (err) {
      console.error('❌ Delete failed:', err);
      alert("Failed to delete service offer: " + err.message);
    }
  };

  // ✅ Check if provider was added by current user
  const isUserProvider = (provider) => {
    return provider.userId === currentUser?.userId || 
           provider.userId === currentUser?._id;
  };

  if (loading) {
    return (
      <div className="service-providers-list">
        <div className="loading-container">
          <p>Loading service providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-providers-list">
        <div className="error-container">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="service-providers-list">
        <div className="section-header">
          <h3>Available Service Providers</h3>
        </div>
        <p className="no-providers">Please login to view service providers</p>
      </div>
    );
  }

  return (
    <div className="service-providers-list">
      <div className="section-header">
        <h3>Available Service Providers</h3>
        <div className="header-actions">
          <button className="btn-icon">
            <i className="bi bi-chevron-down"></i> Filter
          </button>
          <button className="btn-icon">
            <i className="bi bi-list"></i> Sort
          </button>
        </div>
      </div>

      {providers.length === 0 ? (
        <p className="no-providers">
          No service providers available yet
        </p>
      ) : (
        <div className="providers-grid">
          {providers.map((provider) => (
            <div key={provider.id} className="provider-card">
              <img
                src={provider.image}
                alt={provider.name}
                className="provider-image"
              />
              <div className="provider-content">
                <h4 className="provider-name">{provider.name}</h4>
                <div className="provider-rating">
                  {renderStars(provider.rating)}
                  <span className="review-count">{provider.reviews} reviews</span>
                </div>
                <p className="provider-description">{provider.description}</p>
                <div className="provider-footer">
                  <span className="provider-price">
                    Starting from {provider.startingPrice}
                  </span>
                  <div className="provider-actions">
                    <button className="btn btn-hire-orange">Hire Now</button>
                    <button className="btn btn-view-profile">View Profile</button>
                    {isUserProvider(provider) && (
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(provider.id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .loading-container, .error-container {
          padding: 2rem;
          text-align: center;
          color: #666;
        }

        .no-providers {
          text-align: center;
          color: #999;
          padding: 2rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

export default ServiceProvidersList;
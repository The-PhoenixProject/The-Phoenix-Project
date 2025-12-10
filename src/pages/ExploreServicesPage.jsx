import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { maintenanceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './ExploreServicesPage.css';

// ✅ IMPROVED: Better placeholder images with category icons
const CATEGORY_ICONS = {
  Electronics: '⚡',
  Furniture: '🪑',
  Clothing: '👕',
  Accessories: '👜',
  Appliances: '🔌',
  Other: '🔧',
};

const CATEGORY_GRADIENTS = {
  Electronics: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  Furniture: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  Clothing: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  Accessories: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  Appliances: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  Other: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
};

function ExploreServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ratingFilter, setRatingFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('nearby');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const loadServices = async () => {
      if (!token) {
        setError('Please login to view services');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await maintenanceAPI.getAllOffers(token);
        console.log('✅ Service offers loaded:', response);

        const offersData = response.data?.offers || response.data || [];

        const transformedServices = offersData.map((offer) => ({
          id: offer._id || offer.id,
          providerName: offer.user?.fullName || 'Provider',
          category: offer.category || 'Other',
          priceRange: offer.startingPrice || '$50 - $200',
          rating: offer.user?.rating || 4.5,
          reviews: offer.user?.reviewCount || 0,
          description: offer.description || offer.name,
          image: offer.image || null, // ✅ Handle missing images
          name: offer.name,
        }));

        setServices(transformedServices);
      } catch (err) {
        console.error('❌ Failed to load services:', err);
        setError(err.message || 'Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [token]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === '' ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || service.category === selectedCategory;
    const matchesRating =
      ratingFilter === 'all' || service.rating >= parseFloat(ratingFilter);

    return matchesSearch && matchesCategory && matchesRating;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi bi-star${i < Math.floor(rating) ? '-fill' : ''} ${
          i < Math.floor(rating) ? 'star-filled' : 'star-empty'
        }`}
      ></i>
    ));
  };

  // ✅ IMPROVED: Handle image errors and show fallback
  const handleImageError = (serviceId) => {
    setImageErrors((prev) => ({ ...prev, [serviceId]: true }));
  };

  // ✅ IMPROVED: Render service image with fallback
  const renderServiceImage = (service) => {
    const hasError = imageErrors[service.id];
    const hasImage = service.image && !hasError;

    if (hasImage) {
      return (
        <img
          src={service.image}
          alt={service.description}
          className="service-image"
          onError={() => handleImageError(service.id)}
          loading="lazy"
        />
      );
    }

    // ✅ Fallback: Beautiful gradient with category icon
    const gradient =
      CATEGORY_GRADIENTS[service.category] || CATEGORY_GRADIENTS.Other;
    const icon = CATEGORY_ICONS[service.category] || CATEGORY_ICONS.Other;

    return (
      <div className="service-image-fallback" style={{ background: gradient }}>
        <span className="service-icon">{icon}</span>
        <span className="service-category-label">{service.category}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="explore-services-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-services-page">
        <div className="error-container">
          <h3>⚠️ Error Loading Services</h3>
          <p>{error}</p>
          {!token && (
            <Link to="/login" className="btn btn-primary">
              Login to Continue
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="explore-services-page">
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1>Explore Services</h1>
            <p className="page-subtitle">
              Find trusted providers who can fix or restore your items.
            </p>
          </div>
          <Link to="/maintenance" className="btn btn-home">
            Back
          </Link>
        </div>

        <div className="search-filters">
          <input
            type="text"
            className="search-input"
            placeholder="Search for a service or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="filters-row">
            <div className="filter-group">
              <label>Category:</label>
              <div className="category-buttons">
                <button
                  className={`category-btn ${
                    selectedCategory === 'Furniture' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory('Furniture')}
                >
                  Furniture
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === 'Electronics' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory('Electronics')}
                >
                  Electronics
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === 'Clothing' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory('Clothing')}
                >
                  Clothing
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === 'Appliances' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory('Appliances')}
                >
                  Appliances
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === 'all' ? 'active' : ''
                  }`}
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </button>
              </div>
            </div>

            <div className="filter-group">
              <label>Price Range:</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Rating:</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="4.5">4.5 & Up</option>
                <option value="4.0">4.0 & Up</option>
                <option value="3.5">3.5 & Up</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Location:</label>
              <div className="location-buttons">
                <button
                  className={`location-btn ${
                    locationFilter === 'nearby' ? 'active' : ''
                  }`}
                  onClick={() => setLocationFilter('nearby')}
                >
                  Nearby
                </button>
                <button
                  className={`location-btn ${
                    locationFilter === 'online' ? 'active' : ''
                  }`}
                  onClick={() => setLocationFilter('online')}
                >
                  Online
                </button>
              </div>
            </div>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="no-services">
            <p>No services found matching your criteria</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((service) => (
              <div key={service.id} className="service-card">
                {renderServiceImage(service)}
                <div className="service-content">
                  <h3 className="service-title">{service.description}</h3>
                  <p className="service-provider">By {service.providerName}</p>
                  <div className="service-meta">
                    <span className="service-category">{service.category}</span>
                    <span className="service-price-range">
                      {service.priceRange}
                    </span>
                  </div>
                  <div className="service-rating">
                    {renderStars(service.rating)}
                    <span className="rating-value">{service.rating}</span>
                  </div>
                  <div className="service-actions">
                    <button className="btn btn-view-details">
                      View Details
                    </button>
                    <button className="btn btn-request">Request</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pagination">
          <button className="pagination-btn">&lt;</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-btn">8</button>
          <button className="pagination-btn">&gt;</button>
        </div>
      </div>

      <style jsx>{`
        /* ===== IMPROVED IMAGE FALLBACK ===== */
        .service-image-fallback {
          width: 100%;
          height: 250px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          position: relative;
        }

        .service-icon {
          font-size: 5rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .service-category-label {
          font-size: 1.2rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          padding: 0.5rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

export default ExploreServicesPage;

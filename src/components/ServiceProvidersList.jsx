import React from "react";

function ServiceProvidersList({ providers, onDelete }) {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className="bi bi-star-fill star-filled"></i>
    ));
  };

  const handleDelete = (providerId) => {
    if (
      window.confirm("Are you sure you want to delete this service provider?")
    ) {
      if (onDelete) {
        onDelete(providerId);
      }
    }
  };

  // Check if provider was added by user
  const isUserAdded = (provider) => {
    // Check if postedBy exists and equals "You", or if ID is large (recently added)
    return provider.postedBy === "You" || provider.id > 1000000;
  };

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
                  {isUserAdded(provider) && (
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
    </div>
  );
}

export default ServiceProvidersList;

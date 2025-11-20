import React from "react";
import { Link } from "react-router-dom";

function HeroSection({ onRequestClick, onOfferClick }) {
  const handleRequestClick = () => {
    if (onRequestClick) {
      onRequestClick();
    }
  };

  const handleOfferClick = () => {
    if (onOfferClick) {
      onOfferClick();
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Need Something Fixed?</h1>
        <p className="hero-subtitle">Give your old items a second life.</p>
        <div className="hero-buttons">
          <button
            className="btn btn-primary-orange"
            onClick={handleRequestClick}
          >
            Request a Repair
          </button>
          <button className="btn btn-primary-orange" onClick={handleOfferClick}>
            Offer a Service
          </button>
        </div>
        <div className="hero-links">
          <Link to="/maintenance-offers" className="hero-link">
            Maintenance Requests
          </Link>
          <Link to="/my-maintenance-requests" className="hero-link">
            My Maintenance Requests
          </Link>
          <Link to="/my-services" className="hero-link">
            My Offers
          </Link>
          <Link to="/explore-services" className="hero-link">
            Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;

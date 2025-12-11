import { Link } from 'react-router-dom';

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
 
       <div className="hero-section maintenance-hero" style={{ width: "100%", maxWidth: "100%" }}>
      <div className="hero-content" style={{ width: "100%", maxWidth: "100%" }}>
        <h1 className="hero-title">Need Something Fixed?</h1>
        <p className="hero-subtitle" style={{ width: "100%", maxWidth: "100%" }}>Give your old items a second life.</p>
        <div className="hero-buttons" style={{ width: "100%", maxWidth: "100%" }}>
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
        <div className="hero-links" style={{ width: "100%", maxWidth: "100%" }}>
          <Link to="/maintenance-offers" className="hero-link">
            Maintenance Requests
          </Link>
          <Link to="/my-maintenance-requests" className="hero-link">
            My Maintenance Requests
          </Link>
          <Link to="/my-services" className="hero-link">
            My Services
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

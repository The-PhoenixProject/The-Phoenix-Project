import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadData } from "../services/dataService";
import "./ExploreServicesPage.css";

function ExploreServicesPage() {
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [ratingFilter, setRatingFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("nearby");

  useEffect(() => {
    loadData().then((data) => {
      // Transform serviceProviders data to match the explore services layout
      const transformedServices = data.serviceProviders.map((provider) => ({
        id: provider.id,
        providerName:
          provider.name.split(" ")[0] +
          " " +
          (provider.name.split(" ")[1] || ""),
        category: provider.category || "General",
        priceRange: provider.startingPrice || "$50 - $200",
        rating: provider.rating || 4.5,
        reviews: provider.reviews || 0,
        description: provider.description,
        image: provider.image,
      }));

      // Add mock services to match the image
      const mockServices = [
        {
          id: 100,
          providerName: "Sarah Johnson",
          category: "Furniture",
          priceRange: "$150 - $500",
          rating: 4.8,
          reviews: 120,
          description: "Antique Furniture Restoration",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 101,
          providerName: "Tech Mike",
          category: "Electronics",
          priceRange: "$50 - $200",
          rating: 4.2,
          reviews: 85,
          description: "Phone Screen Repair",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 102,
          providerName: "Emma Style",
          category: "Clothing",
          priceRange: "$25 - $100",
          rating: 5.0,
          reviews: 200,
          description: "Vintage Clothing Alterations",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 103,
          providerName: "Bob's Workshop",
          category: "Custom",
          priceRange: "$10 - $30",
          rating: 4.7,
          reviews: 45,
          description: "Garden Tool Sharpening",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 104,
          providerName: "Digital Fix Pro",
          category: "Electronics",
          priceRange: "$80 - $300",
          rating: 4.8,
          reviews: 150,
          description: "Laptop Repair & Upgrade",
          image: "https://via.placeholder.com/150",
        },
        {
          id: 105,
          providerName: "Comfort Crafters",
          category: "Furniture",
          priceRange: "$120 - $400",
          rating: 4.3,
          reviews: 90,
          description: "Chair Reupholstering",
          image: "https://via.placeholder.com/150",
        },
      ];

      setServices([...transformedServices, ...mockServices]);
    });
  }, []);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === "" ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.providerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || service.category === selectedCategory;
    const matchesRating =
      ratingFilter === "all" || service.rating >= parseFloat(ratingFilter);

    return matchesSearch && matchesCategory && matchesRating;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`bi bi-star${i < Math.floor(rating) ? "-fill" : ""} ${
          i < Math.floor(rating) ? "star-filled" : "star-empty"
        }`}
      ></i>
    ));
  };

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
          <Link to="/" className="btn btn-home">
            Home
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
                    selectedCategory === "Furniture" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("Furniture")}
                >
                  Furniture
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === "Electronics" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("Electronics")}
                >
                  Electronics
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === "Clothing" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("Clothing")}
                >
                  Clothing
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === "Custom" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("Custom")}
                >
                  Custom
                </button>
                <button
                  className={`category-btn ${
                    selectedCategory === "all" ? "active" : ""
                  }`}
                  onClick={() => setSelectedCategory("all")}
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
                    locationFilter === "nearby" ? "active" : ""
                  }`}
                  onClick={() => setLocationFilter("nearby")}
                >
                  Nearby
                </button>
                <button
                  className={`location-btn ${
                    locationFilter === "online" ? "active" : ""
                  }`}
                  onClick={() => setLocationFilter("online")}
                >
                  Online
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <img
                src={service.image}
                alt={service.description}
                className="service-image"
              />
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
                  <button className="btn btn-view-details">View Details</button>
                  <button className="btn btn-request">Request</button>
                </div>
              </div>
            </div>
          ))}
        </div>

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
    </div>
  );
}

export default ExploreServicesPage;

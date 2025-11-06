import React, { useState, useEffect } from "react";
import { loadData } from "../services/dataService";
import "./MyServicesPage.css";

function MyServicesPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadData().then((data) => {
      // Transform serviceProviders data to match the services layout
      const transformedServices = data.serviceProviders
        .filter((provider) => provider.postedBy === "You")
        .map((provider) => ({
          id: provider.id,
          name: provider.name,
          category: provider.category || "General",
          basePrice: provider.startingPrice || "$50",
          requestsCount: Math.floor(Math.random() * 15) + 1,
          status: "active",
        }));

      // Add some mock services if none exist
      if (transformedServices.length === 0) {
        setServices([
          {
            id: 1,
            name: "Phone Screen Repair",
            category: "Electronics",
            basePrice: "$45",
            requestsCount: 12,
            status: "active",
          },
          {
            id: 2,
            name: "Furniture Restoration",
            category: "Furniture",
            basePrice: "$80",
            requestsCount: 7,
            status: "active",
          },
          {
            id: 3,
            name: "Appliance Repair",
            category: "Appliances",
            basePrice: "$120",
            requestsCount: 3,
            status: "active",
          },
        ]);
      } else {
        setServices(transformedServices);
      }
    });
  }, []);

  const filteredServices =
    activeTab === "active"
      ? services.filter((s) => s.status === "active")
      : activeTab === "completed"
      ? services.filter((s) => s.status === "completed")
      : services;

  return (
    <div className="my-services-page">
      <div className="page-header">
        <div>
          <h1>My Services</h1>
          <p className="page-subtitle">
            Offer and manage the services you provide.
          </p>
        </div>
        <button className="btn btn-primary-orange">Add New Service</button>
      </div>

      <div className="services-tabs">
        <button
          className={`tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
        <button
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      <div className="services-grid">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3 className="service-name">{service.name}</h3>
                <span className="service-category">{service.category}</span>
              </div>
              <div className="service-price">
                Base Price: {service.basePrice}
              </div>
              <div className="service-stats">
                <span className="service-requests">
                  {service.requestsCount} Requests
                </span>
                <span className={`service-status ${service.status}`}>
                  {service.status.charAt(0).toUpperCase() +
                    service.status.slice(1)}
                </span>
              </div>
              <div className="service-actions">
                <button className="btn btn-edit">Edit</button>
                <button className="btn btn-delete">Delete</button>
                <button className="btn btn-view">View</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-services">No services found</p>
        )}
      </div>
    </div>
  );
}

export default MyServicesPage;

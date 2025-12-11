import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Components
import HeroSection from "../components/HeroSection";
import RequestForm from "../components/RequestForm";
import ServiceOfferForm from "../components/ServiceOfferForm";
import RepairRequestsList from "../components/RepairRequestsList";
import ServiceProvidersList from "../components/ServiceProvidersList";

// Pages
import MyMaintenanceRequestsPage from "./MyMaintenanceRequestsPage";
import MyServicesPage from "./MyServicesPage";

// Services
import {
  loadData,
  deleteRepairRequest,
  deleteServiceProvider,
} from "../services/dataService";

function MaintenanceHomePage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [data, setData] = useState({
    repairRequests: [],
    serviceProviders: [],
    myRequests: [],
    myOffers: [],
  });

  useEffect(() => {
    loadData().then((loadedData) => {
      setData(loadedData);
    });
  }, []);

  const refreshData = () => {
    loadData().then((loadedData) => {
      setData(loadedData);
    });
  };

  const handleDeleteRequest = async (requestId) => {
    await deleteRepairRequest(requestId);
    refreshData();
  };

  const handleDeleteProvider = async (providerId) => {
    await deleteServiceProvider(providerId);
    refreshData();
  };

  const handleRequestClick = () => {
    setActiveTab('requests');
    setTimeout(() => {
      const formElement = document.getElementById('request-repair-form');
      if (formElement) {
        const yOffset = -80;
        const y =
          formElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleOfferClick = () => {
    setActiveTab('requests');
    setTimeout(() => {
      const formElement = document.getElementById('offer-service-form');
      if (formElement) {
        const yOffset = -80;
        const y =
          formElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="app-container">
      <HeroSection
      style={{ width: "100%", maxWidth: "100%" }}
        onRequestClick={handleRequestClick}
        onOfferClick={handleOfferClick}
      />

      <div className="main-content" style={{ width: "95%", maxWidth: "100%" }}>
        {activeTab === 'requests' && (
          <div className="content-row">
            <div className="left-panel">
              <RequestForm onRequestAdded={refreshData} />
              <ServiceOfferForm onOfferAdded={refreshData} />

            </div>
            <div className="right-panel">
              <RepairRequestsList
                requests={data.repairRequests}
                onDelete={handleDeleteRequest}
              />
              <ServiceProvidersList
                providers={data.serviceProviders}
                onDelete={handleDeleteProvider}
              />
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="content-row">
            <div className="left-panel">
              <ServiceOfferForm onOfferAdded={refreshData} />
            </div>
            <div className="right-panel">
              <ServiceProvidersList
                providers={data.serviceProviders}
                onDelete={handleDeleteProvider}
              />
            </div>
          </div>
        )}

        {activeTab === 'myRequests' && (
          <div className="content-row">
            <div className="full-panel">
              <MyMaintenanceRequestsPage />
            </div>
          </div>
        )}

        {activeTab === 'myOffers' && (
          <div className="content-row">
            <div className="full-panel">
              <MyServicesPage />
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
}

export default MaintenanceHomePage;

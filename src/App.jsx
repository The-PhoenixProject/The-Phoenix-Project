import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomNavbar from "./components/shared/Navbar";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Chat from './components/chat/Chat'
import HeroSection from "./components/HeroSection";
import RequestForm from "./components/RequestForm";
import ServiceOfferForm from "./components/ServiceOfferForm";
import RepairRequestsList from "./components/RepairRequestsList";
import ServiceProvidersList from "./components/ServiceProvidersList";
import MaintenanceOffersPage from "./pages/MaintenanceOffersPage";
import MyMaintenanceRequestsPage from "./pages/MyMaintenanceRequestsPage";
import MyServicesPage from "./pages/MyServicesPage";
import ExploreServicesPage from "./pages/ExploreServicesPage";
import {
  loadData,
  deleteRepairRequest,
  deleteServiceProvider,
} from "./services/dataService";
import './App.css'

// Maintenance HomePage component
function MaintenanceHomePage() {
  const [activeTab, setActiveTab] = useState("requests");
  const [data, setData] = useState({
    repairRequests: [],
    serviceProviders: [],
    myRequests: [],
    myOffers: [],
  });

  useEffect(() => {
    // Load data from dataService
    loadData().then((loadedData) => {
      setData(loadedData);
    });
  }, []);

  // Function to refresh data after adding new items
  const refreshData = () => {
    loadData().then((loadedData) => {
      setData(loadedData);
    });
  };

  // Handle delete repair request
  const handleDeleteRequest = async (requestId) => {
    await deleteRepairRequest(requestId);
    refreshData();
  };

  // Handle delete service provider
  const handleDeleteProvider = async (providerId) => {
    await deleteServiceProvider(providerId);
    refreshData();
  };

  // Handle navigation from hero section
  const handleRequestClick = () => {
    setActiveTab("requests");
    setTimeout(() => {
      const formElement = document.getElementById("request-repair-form");
      if (formElement) {
        const yOffset = -80; // Offset for tabs
        const y =
          formElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const handleOfferClick = () => {
    setActiveTab("requests");
    setTimeout(() => {
      const formElement = document.getElementById("offer-service-form");
      if (formElement) {
        const yOffset = -80; // Offset for tabs
        const y =
          formElement.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="app-container">
      <HeroSection
        onRequestClick={handleRequestClick}
        onOfferClick={handleOfferClick}
      />

      <div className="main-content">
        {activeTab === "requests" && (
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

        {activeTab === "offers" && (
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

        {activeTab === "myRequests" && (
          <div className="content-row">
            <div className="full-panel">
              <p>My Maintenance Requests content goes here</p>
            </div>
          </div>
        )}

        {activeTab === "myOffers" && (
          <div className="content-row">
            <div className="full-panel">
              <p>My Offers content goes here</p>
            </div>
          </div>
        )}
      </div>

      <footer className="app-footer">
        <p>Together, we give waste a second chance.</p>
        <div className="footer-links">
          <button>Teams</button>
          <button>Privacy</button>
          <button>Contact</button>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <CustomNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/maintenance" element={<MaintenanceHomePage />} />
        <Route path="/maintenance-offers" element={<MaintenanceOffersPage />} />
        <Route
          path="/my-maintenance-requests"
          element={<MyMaintenanceRequestsPage />}
        />
        <Route path="/my-services" element={<MyServicesPage />} />
        <Route path="/explore-services" element={<ExploreServicesPage />} />
      </Routes>
    </Router>
  );
}

export default App;

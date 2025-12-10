// src/App.jsx - Updated with session interceptor
// Good Logic

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import sessionInterceptor from './services/sessionInterceptor';

// Context
import { AuthProvider } from './context/AuthContext';

// ✅ استيراد UserProvider
import { UserProvider } from './context/UserContext';

// Components
import CustomNavbar from './components/shared/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import AuthPage from './pages/AuthPage';
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import OtpVerification from './components/OtpVervication';

// Main Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import SavedPostsPage from './pages/SavedPostsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import Chat from './components/chat/Chat';
import ProfilePhoenixComponent from './pages/profile';
import ContactUs from './pages/contact';

// Maintenance Pages
import HeroSection from './components/HeroSection';
import RequestForm from './components/RequestForm';
import ServiceOfferForm from './components/ServiceOfferForm';
import RepairRequestsList from './components/RepairRequestsList';
import ServiceProvidersList from './components/ServiceProvidersList';
import MaintenanceOffersPage from './pages/MaintenanceOffersPage';
import MyMaintenanceRequestsPage from './pages/MyMaintenanceRequestsPage';
import MyServicesPage from './pages/MyServicesPage';
import ExploreServicesPage from './pages/ExploreServicesPage';
import ServiceProviderDashboard from './pages/ServiceProviderDashboard';
import MaintenanceRequestDetailPage from './pages/MaintenanceRequestDetailPage';

// Marketplace
import Marketplace from './pages/Marketplace';
import Wishlist from './pages/WishlistPage';

// Services
import {
  loadData,
  deleteRepairRequest,
  deleteServiceProvider,
} from './services/dataService';

import './App.css';

// Wrapper component to set up navigation
function AppWrapper() {
  const navigate = useNavigate();

  // Initialize session interceptor with navigate function
  React.useEffect(() => {
    sessionInterceptor.setNavigate(navigate);
  }, [navigate]);

  return <AppContent />;
}

// Maintenance HomePage component
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
        onRequestClick={handleRequestClick}
        onOfferClick={handleOfferClick}
      />

      <div className="main-content">
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

      <footer className="app-footer">
        <p>Together, we give waste a second chance.</p>
        <div className="footer-links">
          <Link to="/profile" className="text-decoration-none">
            Profile
          </Link>
          <Link to="/contact" className="text-decoration-none">
            Contact
          </Link>
          <Link to="/home" className="text-decoration-none">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

function AppContent() {
  // Sync auth state across tabs
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (e.key === 'authToken' && e.newValue !== e.oldValue) {
        // Token changed in another tab, reload the page
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageSync);

    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <CustomNavbar />

      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Auth Routes */}
        <Route path="/auth/*" element={<AuthPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />

        {/* ==================== PROTECTED ROUTES ==================== */}

        {/* Home & Feed */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Saved Posts */}
        <Route
          path="/saved-posts"
          element={
            <ProtectedRoute>
              <SavedPostsPage />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePhoenixComponent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfilePhoenixComponent />
            </ProtectedRoute>
          }
        />

        {/* ==================== MAINTENANCE & REPAIR HUB ==================== */}

        {/* Main Maintenance Page */}
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute>
              <MaintenanceHomePage />
            </ProtectedRoute>
          }
        />

        {/* Browse Available Maintenance Requests */}
        <Route
          path="/maintenance-offers"
          element={
            <ProtectedRoute>
              <MaintenanceOffersPage />
            </ProtectedRoute>
          }
        />

        {/* My Maintenance Requests (as Requester) */}
        <Route
          path="/my-maintenance-requests"
          element={
            <ProtectedRoute>
              <MyMaintenanceRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* My Service Offers (as Provider) */}
        <Route
          path="/my-services"
          element={
            <ProtectedRoute>
              <MyServicesPage />
            </ProtectedRoute>
          }
        />

        {/* Explore Service Providers */}
        <Route
          path="/explore-services"
          element={
            <ProtectedRoute>
              <ExploreServicesPage />
            </ProtectedRoute>
          }
        />

        {/* Service Provider Dashboard */}
        <Route
          path="/provider-dashboard"
          element={
            <ProtectedRoute>
              <ServiceProviderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Maintenance Request Detail Page */}
        <Route
          path="/maintenance/requests/:requestId"
          element={
            <ProtectedRoute>
              <MaintenanceRequestDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Review Page (after service completion) */}
        <Route
          path="/maintenance/requests/:requestId/review"
          element={
            <ProtectedRoute>
              <MaintenanceRequestDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ==================== MARKETPLACE ==================== */}

        {/* Browse Products */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />

        {/* Wishlist */}
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        {/* ==================== 404 & FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* ✅ تغليف المكونات بـ UserProvider للسماح بالوصول إلى بيانات الصورة من أي مكان */}
        <UserProvider>
          <AppWrapper />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

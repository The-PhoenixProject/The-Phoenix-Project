// // src/App.jsx - COMPLETELY FIXED VERSION
// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
// import { Toaster } from 'react-hot-toast';

// // Context
// import { AuthProvider } from "./context/AuthContext";

// // Components
// import CustomNavbar from "./components/shared/Navbar";
// import ProtectedRoute from "./components/ProtectedRoute";

// // Auth Pages
// import AuthPage from "./pages/AuthPage";
// import Login from "./components/Login";
// import Signup from "./components/Signup";
// import ForgotPassword from "./components/ForgotPassword";
// import ResetPassword from "./components/ResetPassword";
// import OtpVerification from "./components/OtpVervication";

// // Main Pages
// import LandingPage from "./pages/LandingPage";
// import HomePage from "./pages/HomePage";
// import SavedPostsPage from "./pages/SavedPostsPage"; // ✅ NEW
// import NotificationsPage from "./pages/NotificationsPage"; // ✅ NEW
// import SettingsPage from "./pages/SettingsPage"; // ✅ NEW
// import Chat from './components/chat/Chat';
// import ProfilePhoenixComponent from "./pages/profile";
// import ContactUs from "./pages/contact";


// // Maintenance Pages
// import HeroSection from "./components/HeroSection";
// import RequestForm from "./components/RequestForm";
// import ServiceOfferForm from "./components/ServiceOfferForm";
// import RepairRequestsList from "./components/RepairRequestsList";
// import ServiceProvidersList from "./components/ServiceProvidersList";
// import MaintenanceOffersPage from "./pages/MaintenanceOffersPage";
// import MyMaintenanceRequestsPage from "./pages/request";
// import MyServicesPage from "./pages/MyServicesPage";
// import ExploreServicesPage from "./pages/ExploreServicesPage";

// // Marketplace
// import Marketplace from "./pages/Marketplace";
// import Wishlist from "./pages/WishlistPage";

// // Services
// import {
//   loadData,
//   deleteRepairRequest,
//   deleteServiceProvider,
// } from "./services/dataService";

// import './App.css';

// // Maintenance HomePage component
// function MaintenanceHomePage() {
//   const [activeTab, setActiveTab] = useState("requests");
//   const [data, setData] = useState({
//     repairRequests: [],
//     serviceProviders: [],
//     myRequests: [],
//     myOffers: [],
//   });

//   useEffect(() => {
//     loadData().then((loadedData) => {
//       setData(loadedData);
//     });
//   }, []);

//   const refreshData = () => {
//     loadData().then((loadedData) => {
//       setData(loadedData);
//     });
//   };

//   const handleDeleteRequest = async (requestId) => {
//     await deleteRepairRequest(requestId);
//     refreshData();
//   };

//   const handleDeleteProvider = async (providerId) => {
//     await deleteServiceProvider(providerId);
//     refreshData();
//   };

//   const handleRequestClick = () => {
//     setActiveTab("requests");
//     setTimeout(() => {
//       const formElement = document.getElementById("request-repair-form");
//       if (formElement) {
//         const yOffset = -80;
//         const y =
//           formElement.getBoundingClientRect().top +
//           window.pageYOffset +
//           yOffset;
//         window.scrollTo({ top: y, behavior: "smooth" });
//       }
//     }, 100);
//   };

//   const handleOfferClick = () => {
//     setActiveTab("requests");
//     setTimeout(() => {
//       const formElement = document.getElementById("offer-service-form");
//       if (formElement) {
//         const yOffset = -80;
//         const y =
//           formElement.getBoundingClientRect().top +
//           window.pageYOffset +
//           yOffset;
//         window.scrollTo({ top: y, behavior: "smooth" });
//       }
//     }, 100);
//   };

//   return (
//     <div className="app-container">
//       <HeroSection
//         onRequestClick={handleRequestClick}
//         onOfferClick={handleOfferClick}
//       />
//       <div className="main-content">
//         {activeTab === "requests" && (
//           <div className="content-row">
//             <div className="left-panel">
//               <RequestForm onRequestAdded={refreshData} />
//               <ServiceOfferForm onOfferAdded={refreshData} />
//             </div>
//             <div className="right-panel">
//               <RepairRequestsList
//                 requests={data.repairRequests}
//                 onDelete={handleDeleteRequest}
//               />
//               <ServiceProvidersList
//                 providers={data.serviceProviders}
//                 onDelete={handleDeleteProvider}
//               />
//             </div>
//           </div>
//         )}

//         {activeTab === "offers" && (
//           <div className="content-row">
//             <div className="left-panel">
//               <ServiceOfferForm onOfferAdded={refreshData} />
//             </div>
//             <div className="right-panel">
//               <ServiceProvidersList
//                 providers={data.serviceProviders}
//                 onDelete={handleDeleteProvider}
//               />
//             </div>
//           </div>
//         )}

//         {activeTab === "myRequests" && (
//           <div className="content-row">
//             <div className="full-panel">
//               <MyMaintenanceRequestsPage />
//             </div>
//           </div>
//         )}

//         {activeTab === "myOffers" && (
//           <div className="content-row">
//             <div className="full-panel">
//               <MyServicesPage />
//             </div>
//           </div>
//         )}
//       </div>

//       <footer className="app-footer">
//         <p>Together, we give waste a second chance.</p>
//         <div className="footer-links">
//           <Link to="/profile" className="text-decoration-none">Profile</Link>
//           <Link to="/contact" className="text-decoration-none">Contact</Link>
//           <Link to="/home" className="text-decoration-none">Home</Link>
//         </div>
//       </footer>
//     </div>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         {/* Toast Notifications */}
//         <Toaster 
//           position="top-right"
//           toastOptions={{
//             duration: 3000,
//             style: {
//               background: '#363636',
//               color: '#fff',
//             },
//             success: {
//               iconTheme: {
//                 primary: '#4ade80',
//                 secondary: '#fff',
//               },
//             },
//             error: {
//               iconTheme: {
//                 primary: '#ef4444',
//                 secondary: '#fff',
//               },
//             },
//           }}
//         />
        
//         <CustomNavbar />
        
//         <Routes>
//           {/* Public Routes */}
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/contact" element={<ContactUs />} />
          
//           {/* Auth Routes - All public, no protection needed */}
//           <Route path="/auth/*" element={<AuthPage />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/otp-verification" element={<OtpVerification />} />
          
//           {/* ✅ HOME & FEED - Protected Routes */}
//           <Route 
//             path="/home" 
//             element={
//               <ProtectedRoute>
//                 <HomePage />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* ✅ NEW: Saved Posts Route */}
//           <Route 
//             path="/saved-posts" 
//             element={
//               <ProtectedRoute>
//                 <SavedPostsPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* ✅ NEW: Notifications Route */}
//           <Route 
//             path="/notifications" 
//             element={
//               <ProtectedRoute>
//                 <NotificationsPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* ✅ NEW: Settings Route */}
//           <Route 
//             path="/settings" 
//             element={
//               <ProtectedRoute>
//                 <SettingsPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Chat */}
//           <Route 
//             path="/chat" 
//             element={
//               <ProtectedRoute>
//                 <Chat />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Profile */}
//           <Route 
//             path="/profile" 
//             element={
//               <ProtectedRoute>
//                 <ProfilePhoenixComponent />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route 
//             path="/profile/:userId" 
//             element={
//               <ProtectedRoute>
//                 <ProfilePhoenixComponent />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Maintenance */}
//           <Route 
//             path="/maintenance" 
//             element={
//               <ProtectedRoute>
//                 <MaintenanceHomePage />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route 
//             path="/maintenance-offers" 
//             element={
//               <ProtectedRoute>
//                 <MaintenanceOffersPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route
//             path="/my-maintenance-requests"
//             element={
//               <ProtectedRoute>
//                 <MyMaintenanceRequestsPage />
//               </ProtectedRoute>
//             }
//           />
          
//           <Route 
//             path="/my-services" 
//             element={
//               <ProtectedRoute>
//                 <MyServicesPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route 
//             path="/explore-services" 
//             element={
//               <ProtectedRoute>
//                 <ExploreServicesPage />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Marketplace */}
//           <Route 
//             path="/marketplace" 
//             element={
//               <ProtectedRoute>
//                 <Marketplace />
//               </ProtectedRoute>
//             } 
//           />
          
//           <Route 
//             path="/wishlist" 
//             element={
//               <ProtectedRoute>
//                 <Wishlist />
//               </ProtectedRoute>
//             } 
//           />
          
//           {/* Catch all - redirect to home */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

// src/App.jsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from "./context/AuthContext";
// ✅ استيراد UserProvider
import { UserProvider } from "./context/UserContext"; 

// Components
import CustomNavbar from "./components/shared/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import AuthPage from "./pages/AuthPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import OtpVerification from "./components/OtpVervication";
///
import PublicProfilePage from "./pages/PublicProfilePage";

// Main Pages
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import SavedPostsPage from "./pages/SavedPostsPage"; // ✅ NEW
import NotificationsPage from "./pages/NotificationsPage"; // ✅ NEW
import SettingsPage from "./pages/SettingsPage"; // ✅ NEW
import Chat from './components/chat/Chat';
import ProfilePhoenixComponent from "./pages/profile";
import ContactUs from "./pages/contact";


// Maintenance Pages
import HeroSection from "./components/HeroSection";
import RequestForm from "./components/RequestForm";
import ServiceOfferForm from "./components/ServiceOfferForm";
import RepairRequestsList from "./components/RepairRequestsList";
import ServiceProvidersList from "./components/ServiceProvidersList";
import MaintenanceOffersPage from "./pages/MaintenanceOffersPage";
import MyMaintenanceRequestsPage from "./pages/request";
import MyServicesPage from "./pages/MyServicesPage";
import ExploreServicesPage from "./pages/ExploreServicesPage";

// Marketplace
import Marketplace from "./pages/Marketplace";
import Wishlist from "./pages/WishlistPage";

// Services
import {
    loadData,
    deleteRepairRequest,
    deleteServiceProvider,
} from "./services/dataService";

import './App.css';

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
        setActiveTab("requests");
        setTimeout(() => {
            const formElement = document.getElementById("request-repair-form");
            if (formElement) {
                const yOffset = -80;
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
                const yOffset = -80;
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
                            <MyMaintenanceRequestsPage />
                        </div>
                    </div>
                )}

                {activeTab === "myOffers" && (
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
                    <Link to="/profile" className="text-decoration-none">Profile</Link>
                    <Link to="/contact" className="text-decoration-none">Contact</Link>
                    <Link to="/home" className="text-decoration-none">Home</Link>
                </div>
            </footer>
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                {/* ✅ تغليف المكونات بـ UserProvider للسماح بالوصول إلى بيانات الصورة من أي مكان */}
                <UserProvider> 
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
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/contact" element={<ContactUs />} />
                        
                        {/* Auth Routes - All public, no protection needed */}
                        <Route path="/auth/*" element={<AuthPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/otp-verification" element={<OtpVerification />} />
                        //
                        <Route path="/profile/:userId" element={<PublicProfilePage />} />
                        
                        {/* ✅ HOME & FEED - Protected Routes */}
                        <Route 
                            path="/home" 
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* ✅ NEW: Saved Posts Route */}
                        <Route 
                            path="/saved-posts" 
                            element={
                                <ProtectedRoute>
                                    <SavedPostsPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* ✅ NEW: Notifications Route */}
                        <Route 
                            path="/notifications" 
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* ✅ NEW: Settings Route */}
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
                        
                        {/* Maintenance */}
                        <Route 
                            path="/maintenance" 
                            element={
                                <ProtectedRoute>
                                    <MaintenanceHomePage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/maintenance-offers" 
                            element={
                                <ProtectedRoute>
                                    <MaintenanceOffersPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route
                            path="/my-maintenance-requests"
                            element={
                                <ProtectedRoute>
                                    <MyMaintenanceRequestsPage />
                                </ProtectedRoute>
                            }
                        />
                        
                        <Route 
                            path="/my-services" 
                            element={
                                <ProtectedRoute>
                                    <MyServicesPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/explore-services" 
                            element={
                                <ProtectedRoute>
                                    <ExploreServicesPage />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Marketplace */}
                        <Route 
                            path="/marketplace" 
                            element={
                                <ProtectedRoute>
                                    <Marketplace />
                                </ProtectedRoute>
                            } 
                        />
                        
                        <Route 
                            path="/wishlist" 
                            element={
                                <ProtectedRoute>
                                    <Wishlist />
                                </ProtectedRoute>
                            } 
                        />
                        
                        {/* Catch all - redirect to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </UserProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
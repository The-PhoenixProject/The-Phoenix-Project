// SideBar.jsx - FIXED WITH REAL-TIME UPDATES
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import "../../styles/Home/SideBar.css";

const SideBar = ({ currentUser: initialUser, onUserUpdate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [refreshKey, setRefreshKey] = useState(0);

  const PLACEHOLDER_AVATAR = "https://ui-avatars.com/api/?name=User&background=007D6E&color=fff&size=100";
  const token = localStorage.getItem("authToken");

  // ✅ Refresh user data from API
  useEffect(() => {
    const fetchLatestUserData = async () => {
      try {
        const response = await authAPI.getMe(token);
        const user = response.data.user;
        
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        let profilePicUrl = PLACEHOLDER_AVATAR;
        
        if (user.profilePicture) {
          if (user.profilePicture.startsWith('http')) {
            profilePicUrl = user.profilePicture;
          } else if (user.profilePicture.startsWith('/uploads')) {
            profilePicUrl = `${API_BASE_URL}${user.profilePicture}`;
          } else if (user.profilePicture.startsWith('uploads/')) {
            profilePicUrl = `${API_BASE_URL}/${user.profilePicture}`;
          }
        }

        const updatedUser = {
          name: user.fullName || "User",
          avatar: profilePicUrl,
          subtitle: "Online now",
          id: user.id || user._id,
          ecoPoints: user.ecoPoints || 0,
          level: user.level || "Eco Newbie",
          postsCount: user.postsCount || 0,
          followersCount: user.followersCount || 0,
          followingCount: user.followingCount || 0
        };

        setCurrentUser(updatedUser);
        
        // Notify parent component
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }
      } catch (err) {
        console.error("Failed to refresh user data:", err);
      }
    };

    fetchLatestUserData();
  }, [token, refreshKey, onUserUpdate]);

  // ✅ Listen for custom events to refresh user data
  // ✅ Listen for custom events to refresh user data
useEffect(() => {
  const handleUserDataUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Listen for custom events
  window.addEventListener('userDataUpdated', handleUserDataUpdate);
  
  return () => {
    window.removeEventListener('userDataUpdated', handleUserDataUpdate);
  };
}, []);

  // ✅ Refresh when location changes (navigating between pages)
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [location.pathname]);

  const menuItems = [
    { icon: "bi-house-door-fill", label: "Home Feed", path: "/home" },
    { icon: "bi-person-fill", label: "My Profile", path: "/profile" },
    { icon: "bi-bookmark-fill", label: "Saved Posts", path: "/saved-posts" },
    { icon: "bi-bag-fill", label: "Marketplace", path: "/marketplace" },
    { icon: "bi-wrench", label: "Maintenance", path: "/maintenance" },
    { icon: "bi-chat-dots-fill", label: "Messages", path: "/chat" },
    { icon: "bi-bell-fill", label: "Notifications", path: "/notifications" },
    { icon: "bi-gear-fill", label: "Settings", path: "/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div 
      className="sidebar-container" 
      style={{ 
        position: 'sticky', 
        top: '20px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '5px'
      }}
    >
      {/* User Profile Card */}
      <div 
        className="card border-0 shadow-sm mb-3" 
        style={{ 
          borderRadius: '16px',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onClick={() => navigate('/profile')}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <div className="card-body p-4 text-center">
          <img
            src={currentUser?.avatar || PLACEHOLDER_AVATAR}
            alt="Profile"
            className="rounded-circle mb-3"
            style={{ 
              width: '80px', 
              height: '80px', 
              objectFit: 'cover',
              border: '3px solid #007D6E'
            }}
            onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
          />
          <h5 className="mb-1 fw-bold">{currentUser?.name || "User"}</h5>
          <p className="text-muted small mb-3">{currentUser?.subtitle || "Online now"}</p>
          
          {/* Eco Points Badge */}
          <div className="mb-3 p-3 rounded" style={{ backgroundColor: '#f0f9f7' }}>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-trophy-fill text-warning" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <h6 className="mb-0 fw-bold" style={{ color: '#007D6E' }}>
                  {currentUser?.ecoPoints || 0} Points
                </h6>
                <small className="text-muted">{currentUser?.level || "Eco Newbie"}</small>
              </div>
            </div>
          </div>

          {/* Stats - NOW UPDATES IN REAL-TIME */}
          <div className="d-flex justify-content-around py-3 border-top border-bottom">
            <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#007D6E' }}>
                {currentUser?.postsCount || 0}
              </h6>
              <small className="text-muted">Posts</small>
            </div>
            <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#007D6E' }}>
                {currentUser?.followersCount || 0}
              </h6>
              <small className="text-muted">Followers</small>
            </div>
            <div style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#007D6E' }}>
                {currentUser?.followingCount || 0}
              </h6>
              <small className="text-muted">Following</small>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="card-body p-3">
          <h6 className="mb-3 fw-bold px-2">Menu</h6>
          <div className="d-flex flex-column gap-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className={`btn text-start d-flex align-items-center gap-3 p-3 ${
                  isActive(item.path) ? 'btn-success text-white' : 'btn-light'
                }`}
                onClick={() => navigate(item.path)}
                style={{ 
                  borderRadius: '12px',
                  transition: 'all 0.2s',
                  border: 'none',
                  backgroundColor: isActive(item.path) ? '#007D6E' : '#f8f9fa',
                  color: isActive(item.path) ? 'white' : 'inherit'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: '1.2rem' }}></i>
                <span className="fw-semibold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
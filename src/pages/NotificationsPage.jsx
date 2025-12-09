// src/pages/NotificationsPage.jsx - FIXED DISPLAY ISSUE
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { notificationAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import io from "socket.io-client";
import "../styles/NotificationsPage.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const PLACEHOLDER_AVATAR = "https://ui-avatars.com/api/?name=User&background=007D6E&color=fff&size=100";
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return PLACEHOLDER_AVATAR;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_BASE_URL}/${imagePath}`;
    return PLACEHOLDER_AVATAR;
  }, [API_BASE_URL, PLACEHOLDER_AVATAR]);

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    console.log('🔄 Fetching notifications from API...');
    setLoading(true);
    
    try {
      const response = await notificationAPI.getNotifications(token);

      console.log('📥 API Response:', response);
      
      // ✅ HANDLE DIFFERENT RESPONSE STRUCTURES
      let notifs = [];
      if (response.data?.data) {
        notifs = response.data.data;
      } else if (response.data) {
        notifs = Array.isArray(response.data) ? response.data : [];
      } else if (response) {
        notifs = Array.isArray(response) ? response : [];
      }
      
      console.log('📋 Notifications found:', notifs.length);
      
      // ✅ TRANSFORM NOTIFICATIONS
      const transformed = notifs.map(notif => {
        console.log('🔍 Processing notification:', notif);
        
        return {
          id: notif._id || notif.id,
          type: notif.type || 'system',
          message: notif.message || 'New notification',
          isRead: notif.isRead || false,
          createdAt: notif.createdAt || new Date(),
          sender: notif.sender || {},
          relatedId: notif.relatedId,
          avatar: getImageUrl(notif.sender?.profilePicture)
        };
      });
      
      console.log('✅ Transformed notifications:', transformed);
      setNotifications(transformed);
      
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      console.error("Error details:", err.response || err);
      
      // Show user-friendly error
      if (err.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Please log in again',
          confirmButtonColor: '#007D6E'
        }).then(() => {
          navigate('/login');
        });
      }
      
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [token, getImageUrl, navigate]);

  // ✅ SOCKET.IO CONNECTION
  useEffect(() => {
    if (!token) return;

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    console.log("🔌 Connecting to Socket.IO at:", SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log("✅ Socket.IO connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error("❌ Socket.IO connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
      setIsConnected(false);
    });

    // ✅ LISTEN FOR NEW NOTIFICATIONS
    newSocket.on('notification:new', (data) => {
      console.log("🔔 New notification received:", data);
      
      const newNotification = {
        id: data.notification.id || data.notification._id,
        type: data.notification.type,
        message: data.notification.message,
        isRead: false,
        createdAt: data.notification.createdAt,
        sender: data.notification.sender,
        relatedId: data.notification.relatedId,
        avatar: getImageUrl(data.notification.sender?.profilePicture)
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Phoenix Project", {
          body: data.notification.message,
          icon: newNotification.avatar,
          tag: newNotification.id
        });
      }

      // Show toast notification
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'New Notification',
        text: data.notification.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    });

    // ✅ DEBUG: Log all socket events
    newSocket.onAny((event, ...args) => {
      console.log(`📡 Socket Event: ${event}`, args);
    });

    socketRef.current = newSocket;

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      console.log("🔌 Disconnecting Socket.IO");
      newSocket.offAny();
      newSocket.disconnect();
    };
  }, [token, API_BASE_URL, getImageUrl]);

  // ✅ INITIAL FETCH
  useEffect(() => {
    console.log('🎯 Initial useEffect triggered, token:', !!token);
    
    if (!token) {
      console.log('⚠️ No token found, redirecting to login');
      setLoading(false);
      navigate('/login');
      return;
    }
    
    fetchNotifications();
    
    // Refresh every 30 seconds as backup
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing notifications...');
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token, fetchNotifications, navigate]);

  const getNotificationIcon = (type) => {
    const icons = {
      like: { icon: "bi-heart-fill", color: "#e74c3c" },
      comment: { icon: "bi-chat-dots-fill", color: "#3498db" },
      follow: { icon: "bi-person-plus-fill", color: "#2ecc71" },
      share: { icon: "bi-share-fill", color: "#9b59b6" },
      ecoPoints: { icon: "bi-trophy-fill", color: "#f39c12" },
      product: { icon: "bi-bag-fill", color: "#e67e22" },
      message: { icon: "bi-envelope-fill", color: "#1abc9c" },
      system: { icon: "bi-bell-fill", color: "#95a5a6" }
    };
    return icons[type] || { icon: "bi-bell-fill", color: "#95a5a6" };
  };

  const formatTime = (date) => {
    if (!date) return "Just now";
    
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationAPI.markAsRead(notifId, token);

      setNotifications(prev => prev.map(n => 
        n.id === notifId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Swal.fire({
        icon: "success",
        title: "All notifications marked as read",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      Swal.fire("Error", "Failed to mark all as read", "error");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      await notificationAPI.deleteNotification(notifId, token);
      setNotifications(prev => prev.filter(n => n.id !== notifId));
      Swal.fire({
        icon: "success",
        title: "Notification deleted",
        timer: 1000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
      Swal.fire("Error", "Failed to delete notification", "error");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // ✅ LOADING STATE
  if (loading && notifications.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-light"
              onClick={() => navigate('/home')}
              style={{ borderRadius: '12px' }}
            >
              <i className="bi bi-arrow-left"></i>
            </button>
            <div>
              <h3 className="mb-0" style={{ color: '#007D6E' }}>
                <i className="bi bi-bell-fill me-2"></i>
                Notifications
                {isConnected && (
                  <span className="badge bg-success ms-2" style={{ fontSize: '0.6rem' }}>
                    <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.4rem' }}></i>
                    Live
                  </span>
                )}
                {!isConnected && (
                  <span className="badge bg-warning ms-2" style={{ fontSize: '0.6rem' }}>
                    <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.4rem' }}></i>
                    Offline
                  </span>
                )}
              </h3>
              <p className="text-muted mb-0">
                {loading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
              {/* debug info removed */}
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-light"
              onClick={fetchNotifications}
              style={{ borderRadius: '12px' }}
              title="Refresh"
              disabled={loading}
            >
              <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
            </button>
            {unreadCount > 0 && (
              <button 
                className="btn btn-success"
                onClick={handleMarkAllAsRead}
                style={{ borderRadius: '12px' }}
              >
                <i className="bi bi-check-all me-2"></i>
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="filter-tabs mb-4">
          <div className="btn-group" role="group">
            <button
              className={`btn ${filter === 'all' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`btn ${filter === 'unread' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`btn ${filter === 'read' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length === 0 ? (
            <div className="card text-center py-5 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <i className="bi bi-bell-slash" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                <h5 className="mt-3">No Notifications</h5>
                <p className="text-muted">
                  {filter === 'unread' ? "You're all caught up!" : "No notifications yet"}
                </p>
                {notifications.length > 0 && (
                  <button 
                    className="btn btn-outline-success mt-3"
                    onClick={() => setFilter('all')}
                  >
                    Show All Notifications
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const iconData = getNotificationIcon(notif.type);
              
              return (
                <div
                  key={notif.id}
                  className={`notification-item card mb-3 ${!notif.isRead ? 'unread' : ''}`}
                  style={{ 
                    borderRadius: '16px',
                    borderLeft: !notif.isRead ? `4px solid ${iconData.color}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: !notif.isRead ? '#f0f9f7' : 'white'
                  }}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                >
                  <div className="card-body p-3">
                    <div className="d-flex gap-3">
                      <div className="position-relative">
                        <img
                          src={notif.avatar}
                          alt="Avatar"
                          className="rounded-circle"
                          width="48"
                          height="48"
                          style={{ border: '2px solid #f0f0f0' }}
                          onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
                        />
                        <div
                          className="position-absolute"
                          style={{
                            bottom: '-2px',
                            right: '-2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: iconData.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                          }}
                        >
                          <i 
                            className={iconData.icon} 
                            style={{ fontSize: '10px', color: 'white' }}
                          ></i>
                        </div>
                      </div>

                      <div className="flex-grow-1">
                        <p className="mb-1" style={{ fontWeight: !notif.isRead ? 'bold' : 'normal' }}>
                          {notif.message}
                        </p>
                        <small className="text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {formatTime(notif.createdAt)}
                        </small>
                      </div>

                      <div className="d-flex gap-2 align-items-start">
                        {!notif.isRead && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notif.id);
                            }}
                            style={{ borderRadius: '8px' }}
                            title="Mark as read"
                          >
                            <i className="bi bi-check"></i>
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-light"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notif.id);
                          }}
                          style={{ borderRadius: '8px' }}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* debug panel removed */}
      </div>
    </div>
  );
};

export default NotificationsPage;
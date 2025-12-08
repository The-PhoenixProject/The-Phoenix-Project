// FriendsList.jsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import Swal from "sweetalert2";
import "../../styles/Home/RightSideBar.css";

const FriendsList = ({ onUserFollowed }) => {
  const navigate = useNavigate();
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [ecoTips, setEcoTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState(new Set());
  
  const PLACEHOLDER_AVATAR = "https://t3.ftcdn.net/jpg/11/61/33/36/360_F_1161333642_i694dqMuUwQEpEPdQOhuxdRC9WHPREFJ.jpg";
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ✅ ECO TIPS - Random on every refresh
  const ECO_TIPS_POOL = [
    {
      icon: "bi-lightbulb-fill",
      title: "Energy Saving Tip",
      description: "Switch to LED bulbs to save 75% energy!"
    },
    {
      icon: "bi-droplet-fill",
      title: "Water Conservation",
      description: "Fix leaky faucets to save up to 3000 gallons/year"
    },
    {
      icon: "bi-recycle",
      title: "Recycling Reminder",
      description: "Rinse containers before recycling for better results"
    },
    {
      icon: "bi-bag-fill",
      title: "Zero Waste Shopping",
      description: "Bring reusable bags when shopping to reduce plastic waste"
    },
    {
      icon: "bi-tree-fill",
      title: "Plant a Tree",
      description: "One tree absorbs up to 48 lbs of CO2 per year"
    },
    {
      icon: "bi-sun-fill",
      title: "Solar Power",
      description: "Solar panels can reduce electricity bills by 50-90%"
    },
    {
      icon: "bi-bicycle",
      title: "Green Commute",
      description: "Bike or walk for short trips to reduce emissions"
    },
    {
      icon: "bi-cup-straw",
      title: "Say No to Plastic",
      description: "Use a reusable water bottle instead of buying bottled water"
    }
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    
    try {
      // ✅ 1. Get random eco tips (3 random tips)
      const shuffled = [...ECO_TIPS_POOL].sort(() => 0.5 - Math.random());
      setEcoTips(shuffled.slice(0, 3));

      // ✅ 2. Fetch suggested friends from API
      try {
        const friendsResponse = await userAPI.getSuggestedFriends(token);
        const suggestions = friendsResponse.data?.suggestions || [];
        
        const transformedFriends = suggestions.slice(0, 5).map(friend => ({
          id: friend._id || friend.id,
          name: friend.fullName || "User",
          avatar: getImageUrl(friend.profilePicture),
          mutualFriends: friend.mutualFriends || 0,
          ecoPoints: friend.ecoPoints || 0,
          level: friend.level || "Eco Newbie"
        }));
        
        setSuggestedFriends(transformedFriends);
      } catch (err) {
        console.warn("Failed to fetch suggested friends:", err);
        setSuggestedFriends([]);
      }

      // ✅ 3. Fetch trending topics from posts
      try {
        const trendingResponse = await userAPI.getTrendingTopics();
        const trending = trendingResponse.data?.trending || [];
        setTrendingTopics(trending.slice(0, 5));
      } catch (err) {
        console.warn("Failed to fetch trending topics:", err);
        // Default trending topics if API fails
        setTrendingTopics([
          { tag: "#Sustainability", count: "Popular" },
          { tag: "#EcoFriendly", count: "Popular" },
          { tag: "#RecycleMore", count: "Popular" },
          { tag: "#GreenAction", count: "Popular" },
          { tag: "#ClimateAction", count: "Popular" },
        ]);
      }

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_AVATAR;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_BASE_URL}/${imagePath}`;
    return PLACEHOLDER_AVATAR;
  };

  const handleFollowClick = async (friendId) => {
    const token = localStorage.getItem("authToken");
    
    try {
      await userAPI.followUser(friendId, token);
      setFollowingIds(prev => new Set([...prev, friendId]));
      
      Swal.fire({
        icon: "success",
        title: "Following!",
        timer: 1500,
        showConfirmButton: false
      });

      // Remove from suggestions after following
      setSuggestedFriends(prev => prev.filter(f => f.id !== friendId));
      
      // ✅ Notify parent component to update user data
      if (onUserFollowed) {
        onUserFollowed();
      }
    } catch (err) {
      console.error("Follow error:", err);
      Swal.fire("Error", "Failed to follow user", "error");
    }
  };

  const handleHashtagClick = (tag) => {
    // TODO: Implement hashtag search functionality
    console.log("Search for:", tag);
    Swal.fire({
      icon: "info",
      title: "Coming Soon!",
      text: `Search for ${tag} will be available soon`,
      timer: 2000
    });
  };

  return (
    <div 
      className="right-sidebar-container" 
      style={{ 
        position: 'sticky', 
        top: '20px',
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingLeft: '5px',
        // Custom scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: '#007D6E #f1f1f1'
      }}
    >
      {/* ✅ Eco Tips Section - Random on refresh */}
      <div className="eco-tips-card mb-4 bg-white shadow-sm rounded p-3" style={{ borderRadius: '16px' }}>
        <div className="card-header pb-3 bg-transparent border-0">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-leaf text-success me-2"></i>
            Eco Tips of the Day
          </h6>
        </div>
        <div className="card-body p-0 mt-3">
          {ecoTips.map((tip, index) => (
            <div 
              key={index} 
              className="eco-tip-item mb-3 p-2 rounded" 
              style={{ 
                backgroundColor: "#f8f9fa",
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,125,110,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="d-flex align-items-start gap-2">
                <i className={`bi ${tip.icon} text-success`} style={{ fontSize: "1.5rem" }}></i>
                <div>
                  <h6 className="mb-1 small fw-bold">{tip.title}</h6>
                  <p className="mb-0 small text-muted">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Suggested Friends Section - From API */}
      <div className="friends-card mb-4 bg-white shadow-sm rounded p-3" style={{ borderRadius: '16px' }}>
        <div className="card-header pb-3 bg-transparent border-0">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-people-fill text-success me-2"></i>
            Suggested Connections
          </h6>
        </div>
        <div className="card-body p-0 mt-3">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : suggestedFriends.length === 0 ? (
            <p className="text-center text-muted small py-3">
              No suggestions yet
            </p>
          ) : (
            <div className="friends-list">
              {suggestedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="friend-item d-flex justify-content-between align-items-center p-2 mb-2 rounded"
                  style={{ 
                    cursor: "pointer", 
                    backgroundColor: "#f8f9fa",
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e9ecef';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div 
                    className="d-flex align-items-center gap-2 flex-grow-1"
                    onClick={() => navigate(`/profile/${friend.id}`)}
                  >
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="rounded-circle"
                      width="40"
                      height="40"
                      style={{ border: '2px solid #007D6E' }}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_AVATAR;
                      }}
                    />
                    <div>
                      <h6 className="mb-0 small fw-bold">{friend.name}</h6>
                      <small className="text-muted">
                        {friend.mutualFriends > 0 
                          ? `${friend.mutualFriends} mutual friends` 
                          : `${friend.ecoPoints} eco points`
                        }
                      </small>
                    </div>
                  </div>
                  <button 
                    className="btn btn-sm orangebtn"
                    style={{ 
                      borderRadius: '8px',
                      padding: '4px 12px',
                      fontSize: '0.85rem'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowClick(friend.id);
                    }}
                    disabled={followingIds.has(friend.id)}
                  >
                    {followingIds.has(friend.id) ? '✓ Following' : '+ Follow'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Trending Topics Section - From Posts */}
      <div className="hashtags-card bg-white shadow-sm rounded p-3" style={{ borderRadius: '16px' }}>
        <div className="card-header pb-3 bg-transparent border-0">
          <h6 className="mb-0 fw-bold">
            <i className="bi bi-hash text-success me-2"></i>
            Trending Topics
          </h6>
        </div>
        <div className="card-body p-0 mt-3">
          <div className="hashtags-list">
            {trendingTopics.map((item, index) => (
              <a
                key={index}
                href="#"
                className="hashtag-link d-flex justify-content-between align-items-center p-2 mb-2 rounded text-decoration-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleHashtagClick(item.tag);
                }}
                style={{ 
                  transition: "all 0.2s", 
                  backgroundColor: "transparent" 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8f9fa";
                  e.currentTarget.style.transform = "translateX(5px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span className="orangeText fw-bold">{item.tag}</span>
                <small className="text-muted">{item.count}</small>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsList;
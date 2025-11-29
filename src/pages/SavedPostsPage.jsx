// SavedPostsPage.jsx - NEW COMPONENT (fixed)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../services/api";
import PostCard from "../components/home/post/PostCard";
import Swal from "sweetalert2";
import "../styles/Home/HomePage.css";

// Inline SVG data-URI placeholder to avoid external DNS lookups
const DEFAULT_PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect fill='%23f0f0f0' width='120' height='120'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='16'>User</text></svg>`
  );

const SavedPostsPage = () => {
  const navigate = useNavigate();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const token = localStorage.getItem("authToken");

  // Hoisted function declarations (these are available before useEffect runs)
  async function fetchCurrentUser() {
    try {
      const { authAPI } = await import("../services/api");
      const response = await authAPI.getMe(token);
      const user = response.data?.user || response.data || null;

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      let profilePicUrl = DEFAULT_PLACEHOLDER;

      if (user?.profilePicture) {
        if (user.profilePicture.startsWith("http")) {
          profilePicUrl = user.profilePicture;
        } else if (user.profilePicture.startsWith("/uploads")) {
          profilePicUrl = `${API_BASE_URL}${user.profilePicture}`;
        } else if (user.profilePicture.startsWith("uploads/")) {
          profilePicUrl = `${API_BASE_URL}/${user.profilePicture}`;
        }
      }

      setCurrentUser({
        id: user?.id || user?._id,
        name: user?.fullName || user?.name || "You",
        avatar: profilePicUrl,
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  }

  async function fetchSavedPosts() {
    setLoading(true);
    try {
      const response = await userAPI.getSavedPosts(token);
      const posts = response.data?.posts || response.posts || [];

      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const PLACEHOLDER_AVATAR = DEFAULT_PLACEHOLDER;

      const transformedPosts = posts.map((post) => {
        let authorAvatar = PLACEHOLDER_AVATAR;
        if (post.user?.profilePicture) {
          if (post.user.profilePicture.startsWith("http")) {
            authorAvatar = post.user.profilePicture;
          } else if (post.user.profilePicture.startsWith("/uploads")) {
            authorAvatar = `${API_BASE_URL}${post.user.profilePicture}`;
          } else if (post.user.profilePicture.startsWith("uploads/")) {
            authorAvatar = `${API_BASE_URL}/${post.user.profilePicture}`;
          }
        }

        return {
          id: post._id || post.id,
          author: {
            name: post.user?.fullName || post.user?.name || "Unknown User",
            avatar: authorAvatar,
            id: post.user?._id || post.user?.id,
          },
          content: post.content,
          image: post.media?.url || null,
          mediaType: post.media?.type || null,
          tags: post.tags || [],
          likes: post.likes?.length || 0,
          comments: post.comments || [],
          timestamp: formatTimestamp(post.createdAt),
          createdAt: post.createdAt,
          isLiked: false,
          isSaved: true,
          shares: post.shares || 0,
        };
      });

      setSavedPosts(transformedPosts);
    } catch (err) {
      console.error("Failed to fetch saved posts:", err);
      Swal.fire("Error", "Failed to load saved posts", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSavedPosts();
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimestamp = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return postDate.toLocaleDateString();
  };

  const handleUnsavePost = async (postId) => {
    try {
      await userAPI.toggleSavePost(postId, token);
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
      
      Swal.fire({
        icon: "success",
        title: "Post Unsaved",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Unsave error:", err);
      Swal.fire("Error", "Failed to unsave post", "error");
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your saved posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-light me-3"
          onClick={() => navigate('/home')}
          style={{ borderRadius: '12px' }}
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h3 className="mb-0" style={{ color: '#007D6E' }}>
            <i className="bi bi-bookmark-fill me-2"></i>
            Saved Posts
          </h3>
          <p className="text-muted mb-0">{savedPosts.length} saved post{savedPosts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Saved Posts List */}
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {savedPosts.length === 0 ? (
            <div className="card text-center py-5 shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body">
                <i className="bi bi-bookmark" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                <h5 className="mt-3">No Saved Posts</h5>
                <p className="text-muted">Posts you save will appear here</p>
                <button 
                  className="btn btn-success mt-3"
                  onClick={() => navigate('/home')}
                  style={{ borderRadius: '12px' }}
                >
                  <i className="bi bi-house-door me-2"></i>
                  Go to Home Feed
                </button>
              </div>
            </div>
          ) : (
            savedPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                currentUser={currentUser}
                onLikeToggle={() => {}}
                onComment={() => {}}
                onShare={() => {}}
                onDelete={handleUnsavePost}
                isOwner={false}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedPostsPage;
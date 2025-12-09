// HomePage.jsx - COMPLETELY FIXED WITH ALL FEATURES
import React, { useState, useEffect, useCallback } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import SideBar from "../components/home/SideBar";
import CreatePost from "../components/home/post/CreatePost";
import PostCard from "../components/home/post/PostCard";
import FriendsList from "../components/home/FriendsList";
import { postAPI, authAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Swal from "sweetalert2";
import "../styles/Home/HomePage.css";

const HomePage = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Edit post state
  const [editingPost, setEditingPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const PLACEHOLDER_AVATAR = "https://ui-avatars.com/api/?name=User&background=007D6E&color=fff&size=100";
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ✅ Fetch user data with useCallback to avoid dependency issues
  // ✅ Fetch user data with useCallback to avoid dependency issues
const fetchUserData = useCallback(async () => {
  try {
    const response = await authAPI.getMe(token);
    const user = response.data.user;
    
    let profilePicUrl = PLACEHOLDER_AVATAR;
    if (user.profilePicture) {
      if (user.profilePicture.startsWith('http')) profilePicUrl = user.profilePicture;
      else if (user.profilePicture.startsWith('/uploads')) profilePicUrl = `${API_BASE_URL}${user.profilePicture}`;
      else if (user.profilePicture.startsWith('uploads/')) profilePicUrl = `${API_BASE_URL}/${user.profilePicture}`;
    }

    setCurrentUser({
      name: user.fullName || "User",
      avatar: profilePicUrl,
      subtitle: "Online now",
      id: user.id || user._id,
      ecoPoints: user.ecoPoints || 0,
      level: user.level || "Eco Newbie",
      postsCount: user.postsCount || 0,
      // ✅ FIX: Use the length of followers/following arrays instead of counts
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0
    });
  } catch (err) {
    console.error("Failed to fetch user data:", err);
    setCurrentUser({ 
      name: "User", 
      avatar: PLACEHOLDER_AVATAR, 
      subtitle: "Online now",
      followersCount: 0,
      followingCount: 0
    });
  }
}, [token, API_BASE_URL]);

  // Fetch current user data
  useEffect(() => {
    if (token) fetchUserData();
  }, [token, fetchUserData]);

  // Fetch posts feed
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await postAPI.getFeedPosts(token);
        
        const transformedPosts = (response.data || []).map(post => {
          let authorAvatar = PLACEHOLDER_AVATAR;
          if (post.user?.profilePicture) {
            if (post.user.profilePicture.startsWith('http')) authorAvatar = post.user.profilePicture;
            else if (post.user.profilePicture.startsWith('/uploads')) authorAvatar = `${API_BASE_URL}${post.user.profilePicture}`;
            else if (post.user.profilePicture.startsWith('uploads/')) authorAvatar = `${API_BASE_URL}/${post.user.profilePicture}`;
          }

          return {
            id: post._id,
            author: { 
              name: post.user?.fullName || "Unknown User", 
              avatar: authorAvatar, 
              id: post.user?._id 
            },
            content: post.content,
            image: post.media?.url || null,
            mediaType: post.media?.type || null,
            tags: post.tags || [],
            likes: post.likes?.length || 0,
            comments: post.comments || [],
            timestamp: formatTimestamp(post.createdAt),
            createdAt: post.createdAt,
            isLiked: post.likes?.includes(currentUser?.id) || false,
            isSaved: false,
            shares: post.shares || 0
          };
        });

        setPosts(transformedPosts);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    if (token && currentUser) fetchPosts();
  }, [token, currentUser, API_BASE_URL]);

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

  // ✅ Handle create post
  const handleCreatePost = async (postData) => {
    if (!postData.content && !postData.media) {
      Swal.fire("Error", "Please add text or media to your post", "error");
      return;
    }
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append("content", postData.content);
      if (postData.media) formData.append("media", postData.media);
      if (postData.tags?.length > 0) formData.append("tags", JSON.stringify(postData.tags));
      if (postData.category) formData.append("category", postData.category);

      const response = await postAPI.createPost(formData, token);
      
      const newPost = {
        id: response.post._id,
        author: { name: currentUser.name, avatar: currentUser.avatar, id: currentUser.id },
        content: response.post.content,
        image: response.post.media?.url || null,
        mediaType: response.post.media?.type || null,
        tags: response.post.tags || [],
        likes: 0,
        comments: [],
        timestamp: "Just now",
        createdAt: response.post.createdAt,
        isLiked: false,
        isSaved: false,
        shares: 0
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      // ✅ Refresh user data to get updated eco points
      await fetchUserData();
      
      Swal.fire({
        icon: "success",
        title: "Post Created!",
        html: `Your post has been published.<br/><span style="color: #007D6E">+10 Eco Points earned! 🌿</span>`,
        timer: 2500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Failed to create post:", err);
      Swal.fire({ icon: "error", title: "Failed to Create Post", text: err.message || "Something went wrong." });
    } finally {
      setCreating(false);
    }
  };

  // ✅ Handle like toggle
  const handleLikeToggle = async (postId, isLiked) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1, isLiked };
      }
      return post;
    }));
  };

  // ✅ Handle comment added
  const handleComment = async (postId, commentText) => {
    if (!postId || !commentText || !commentText.trim()) return;

    const newComment = {
      id: `c_${Date.now()}`,
      user: {
        id: currentUser?.id || null,
        name: currentUser?.name || "Anonymous",
        avatar: currentUser?.avatar || PLACEHOLDER_AVATAR
      },
      text: commentText,
      createdAt: new Date().toISOString()
    };

    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...(post.comments || []), newComment] };
      }
      return post;
    }));
  };

  // ✅ Handle share
  const handleShare = async (postId) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) return { ...post, shares: post.shares + 1 };
      return post;
    }));
  };

  // ✅ Handle delete post
  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    setCurrentUser(prev => ({ ...prev, postsCount: Math.max((prev.postsCount || 1) - 1, 0) }));
  };

  // ✅ Handle edit post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setShowEditModal(true);
  };

  // ✅ Submit edit
  const handleSubmitEdit = async () => {
    if (!editContent.trim()) {
      Swal.fire("Error", "Post content cannot be empty", "error");
      return;
    }
    setIsUpdating(true);
    try {
      await postAPI.updatePost(editingPost.id, { content: editContent }, token);
      
      setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === editingPost.id) return { ...post, content: editContent };
        return post;
      }));
      
      setShowEditModal(false);
      setEditingPost(null);
      setEditContent("");
      
      Swal.fire({ icon: "success", title: "Post Updated!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Failed to update post:", err);
      Swal.fire("Error", err.message || "Failed to update post", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ Handle user followed - refresh user data
  const handleUserFollowed = async () => {
    await fetchUserData();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="homepage-container">
        <div className="container-fluid">
          <div className="row g-4">
            <div className="col-lg-3"><SideBar currentUser={currentUser} /></div>
            <div className="col-lg-6">
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading your feed...</p>
              </div>
            </div>
            <div className="col-lg-3"><FriendsList currentUser={currentUser} onUserFollowed={handleUserFollowed} /></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage-container">
      <div className="container-fluid">
        <div className="row g-4">
          <div className="col-lg-3">
            <SideBar currentUser={currentUser} />
          </div>

          <div className="col-lg-6">
            {currentUser && (
              <CreatePost 
                currentUser={currentUser} 
                onCreatePost={handleCreatePost} 
                isCreating={creating} 
              />
            )}

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
              </div>
            )}

            <div className="posts-feed">
              {posts.length === 0 && !loading ? (
                <div className="card text-center py-5">
                  <div className="card-body">
                    <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                    <h5 className="mt-3">No Posts Yet</h5>
                    <p className="text-muted">Be the first to share your eco-friendly story!</p>
                  </div>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard 
                    key={post.id} 
                    post={post}
                    onLikeToggle={handleLikeToggle}
                    onComment={handleComment}
                    onShare={handleShare}
                    onDelete={handleDeletePost}
                    onEdit={handleEditPost}
                    currentUser={currentUser}
                    isOwner={post.author?.id === currentUser?.id}
                  />
                ))
              )}
            </div>

            {loading && posts.length > 0 && (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-success" role="status">
                  <span className="visually-hidden">Loading more...</span>
                </div>
              </div>
            )}
          </div>

          <div className="col-lg-3">
            <FriendsList currentUser={currentUser} onUserFollowed={handleUserFollowed} />
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); setEditingPost(null); }} centered>
        <Modal.Header closeButton style={{ background: '#007D6E', color: 'white' }}>
          <Modal.Title><i className="bi bi-pencil-square me-2"></i>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group>
              <Form.Label className="fw-bold">Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="What's on your mind?"
                style={{ borderRadius: "12px" }}
              />
              <Form.Text className="text-muted">
                💡 You can use hashtags like #RecycleMore #EcoFriendly
              </Form.Text>
            </Form.Group>
            {editingPost?.image && (
              <div className="mt-3">
                <p className="small text-muted mb-2">Current Media:</p>
                {editingPost.mediaType === 'video' ? (
                  <video src={editingPost.image} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '12px' }} />
                ) : (
                  <img src={editingPost.image} alt="Post media" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} />
                )}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => { setShowEditModal(false); setEditingPost(null); }}>Cancel</Button>
          <Button style={{ backgroundColor: '#EC744A', border: 'none' }} onClick={handleSubmitEdit} disabled={isUpdating || !editContent.trim()}>
            {isUpdating ? <><Spinner animation="border" size="sm" className="me-2" />Updating...</> : <><i className="bi bi-check-circle me-2"></i>Save Changes</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomePage;
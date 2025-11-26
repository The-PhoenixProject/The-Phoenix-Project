// profile.jsx - COMPLETELY FIXED VERSION
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Container, Col, Card, Button, Modal, Form, Badge, Spinner, Row, Tabs, Tab, ProgressBar, Alert
} from "react-bootstrap";
import Swal from "sweetalert2";
import { authAPI, productAPI, postAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Package, Leaf, Trophy, Flame, Star, TrendingUp, Edit, Trash2 } from "lucide-react";

const categories = ['Furniture', 'Electronics', 'Home Decor', 'Books & Media', 'Sporting Goods', 'Toys & Games', 'Crafts & DIY Materials', 'Jewelry', 'Miscellaneous'];
const conditions = ['New', 'Like New', 'Good', 'Fair', 'Used'];

const ECO_POINTS_CONFIG = {
  createPost: 10, purchaseProduct: 20, sellProduct: 30,
  completeMaintenance: 25, referFriend: 50, dailyLogin: 5, addProduct: 15
};

const LEVEL_CONFIG = [
  { name: "Eco Newbie", min: 0, max: 100, icon: "🌱", color: "#4CAF50" },
  { name: "Eco Enthusiast", min: 100, max: 500, icon: "🌿", color: "#2E7D32" },
  { name: "Eco Champion", min: 500, max: 1000, icon: "🌳", color: "#1B5E20" },
  { name: "Eco Legend", min: 1000, max: Infinity, icon: "🏆", color: "#FFD700" }
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const greenGradient = "#007D6E";
  const buttonColor = "#EC744A";
  const accentStyle = { backgroundColor: buttonColor, color: "white", border: "none", fontWeight: "600" };

  const styles = {
    card: { borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' },
    headerGradient: { background: `linear-gradient(135deg, ${greenGradient} 0%, #005a4d 100%)`, padding: '20px', textAlign: 'center' },
    avatar: { width: '120px', height: '120px', objectFit: 'cover', border: '4px solid white', backgroundColor: '#f0f0f0', boxShadow: '0 6px 18px rgba(0,0,0,0.12)' },
    smallRoundBtn: { borderRadius: '50%', width: '40px', height: '40px', padding: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
    productImage: { height: '200px', objectFit: 'cover', cursor: 'pointer' },
    actionCircle: { borderRadius: '50%', width: '35px', height: '35px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    modalHeader: { background: greenGradient, color: 'white' }
  };

  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [editShow, setEditShow] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addShow, setAddShow] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersType, setFollowersType] = useState("followers");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', category: '', condition: '', location: '', isEcoFriendly: false, images: [] });
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  
  // ✅ NEW: Post edit/delete states
  const [editingPost, setEditingPost] = useState(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("authToken");
  const PLACEHOLDER_IMAGE = "https://ui-avatars.com/api/?name=User&background=007D6E&color=fff&size=200";
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = useCallback((imagePath) => {
    if (!imagePath) return PLACEHOLDER_IMAGE;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `${API_BASE_URL}${imagePath}`;
    if (imagePath.startsWith('uploads/')) return `${API_BASE_URL}/${imagePath}`;
    return PLACEHOLDER_IMAGE;
  }, [API_BASE_URL]);

  // ✅ Refresh user data function
  const refreshUserData = useCallback(async () => {
    try {
      const userRes = await authAPI.getMe(token);
      // Normalize different possible response shapes from the API
      const u = (userRes && (userRes.data?.user || userRes.user || userRes.data || userRes)) || {};

      // Some backends use different keys for points; try multiple fallbacks
      const ecoPoints = u.ecoPoints ?? u.points ?? u.stats?.ecoPoints ?? u.stats?.points ?? 0;

      setUser({
        id: u.id || u._id || u.userId, name: u.fullName || u.full_name || u.name || "User", email: u.email || "",
        bio: u.bio || u.description || "Welcome to my eco-friendly profile! 🌿",
        image: getImageUrl(u.profilePicture || u.avatar || u.image), location: u.location || "Not specified",
        ecoPoints: Number(ecoPoints) || 0, level: u.level || u.rank || "Eco Newbie",
        streak: u.streak || 0, badges: u.badges || [],
        postsCount: u.postsCount || u.postCount || 0, followersCount: u.followersCount || u.followers?.length || 0,
        followingCount: u.followingCount || u.following?.length || 0, productsCount: u.productsCount || 0,
      });
      setFollowers(u.followers || []);
      setFollowing(u.following || []);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, [token, getImageUrl]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) { setError("Please login first."); setLoading(false); return; }
      setLoading(true);
      try {
        await refreshUserData();
        
        try { 
          const productsRes = await productAPI.getMyProducts("", token); 
          setProducts(productsRes.data?.products || []); 
        } catch (err) { 
          console.warn("Failed to load products:", err); 
        }
        
        try { 
          const postsRes = await postAPI.getMyPosts(token); 
          setPosts(postsRes.posts || []); 
        } catch (err) { 
          console.warn("Failed to load posts:", err); 
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile");
        if (err.message?.includes("401")) { 
          Swal.fire("Session Expired", "Please login again.", "warning"); 
          localStorage.removeItem("authToken"); 
          navigate("/login"); 
        }
      } finally { 
        setLoading(false); 
      }
    };
    fetchProfileData();
  }, [token, navigate, refreshUserData]);

  const getEcoProgress = () => {
    const currentLevel = LEVEL_CONFIG.find(l => user.ecoPoints >= l.min && user.ecoPoints < l.max) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    const idx = LEVEL_CONFIG.indexOf(currentLevel);
    const nextLevel = LEVEL_CONFIG[idx + 1];
    if (!nextLevel) return { progress: 100, currentLevel, nextLevel: null, pointsToNext: 0, pointsInLevel: user.ecoPoints - currentLevel.min };
    const pointsInLevel = user.ecoPoints - currentLevel.min;
    const totalForLevel = currentLevel.max - currentLevel.min;
    return { progress: Math.min((pointsInLevel / totalForLevel) * 100, 100), currentLevel, nextLevel, pointsToNext: currentLevel.max - user.ecoPoints, pointsInLevel };
  };

  const handleProductImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) { Swal.fire("Error", "Maximum 5 images allowed", "error"); return; }
    const newImages = [...newProduct.images, ...files];
    const newPreviews = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setNewProduct(prev => ({ ...prev, images: newImages }));
    setProductImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeProductImage = (index) => {
    URL.revokeObjectURL(productImagePreviews[index].preview);
    setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setProductImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetProductForm = () => {
    productImagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
    setNewProduct({ title: '', description: '', price: '', category: '', condition: '', location: user.location || '', isEcoFriendly: false, images: [] });
    setProductImagePreviews([]);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.category || !newProduct.condition) { 
      Swal.fire("Error", "Please fill in all required fields", "error"); 
      return; 
    }
    if (newProduct.images.length === 0) { 
      Swal.fire("Error", "Please add at least one image", "error"); 
      return; 
    }
    setAddingProduct(true);
    try {
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      formData.append('condition', newProduct.condition);
      formData.append('location', newProduct.location || user.location);
      formData.append('isEcoFriendly', newProduct.isEcoFriendly);
      newProduct.images.forEach(file => formData.append('images', file));
      
      await productAPI.createProduct(formData, token);
      const productsRes = await productAPI.getMyProducts("", token);
      setProducts(productsRes.data?.products || []);
      
      // ✅ Refresh user data to get updated points
      await refreshUserData();
      
      setShowAddProductModal(false);
      resetProductForm();
      
      Swal.fire({ 
        icon: "success", 
        title: "Product Added!", 
        html: `Your product is now listed.<br/><span style="color: ${greenGradient}">+${ECO_POINTS_CONFIG.addProduct} Eco Points! 🌿</span>`, 
        timer: 3000, 
        showConfirmButton: false 
      });
    } catch (error) { 
      Swal.fire("Error", error.message || "Failed to add product", "error"); 
    } finally { 
      setAddingProduct(false); 
    }
  };

  const saveEdit = async () => {
    if (!editForm.fullName?.trim()) { 
      Swal.fire("Error", "Name is required", "error"); 
      return; 
    }
    setIsEditingProfile(true);
    try {
      const response = await authAPI.updateProfile({ 
        fullName: editForm.fullName.trim(), 
        bio: editForm.bio?.trim() || "", 
        location: editForm.location?.trim() || "" 
      }, token);
      
      if (response.success) { 
        setUser(prev => ({ 
          ...prev, 
          name: editForm.fullName, 
          bio: editForm.bio, 
          location: editForm.location 
        })); 
        setEditShow(false); 
        Swal.fire({ 
          icon: "success", 
          title: "Profile Updated!", 
          timer: 2000, 
          showConfirmButton: false 
        }); 
      }
    } catch (err) { 
      Swal.fire("Error", err.message || "Failed to update profile", "error"); 
    } finally { 
      setIsEditingProfile(false); 
    }
  };

  const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { 
      Swal.fire("Error", "Please select an image file", "error"); 
      return; 
    }
    if (file.size > 5 * 1024 * 1024) { 
      Swal.fire("Error", "Image must be < 5MB", "error"); 
      return; 
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` }, 
        body: formData 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      setUser(prev => ({ ...prev, image: getImageUrl(data.url || data.path) }));
      setShowUploadModal(false);
      Swal.fire({ 
        icon: "success", 
        title: "Picture Updated!", 
        timer: 2000, 
        showConfirmButton: false 
      });
    } catch (err) { 
      Swal.fire("Error", err.message, "error"); 
    } finally { 
      setUploading(false); 
    }
  };

  const deleteProfileImage = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/me/avatar`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Failed to delete");
      setUser(prev => ({ ...prev, image: PLACEHOLDER_IMAGE }));
      setShowDeleteConfirm(false); 
      setShowUploadModal(false);
      Swal.fire("Deleted", "Profile picture removed", "success");
    } catch (err) { 
      Swal.fire("Error", err.message, "error"); 
    }
  };

  const addPost = async () => {
    if (!newPostText.trim() && !newPostFile) { 
      Swal.fire("Error", "Please add text or media", "error"); 
      return; 
    }
    const formData = new FormData();
    formData.append("content", newPostText);
    if (newPostFile) formData.append("media", newPostFile.file);
    
    try {
      const data = await postAPI.createPost(formData, token);
      setPosts(prev => [data.post, ...prev]);
      
      // ✅ Refresh user data to get updated points
      await refreshUserData();
      
      setAddShow(false); 
      setNewPostText(""); 
      setNewPostFile(null);
      
      Swal.fire({ 
        icon: "success", 
        title: "Post Created!", 
        html: `<span style="color: ${greenGradient}">+${ECO_POINTS_CONFIG.createPost} Eco Points! 🌿</span>`, 
        timer: 2000, 
        showConfirmButton: false 
      });
    } catch (err) { 
      Swal.fire("Error", err.message, "error"); 
    }
  };

  const handleFileChange = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      setNewPostFile({ 
        file, 
        url: URL.createObjectURL(file), 
        type: file.type.startsWith("video") ? "video" : "image" 
      }); 
    } 
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({ 
      title: 'Delete Product?', 
      text: "This cannot be undone!", 
      icon: 'warning', 
      showCancelButton: true, 
      confirmButtonColor: '#d33', 
      confirmButtonText: 'Delete' 
    });
    
    if (result.isConfirmed) {
      try { 
        await productAPI.deleteProduct(productId, token); 
        setProducts(prev => prev.filter(p => p._id !== productId)); 
        
        // ✅ Refresh user data
        await refreshUserData();
        
        Swal.fire('Deleted!', 'Product removed.', 'success'); 
      } catch (err) { 
        Swal.fire('Error', err.message, 'error'); 
      }
    }
  };

  const handleEditProduct = (product) => { 
    setEditProduct(product); 
    setShowEditModal(true); 
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const formData = new FormData();
      Object.entries(updatedProduct).forEach(([key, val]) => { 
        if (!['images', 'newImages', '_id'].includes(key) && val !== undefined) 
          formData.append(key, val); 
      });
      if (updatedProduct.newImages?.length > 0) 
        updatedProduct.newImages.forEach(file => formData.append('images', file));
      
      await productAPI.updateProduct(updatedProduct._id, formData, token);
      const productsRes = await productAPI.getMyProducts("", token);
      setProducts(productsRes.data?.products || []);
      setShowEditModal(false); 
      setEditProduct(null);
      Swal.fire('Success!', 'Product updated!', 'success');
    } catch (error) { 
      Swal.fire('Error', error.message, 'error'); 
    }
  };

  // ✅ NEW: Handle edit post
  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.content);
    setShowEditPostModal(true);
  };

 const handleSubmitPostEdit = async () => {
  if (!editPostContent.trim()) {
    Swal.fire("Error", "Post content cannot be empty", "error");
    return;
  }
  setIsUpdatingPost(true);
  try {
    await postAPI.updatePost(
      editingPost._id,  // ✅ FIXED: Changed _1d to _id
      { content: editPostContent },
      token
    );
    
    // Update posts list
    setPosts(prevPosts => prevPosts.map(post => {
      if (post._id === editingPost._id) {
        return { ...post, content: editPostContent };
      }
      return post;
    }));
    
    setShowEditPostModal(false);
    setEditingPost(null);
    setEditPostContent("");
    
    Swal.fire({
      icon: "success",
      title: "Post Updated!",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err) {
    console.error("Failed to update post:", err);
    Swal.fire("Error", err.message || "Failed to update post", "error");
  } finally {
    setIsUpdatingPost(false);
  }
};
  // ✅ NEW: Handle delete post
  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: 'Delete Post?',
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await postAPI.deletePost(postId, token);
        
        // Remove post from list
        setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        
        // ✅ Refresh user data to get updated points and count
        await refreshUserData();
        
        Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Failed to delete post", "error");
      }
    }
  };

  const formatPostTime = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
      <div className="text-center">
        <Spinner animation="border" style={{ color: buttonColor, width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading...</p>
      </div>
    </Container>
  );
  
  if (error && !user.name) return (
    <Container className="text-center py-5">
      <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "4rem" }}></i>
      <h4 className="mt-3">Unable to Load Profile</h4>
      <p className="text-danger">{error}</p>
      <Button href="/login" style={accentStyle}>Go to Login</Button>
    </Container>
  );

  const ecoProgress = getEcoProgress();

  return (
    <Container fluid className="p-0" style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Row className="g-0">
        <Col md={4} className="p-4">
          <Card className="shadow-sm border-0 mb-3" style={styles.card}>
            <div style={styles.headerGradient}>
              <div className="position-relative d-inline-block mb-3">
                <img src={user.image} alt="Profile" className="rounded-circle" style={styles.avatar} onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} />
                <Button size="sm" style={{ ...styles.smallRoundBtn, position: 'absolute', bottom: '0', right: '0', backgroundColor: buttonColor, border: '3px solid white' }} onClick={() => setShowUploadModal(true)}>
                  <i className="bi bi-camera-fill"></i>
                </Button>
              </div>
              <h5 className="mb-1 text-white">{user.name}</h5>
              <p className="text-white-50 small mb-2">{user.email}</p>
              <Badge bg="light" text="dark" className="mb-2 px-3 py-2">
                <span className="me-1">{ecoProgress.currentLevel.icon}</span>{user.level}
              </Badge>
            </div>
            <Card.Body>
              <p className="text-muted small mb-3">{user.bio}</p>
              <p className="text-muted small mb-3">
                <i className="bi bi-geo-alt-fill" style={{ color: greenGradient }}></i> {user.location}
              </p>
              <div className="d-flex justify-content-around my-3 py-3 border-top border-bottom">
                <div style={{ cursor: "pointer" }} onClick={() => setActiveTab("posts")}>
                  <h5 className="mb-0" style={{ color: greenGradient }}>{posts.length}</h5>
                  <p className="small text-muted mb-0">Posts</p>
                </div>
                <div style={{ cursor: "pointer" }} onClick={() => { setFollowersType("followers"); setShowFollowersModal(true); }}>
                  <h5 className="mb-0" style={{ color: greenGradient }}>{followers.length}</h5>
                  <p className="small text-muted mb-0">Followers</p>
                </div>
                <div style={{ cursor: "pointer" }} onClick={() => { setFollowersType("following"); setShowFollowersModal(true); }}>
                  <h5 className="mb-0" style={{ color: greenGradient }}>{following.length}</h5>
                  <p className="small text-muted mb-0">Following</p>
                </div>
              </div>
              <Button style={{...accentStyle, borderRadius: "12px"}} className="w-100 mb-2" onClick={() => { setEditForm({ fullName: user.name, bio: user.bio, location: user.location }); setEditShow(true); }}>
                <i className="bi bi-pencil-square me-2"></i>Edit Profile
              </Button>
            </Card.Body>
          </Card>

          {/* Enhanced Eco Progress Card */}
          <Card className="shadow-sm border-0 mb-3" style={styles.card}>
            <Card.Body>
              <h6 className="mb-3 d-flex align-items-center">
                <Trophy size={20} className="text-warning me-2" />Eco Progress
              </h6>
              <div className="text-center mb-3 p-3 rounded" style={{ backgroundColor: `${ecoProgress.currentLevel.color}15` }}>
                <div style={{ fontSize: '2.5rem' }}>{ecoProgress.currentLevel.icon}</div>
                <h5 className="mb-1" style={{ color: ecoProgress.currentLevel.color }}>{ecoProgress.currentLevel.name}</h5>
                <Badge bg="success" className="px-3 py-2">
                  <Star size={14} className="me-1" />{user.ecoPoints} Points
                </Badge>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">Progress to {ecoProgress.nextLevel?.name || "Max"}</span>
                  <span className="small fw-bold" style={{ color: greenGradient }}>{Math.round(ecoProgress.progress)}%</span>
                </div>
                <ProgressBar now={ecoProgress.progress} variant="success" style={{ height: "12px", borderRadius: "12px" }} animated />
                {ecoProgress.nextLevel && (
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">{user.ecoPoints ?? 0} pts</small>
                    <small className="text-muted">{ecoProgress.currentLevel.max} pts</small>
                  </div>
                )}
              </div>
              {ecoProgress.nextLevel ? (
                <Alert variant="info" className="mb-0 py-2" style={{ borderRadius: "12px", fontSize: "0.85rem" }}>
                  <TrendingUp size={16} className="me-2" />
                  <strong>{ecoProgress.pointsToNext}</strong> points to {ecoProgress.nextLevel.icon} {ecoProgress.nextLevel.name}
                </Alert>
              ) : (
                <Alert variant="success" className="mb-0 py-2" style={{ borderRadius: "12px" }}>
                  🎉 Max Level Reached!
                </Alert>
              )}
              <Alert variant="warning" className="mt-2 mb-0 py-2" style={{ borderRadius: "12px" }}>
                <Flame size={16} className="text-danger me-2" />
                <strong>{user.streak}</strong> Day Streak! 🔥
              </Alert>
              <div className="mt-3 p-2 bg-light rounded" style={{ fontSize: "0.8rem" }}>
                <p className="mb-1 fw-bold">Earn Points:</p>
                <div className="d-flex flex-wrap gap-1">
                  <Badge bg="secondary">Post +{ECO_POINTS_CONFIG.createPost}</Badge>
                  <Badge bg="secondary">Add Product +{ECO_POINTS_CONFIG.addProduct}</Badge>
                  <Badge bg="secondary">Sell +{ECO_POINTS_CONFIG.sellProduct}</Badge>
                  <Badge bg="secondary">Buy +{ECO_POINTS_CONFIG.purchaseProduct}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {user.badges?.length > 0 && (
            <Card className="shadow-sm border-0" style={styles.card}>
              <Card.Body>
                <h6 className="mb-3">
                  <i className="bi bi-award-fill me-2" style={{ color: greenGradient }}></i>
                  Badges ({user.badges.length})
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.badges.map((badge, idx) => (
                    <Badge key={idx} bg="primary" className="p-2" style={{ borderRadius: "8px" }}>
                      <i className="bi bi-award-fill me-1"></i>{badge.name}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={8} className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 style={{ color: greenGradient }}>
              <i className="bi bi-activity me-2"></i>My Activity
            </h4>
            <div className="d-flex gap-2">
              <Button style={{...accentStyle, borderRadius: "12px"}} onClick={() => setAddShow(true)}>
                <i className="bi bi-plus-circle me-2"></i>Create Post
              </Button>
              <Button variant="success" style={{ borderRadius: "12px" }} onClick={() => { resetProductForm(); setShowAddProductModal(true); }}>
                <Plus size={18} className="me-1" />Add Product
              </Button>
            </div>
          </div>

          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4" variant="pills">
            <Tab eventKey="posts" title={<span><i className="bi bi-file-post me-2"></i>Posts ({posts.length})</span>}>
              {posts.length === 0 ? (
                <Card className="text-center py-5 shadow-sm" style={styles.card}>
                  <Card.Body>
                    <i className="bi bi-file-earmark-text" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                    <h5 className="mt-3 text-muted">No posts yet</h5>
                    <Button style={accentStyle} onClick={() => setAddShow(true)}>
                      <i className="bi bi-plus-circle me-2"></i>Create First Post
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                posts.map(post => (
                  <Card key={post._id} className="mb-3 shadow-sm" style={styles.card}>
                    <Card.Body>
                      {/* ✅ Post Header with Edit/Delete buttons */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                        </div>
                        <div className="d-flex gap-2 ms-3">
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            style={{ borderRadius: '8px', padding: '4px 8px' }}
                            onClick={() => handleEditPost(post)}
                            title="Edit post"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger" 
                            style={{ borderRadius: '8px', padding: '4px 8px' }}
                            onClick={() => handleDeletePost(post._id)}
                            title="Delete post"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>

                      {post.media && (
                        <div className="mb-3">
                          {post.media.type === "video" ? (
                            <video 
                              src={post.media.url} 
                              controls 
                              className="w-100 rounded" 
                              style={{ maxHeight: "400px" }} 
                            />
                          ) : (
                            <img 
                              src={post.media.url} 
                              alt="post" 
                              className="w-100 rounded" 
                              style={{ maxHeight: "400px", objectFit: "cover" }} 
                            />
                          )}
                        </div>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="mb-3">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="badge bg-light text-success me-2 mb-1">
                              <i className="bi bi-hash"></i>{tag.replace('#', '')}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="d-flex justify-content-between text-muted small border-top pt-3">
                        <span>
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatPostTime(post.createdAt)}
                        </span>
                        <div>
                          <span className="me-3">
                            <i className="bi bi-heart-fill text-danger me-1"></i>
                            {post.likes?.length || 0}
                          </span>
                          <span>
                            <i className="bi bi-chat-fill text-primary me-1"></i>
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              )}
            </Tab>

            <Tab eventKey="products" title={<span><i className="bi bi-bag me-2"></i>Products ({products.length})</span>}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">{products.length} product{products.length !== 1 ? 's' : ''} listed</span>
                <Button variant="outline-success" size="sm" onClick={() => { resetProductForm(); setShowAddProductModal(true); }}>
                  <Plus size={16} className="me-1" />Add New
                </Button>
              </div>
              {products.length === 0 ? (
                <Card className="text-center py-5 shadow-sm" style={styles.card}>
                  <Card.Body>
                    <Package size={64} color="#ccc" />
                    <h5 className="mt-3 text-muted">No products listed</h5>
                    <p className="text-muted">Start selling eco-friendly products!</p>
                    <Button style={accentStyle} onClick={() => { resetProductForm(); setShowAddProductModal(true); }}>
                      <Plus size={18} className="me-1" />Add Product
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row>
                  {products.map(product => (
                    <Col md={4} key={product._id} className="mb-3">
                      <Card className="h-100 shadow-sm" style={styles.card}>
                        <div style={{ position: 'relative' }}>
                          <Card.Img 
                            variant="top" 
                            src={getImageUrl(product.images?.[0] || product.image)} 
                            style={styles.productImage} 
                            onClick={() => navigate(`/marketplace`)} 
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} 
                          />
                          {product.isEcoFriendly && (
                            <Badge bg="success" style={{ position: 'absolute', top: '10px', left: '10px' }}>
                              <Leaf size={12} /> Eco
                            </Badge>
                          )}
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                            <Button 
                              size="sm" 
                              style={{ ...styles.actionCircle, backgroundColor: greenGradient, border: 'none' }} 
                              onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                            >
                              <Pencil size={14} color="white" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="danger" 
                              style={styles.actionCircle} 
                              onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product._id); }}
                            >
                              <i className="bi bi-trash"></i>
                            </Button>
                          </div>
                        </div>
                        <Card.Body>
                          <Card.Title className="small text-truncate">{product.title}</Card.Title>
                          <Card.Text className="fw-bold" style={{ color: greenGradient }}>
                            ${product.price}
                          </Card.Text>
                          <div className="d-flex justify-content-between align-items-center">
                            <Badge bg={product.status === "sold" ? "danger" : "success"}>
                              {product.status || 'available'}
                            </Badge>
                            <small className="text-muted">{product.condition}</small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab>

            <Tab eventKey="about" title={<span><i className="bi bi-person-circle me-2"></i>About</span>}>
              <Card className="shadow-sm" style={{ borderRadius: "16px" }}>
                <Card.Body>
                  <h6 className="mb-4" style={{ color: greenGradient }}>
                    <i className="bi bi-info-circle-fill me-2"></i>Account Information
                  </h6>
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="text-muted small mb-1">Full Name</p>
                    <p className="mb-0 fw-bold">{user.name}</p>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="text-muted small mb-1">Email</p>
                    <p className="mb-0">{user.email}</p>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="text-muted small mb-1">Location</p>
                    <p className="mb-0">
                      <i className="bi bi-geo-alt-fill me-2" style={{ color: greenGradient }}></i>
                      {user.location}
                    </p>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="text-muted small mb-1">Bio</p>
                    <p className="mb-0">{user.bio}</p>
                  </div>
                  <div className="mb-3 pb-3 border-bottom">
                    <p className="text-muted small mb-1">Total Eco Points</p>
                    <p className="mb-0">
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      <strong>{user.ecoPoints}</strong> Points
                    </p>
                  </div>
                  <div>
                    <p className="text-muted small mb-1">Current Level</p>
                    <Badge bg="success" className="px-3 py-2">
                      {ecoProgress.currentLevel.icon} {user.level}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} centered>
        <Modal.Header closeButton style={{ ...styles.modalHeader, borderRadius: '0' }}>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Full Name *</Form.Label>
              <Form.Control 
                type="text" 
                value={editForm.fullName || ""} 
                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} 
                style={{ borderRadius: "8px" }} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Bio</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={editForm.bio || ""} 
                onChange={e => setEditForm({ ...editForm, bio: e.target.value })} 
                style={{ borderRadius: "8px" }} 
                maxLength={500} 
              />
              <Form.Text className="text-muted">{editForm.bio?.length || 0}/500</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control 
                type="text" 
                value={editForm.location || ""} 
                onChange={e => setEditForm({ ...editForm, location: e.target.value })} 
                style={{ borderRadius: "8px" }} 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setEditShow(false)}>Cancel</Button>
          <Button 
            style={accentStyle} 
            onClick={saveEdit} 
            disabled={isEditingProfile || !editForm.fullName?.trim()}
          >
            {isEditingProfile ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>Save
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ NEW: Edit Post Modal */}
      <Modal show={showEditPostModal} onHide={() => { setShowEditPostModal(false); setEditingPost(null); }} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <Edit size={20} className="me-2" />Edit Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group>
              <Form.Label className="fw-bold">Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                placeholder="What's on your mind?"
                style={{ borderRadius: "12px" }}
              />
            </Form.Group>
            {editingPost?.media && (
              <div className="mt-3">
                <p className="small text-muted mb-2">Current Media:</p>
                {editingPost.media.type === 'video' ? (
                  <video 
                    src={editingPost.media.url} 
                    controls 
                    style={{ width: '100%', maxHeight: '200px', borderRadius: '12px' }} 
                  />
                ) : (
                  <img 
                    src={editingPost.media.url} 
                    alt="Post media" 
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px' }} 
                  />
                )}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => { setShowEditPostModal(false); setEditingPost(null); }}>
            Cancel
          </Button>
          <Button 
            style={accentStyle} 
            onClick={handleSubmitPostEdit} 
            disabled={isUpdatingPost || !editPostContent.trim()}
          >
            {isUpdatingPost ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Upload Avatar Modal */}
      <Modal show={showUploadModal} onHide={() => { setShowUploadModal(false); setShowDeleteConfirm(false); }}>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <i className="bi bi-camera me-2"></i>Update Picture
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {uploading ? (
            <div className="text-center py-4">
              <Spinner animation="border" style={{ color: buttonColor }} />
              <p className="mt-3 fw-bold">Uploading...</p>
            </div>
          ) : (
            <>
              <Button 
                variant="outline-primary" 
                onClick={() => fileInputRef.current?.click()} 
                className="w-100 mb-3" 
                style={{ borderRadius: "12px", padding: "12px" }}
              >
                <i className="bi bi-images me-2"></i>Choose Image
              </Button>
              {user.image && user.image !== PLACEHOLDER_IMAGE && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => setShowDeleteConfirm(true)} 
                  className="w-100" 
                  style={{ borderRadius: "12px", padding: "12px" }}
                >
                  <i className="bi bi-trash me-2"></i>Delete Picture
                </Button>
              )}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleProfileImage} 
                style={{ display: "none" }} 
              />
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} size="sm" centered>
        <Modal.Body className="text-center py-4">
          <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: "3rem" }}></i>
          <h5 className="mt-3">Delete Picture?</h5>
          <div className="d-flex gap-2 justify-content-center mt-4">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={deleteProfileImage}>
              <i className="bi bi-trash me-2"></i>Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Create Post Modal */}
      <Modal show={addShow} onHide={() => setAddShow(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <i className="bi bi-plus-circle me-2"></i>Create Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">What's on your mind?</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={newPostText} 
                onChange={e => setNewPostText(e.target.value)} 
                placeholder="Share your eco-story..." 
                style={{ borderRadius: "12px" }} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Add Media</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleFileChange} 
                style={{ borderRadius: "12px" }} 
              />
              {newPostFile && (
                <div className="mt-3">
                  {newPostFile.type === "video" ? (
                    <video 
                      src={newPostFile.url} 
                      controls 
                      style={{ width: "100%", maxHeight: "300px", borderRadius: "12px" }} 
                    />
                  ) : (
                    <img 
                      src={newPostFile.url} 
                      alt="preview" 
                      style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "12px" }} 
                    />
                  )}
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => setNewPostFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </Form.Group>
          </Form>
          <Alert variant="info" className="mb-0">
            <Leaf size={16} className="me-2" />
            Earn <strong>+{ECO_POINTS_CONFIG.createPost} Eco Points</strong> for posting!
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setAddShow(false)}>Cancel</Button>
          <Button 
            style={accentStyle} 
            onClick={addPost} 
            disabled={!newPostText.trim() && !newPostFile}
          >
            <i className="bi bi-send-fill me-2"></i>Publish
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showAddProductModal} onHide={() => { setShowAddProductModal(false); resetProductForm(); }} size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <Package size={20} className="me-2" />Add New Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="success" className="mb-4">
            <Leaf size={16} className="me-2" />
            Earn <strong>+{ECO_POINTS_CONFIG.addProduct} Eco Points</strong> for listing a product!
          </Alert>
          <Form onSubmit={handleAddProduct}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control 
                type="text" 
                value={newProduct.title} 
                onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))} 
                placeholder="Product name" 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={newProduct.description} 
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))} 
                placeholder="Describe your product..." 
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($) *</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={newProduct.price} 
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select 
                    value={newProduct.category} 
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))} 
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition *</Form.Label>
                  <Form.Select 
                    value={newProduct.condition} 
                    onChange={(e) => setNewProduct(prev => ({ ...prev, condition: e.target.value }))} 
                    required
                  >
                    <option value="">Select condition</option>
                    {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newProduct.location} 
                    onChange={(e) => setNewProduct(prev => ({ ...prev, location: e.target.value }))} 
                    placeholder={user.location || "Product location"} 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label={<span><Leaf size={16} className="text-success me-1" /> This is an eco-friendly/upcycled product</span>} 
                checked={newProduct.isEcoFriendly} 
                onChange={(e) => setNewProduct(prev => ({ ...prev, isEcoFriendly: e.target.checked }))} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Product Images * (Max 5)</Form.Label>
              <Form.Control 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleProductImageSelect} 
              />
              <Form.Text className="text-muted">{newProduct.images.length}/5 images selected</Form.Text>
            </Form.Group>
            {productImagePreviews.length > 0 && (
              <div className="d-flex gap-2 flex-wrap mb-3">
                {productImagePreviews.map((img, idx) => (
                  <div key={idx} className="position-relative">
                    <img 
                      src={img.preview} 
                      alt={`Preview ${idx}`} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                    <Button 
                      variant="danger" 
                      size="sm" 
                      style={{ 
                        position: 'absolute', 
                        top: '-8px', 
                        right: '-8px', 
                        borderRadius: '50%', 
                        width: '22px', 
                        height: '22px', 
                        padding: 0, 
                        fontSize: '10px' 
                      }} 
                      onClick={() => removeProductImage(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => { setShowAddProductModal(false); resetProductForm(); }}>
            Cancel
          </Button>
          <Button style={accentStyle} onClick={handleAddProduct} disabled={addingProduct}>
            {addingProduct ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={18} className="me-1" />Add Product
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Followers Modal */}
      <Modal show={showFollowersModal} onHide={() => setShowFollowersModal(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <i className="bi bi-people-fill me-2"></i>
            {followersType === "followers" ? "Followers" : "Following"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
          {(followersType === "followers" ? followers : following).length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-people" style={{ fontSize: "3rem", color: "#ccc" }}></i>
              <p className="text-muted mt-3">No {followersType} yet</p>
            </div>
          ) : (
            (followersType === "followers" ? followers : following).map(u => (
              <div key={u._id} className="d-flex align-items-center justify-content-between mb-3 p-3 border rounded">
                <div className="d-flex align-items-center">
                  <img 
                    src={getImageUrl(u.profilePicture)} 
                    alt={u.fullName} 
                    className="rounded-circle me-3" 
                    style={{ width: "50px", height: "50px", objectFit: "cover" }} 
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} 
                  />
                  <div>
                    <h6 className="mb-0">{u.fullName}</h6>
                    <small className="text-muted">{u.email}</small>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={() => navigate(`/profile/${u._id}`)}
                >
                  View
                </Button>
              </div>
            ))
          )}
        </Modal.Body>
      </Modal>

      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <EditProductModal 
          product={editProduct} 
          onClose={() => { setShowEditModal(false); setEditProduct(null); }} 
          onSave={handleUpdateProduct} 
        />
      )}
    </Container>
  );

  function EditProductModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({ 
      title: product.title || '', 
      description: product.description || '', 
      price: product.price || '', 
      category: product.category || '', 
      condition: product.condition || '', 
      isEcoFriendly: product.isEcoFriendly || false, 
      location: product.location || '' 
    });
    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);
    
    const handleSubmit = async (e) => { 
      e.preventDefault(); 
      if (!formData.title || !formData.price || !formData.category || !formData.condition) { 
        Swal.fire('Error', 'Fill required fields', 'error'); 
        return; 
      } 
      setSaving(true); 
      try { 
        await onSave({ ...product, ...formData, newImages: newImages.map(img => img.file) }); 
      } finally { 
        setSaving(false); 
      } 
    };
    
    return (
      <Modal show={true} onHide={onClose} size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title>
            <Pencil size={20} className="me-2" />Edit Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title *</Form.Label>
              <Form.Control 
                type="text" 
                value={formData.title} 
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} 
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={formData.description} 
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={formData.price} 
                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))} 
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select 
                    value={formData.category} 
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} 
                    required
                  >
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition *</Form.Label>
                  <Form.Select 
                    value={formData.condition} 
                    onChange={(e) => setFormData(p => ({ ...p, condition: e.target.value }))} 
                    required
                  >
                    <option value="">Select</option>
                    {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Location</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={formData.location} 
                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox" 
                label="🌿 Eco-Friendly" 
                checked={formData.isEcoFriendly} 
                onChange={(e) => setFormData(p => ({ ...p, isEcoFriendly: e.target.checked }))} 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Add Images</Form.Label>
              <Form.Control 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => { 
                  const files = Array.from(e.target.files); 
                  setNewImages(prev => [...prev, ...files.map(f => ({ 
                    file: f, 
                    preview: URL.createObjectURL(f) 
                  }))]); 
                }} 
              />
            </Form.Group>
            {product.images?.length > 0 && (
              <div className="mb-3">
                <p className="small text-muted">Current:</p>
                <div className="d-flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={getImageUrl(img)} 
                      alt="" 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: '8px' 
                      }} 
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }} 
                    />
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button style={accentStyle} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

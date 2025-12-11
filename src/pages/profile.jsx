import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Container,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Spinner,
  Row,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { authAPI, productAPI, postAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Plus,
  Package,
  Leaf,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  Edit,
  Trash2,
  Camera,
  Image as ImageIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const categories = [
  "Furniture",
  "Electronics",
  "Home Decor",
  "Books & Media",
  "Sporting Goods",
  "Toys & Games",
  "Crafts & DIY Materials",
  "Jewelry",
  "Miscellaneous",
];
const conditions = ["New", "Like New", "Good", "Fair", "Used"];

const ECO_POINTS_CONFIG = {
  createPost: 10,
  purchaseProduct: 20,
  sellProduct: 30,
  completeMaintenance: 25,
  referFriend: 50,
  dailyLogin: 5,
  addProduct: 15,
};

const LEVEL_CONFIG = [
  { name: "Eco Newbie", min: 0, max: 100, icon: "🌱", color: "#4CAF50" },
  { name: "Eco Enthusiast", min: 100, max: 500, icon: "🌿", color: "#2E7D32" },
  { name: "Eco Champion", min: 500, max: 1000, icon: "🌳", color: "#1B5E20" },
  {
    name: "Eco Legend",
    min: 1000,
    max: Infinity,
    icon: "🏆",
    color: "#FFD700",
  },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { updateProfileImage } = useUser();

  const greenGradient = "#007D6E";
  const buttonColor = "#386641";

  // ✅ تحسين أنماط الأزرار لتصبح متسقة
  const buttonStyles = {
    borderRadius: "12px",
    padding: "10px 20px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s ease",
  };

  const accentStyle = {
    ...buttonStyles,
    backgroundColor: buttonColor,
    color: "white",
    border: "none",
  };

  // ✅ تحسين أنماط النوافذ المنبثقة
  const styles = {
    card: {
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
      marginBottom: "16px",
      border: "1px solid #e9ecef",
    },
    headerGradient: {
      background: `linear-gradient(135deg, ${greenGradient} 0%, #005a4d 100%)`,
      padding: "24px 20px",
      textAlign: "center",
    },
    avatar: {
      width: "120px",
      height: "120px",
      objectFit: "cover",
      border: "4px solid white",
      backgroundColor: "#f0f0f0",
      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
      marginBottom: "12px",
    },
    smallRoundBtn: {
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      padding: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    productImage: { 
      height: "200px", 
      objectFit: "cover", 
      cursor: "pointer",
      borderTopLeftRadius: "16px",
      borderTopRightRadius: "16px",
    },
    actionCircle: {
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginLeft: "6px",
    },
    modalHeader: {
      background: greenGradient,
      color: "white",
      padding: "20px 24px",
      borderBottom: "none",
      borderRadius: "16px 16px 0 0",
    },
    modalBody: {
      padding: "24px",
    },
    modalFooter: {
      padding: "20px 24px",
      borderTop: "1px solid #e9ecef",
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      borderRadius: "0 0 16px 16px",
    },
    // ✅ أنماط جديدة للنوافذ المنبثقة
    actionButton: {
      borderRadius: "10px",
      padding: "10px 20px",
      fontWeight: "600",
      fontSize: "14px",
      minWidth: "100px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
    deleteModal: {
      padding: "32px 24px",
      textAlign: "center",
    },
    followersItem: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      marginBottom: "8px",
      borderRadius: "12px",
      border: "1px solid #e9ecef",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "#f8f9fa",
      },
    },
  };

  const customStyles = {
    tabsContainer: {
      backgroundColor: "#f8f9fa",
      borderRadius: "12px",
      padding: "8px",
      marginBottom: "24px",
    },
    tabButton: {
      color: "#386641",
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      margin: "0 4px",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    activeTab: {
      color: "#fff",
      backgroundColor: "#386641",
      border: "none",
      borderRadius: "8px",
      padding: "10px 20px",
      margin: "0 4px",
      fontWeight: "600",
    },
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
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    isEcoFriendly: false,
    images: [],
  });
  const [productImagePreviews, setProductImagePreviews] = useState([]);

  // ✅ Post edit/delete states
  const [editingPost, setEditingPost] = useState(null);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);

  const fileInputRef = useRef(null);
  const token = localStorage.getItem("authToken");
  const PLACEHOLDER_IMAGE =
    "https://t3.ftcdn.net/jpg/11/61/33/36/360_F_1161333642_i694dqMuUwQEpEPdQOhuxdRC9WHPREFJ.jpg";
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const getImageUrl = useCallback(
    (imagePath) => {
      if (!imagePath) return PLACEHOLDER_IMAGE;
      if (imagePath.startsWith("http")) return imagePath;
      if (imagePath.startsWith("/uploads"))
        return `${API_BASE_URL}${imagePath}`;
      if (imagePath.startsWith("uploads/"))
        return `${API_BASE_URL}/${imagePath}`;
      return PLACEHOLDER_IMAGE;
    },
    [API_BASE_URL]
  );

  // ✅ Refresh user data function
  const refreshUserData = useCallback(async () => {
    try {
      const userRes = await authAPI.getMe(token);
      const u =
        (userRes &&
          (userRes.data?.user || userRes.user || userRes.data || userRes)) ||
        {};

      const ecoPoints =
        u.ecoPoints ?? u.points ?? u.stats?.ecoPoints ?? u.stats?.points ?? 0;
      const profileImageUrl = getImageUrl(
        u.profilePicture || u.avatar || u.image
      );

      setUser({
        id: u.id || u._id || u.userId,
        name: u.fullName || u.full_name || u.name || "User",
        email: u.email || "",
        bio: u.bio || u.description || "Welcome to my eco-friendly profile! 🌿",
        image: profileImageUrl,
        location: u.location || "Not specified",
        ecoPoints: Number(ecoPoints) || 0,
        level: u.level || u.rank || "Eco Newbie",
        streak: u.streak || 0,
        badges: u.badges || [],
        postsCount: u.postsCount || u.postCount || 0,
        followersCount: u.followersCount || u.followers?.length || 0,
        followingCount: u.followingCount || u.following?.length || 0,
        productsCount: u.productsCount || 0,
      });
      setFollowers(u.followers || []);
      setFollowing(u.following || []);
      updateProfileImage(profileImageUrl);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  }, [token, getImageUrl, updateProfileImage]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!token) {
        setError("Please login first.");
        setLoading(false);
        return;
      }

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
          setPosts(postsRes.data || postsRes.posts || []);
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
    const currentLevel =
      LEVEL_CONFIG.find(
        (l) => user.ecoPoints >= l.min && user.ecoPoints < l.max
      ) || LEVEL_CONFIG[LEVEL_CONFIG.length - 1];
    const idx = LEVEL_CONFIG.indexOf(currentLevel);
    const nextLevel = LEVEL_CONFIG[idx + 1];
    if (!nextLevel)
      return {
        progress: 100,
        currentLevel,
        nextLevel: null,
        pointsToNext: 0,
        pointsInLevel: user.ecoPoints - currentLevel.min,
      };
    const pointsInLevel = user.ecoPoints - currentLevel.min;
    const totalForLevel = currentLevel.max - currentLevel.min;
    return {
      progress: Math.min((pointsInLevel / totalForLevel) * 100, 100),
      currentLevel,
      nextLevel,
      pointsToNext: currentLevel.max - user.ecoPoints,
      pointsInLevel,
    };
  };

  const handleProductImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newProduct.images.length > 5) {
      Swal.fire("Error", "Maximum 5 images allowed", "error");
      return;
    }
    const newImages = [...newProduct.images, ...files];
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewProduct((prev) => ({ ...prev, images: newImages }));
    setProductImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeProductImage = (index) => {
    URL.revokeObjectURL(productImagePreviews[index].preview);
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setProductImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const resetProductForm = () => {
    productImagePreviews.forEach((img) => URL.revokeObjectURL(img.preview));
    setNewProduct({
      title: "",
      description: "",
      price: "",
      category: "",
      condition: "",
      location: user.location || "",
      isEcoFriendly: false,
      images: [],
    });
    setProductImagePreviews([]);
  };

  // ✅ ADD PRODUCT FUNCTION
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (
      !newProduct.title ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.condition
    ) {
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
      formData.append("title", newProduct.title);
      formData.append("description", newProduct.description);
      formData.append("price", newProduct.price);
      formData.append("category", newProduct.category);
      formData.append("condition", newProduct.condition);
      formData.append("location", newProduct.location || user.location);
      formData.append("isEcoFriendly", newProduct.isEcoFriendly);
      newProduct.images.forEach((file) => formData.append("images", file));

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
        showConfirmButton: false,
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
      const response = await authAPI.updateProfile(
        {
          fullName: editForm.fullName.trim(),
          bio: editForm.bio?.trim() || "",
          location: editForm.location?.trim() || "",
        },
        token
      );

      if (response.success) {
        setUser((prev) => ({
          ...prev,
          name: editForm.fullName,
          bio: editForm.bio,
          location: editForm.location,
        }));
        setEditShow(false);
        Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          timer: 2000,
          showConfirmButton: false,
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
    if (!file.type.startsWith("image/")) {
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
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      const newImageUrl = getImageUrl(data.url || data.path);
      setUser((prev) => ({ ...prev, image: newImageUrl }));
      updateProfileImage(newImageUrl);

      setShowUploadModal(false);
      Swal.fire({
        icon: "success",
        title: "Picture Updated!",
        timer: 2000,
        showConfirmButton: false,
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");

      setUser((prev) => ({ ...prev, image: PLACEHOLDER_IMAGE }));
      updateProfileImage(PLACEHOLDER_IMAGE);

      setShowDeleteConfirm(false);
      setShowUploadModal(false);
      Swal.fire("Deleted", "Profile picture removed", "success");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ✅ ADD POST FUNCTION
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
      setPosts((prev) => [data.post, ...prev]);

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
        showConfirmButton: false,
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
        type: file.type.startsWith("video") ? "video" : "image",
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await productAPI.deleteProduct(productId, token);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        await refreshUserData();
        Swal.fire("Deleted!", "Product removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
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
        if (!["images", "newImages", "_id"].includes(key) && val !== undefined)
          formData.append(key, val);
      });
      if (updatedProduct.newImages?.length > 0)
        updatedProduct.newImages.forEach((file) =>
          formData.append("images", file)
        );

      await productAPI.updateProduct(updatedProduct._id, formData, token);
      const productsRes = await productAPI.getMyProducts("", token);
      setProducts(productsRes.data?.products || []);
      setShowEditModal(false);
      setEditProduct(null);
      Swal.fire("Success!", "Product updated!", "success");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  // ✅ Handle edit post
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
        editingPost._id,
        { content: editPostContent },
        token
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === editingPost._id) {
            return { ...post, content: editPostContent };
          }
          return post;
        })
      );

      setShowEditPostModal(false);
      setEditingPost(null);
      setEditPostContent("");

      Swal.fire({
        icon: "success",
        title: "Post Updated!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to update post:", err);
      Swal.fire("Error", err.message || "Failed to update post", "error");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  // ✅ Handle delete post
  const handleDeletePost = async (postId) => {
    const result = await Swal.fire({
      title: "Delete Post?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await postAPI.deletePost(postId, token);
        setPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );
        await refreshUserData();
        Swal.fire("Deleted!", "Your post has been deleted.", "success");
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

  if (loading)
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "70vh", padding: "0" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            style={{ color: buttonColor, width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted" style={{ marginBottom: "0" }}>
            Loading...
          </p>
        </div>
      </Container>
    );

  if (error && !user.name)
    return (
      <Container className="text-center py-5" style={{ padding: "0" }}>
        <i
          className="bi bi-exclamation-triangle text-danger"
          style={{ fontSize: "4rem", marginBottom: "16px" }}
        ></i>
        <h4 className="mt-3" style={{ marginBottom: "12px" }}>
          Unable to Load Profile
        </h4>
        <p className="text-danger" style={{ marginBottom: "20px" }}>
          {error}
        </p>
        <Button href="/login" style={accentStyle}>
          Go to Login
        </Button>
      </Container>
    );

  const ecoProgress = getEcoProgress();

  return (
    <Container
      fluid
      className="p-0"
      style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
    >
      <Row className="g-0">
        <Col md={4} className="p-4">
          <Card className="shadow-sm border-0 mb-4" style={styles.card}>
            <div style={styles.headerGradient}>
              <div className="position-relative d-inline-block mb-3">
                <img
                  src={user.image}
                  alt="Profile"
                  className="rounded-circle"
                  style={styles.avatar}
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <Button
                  size="sm"
                  style={{
                    ...styles.smallRoundBtn,
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    backgroundColor: buttonColor,
                    border: "3px solid white",
                  }}
                  onClick={() => setShowUploadModal(true)}
                >
                  <Camera size={16} color="white" />
                </Button>
              </div>
              <h5 className="mb-1 text-white" style={{ marginBottom: "8px" }}>
                {user.name}
              </h5>
              <p
                className="text-white-50 small mb-2"
                style={{ marginBottom: "12px" }}
              >
                {user.email}
              </p>
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2">
                <span className="me-1">{ecoProgress.currentLevel.icon}</span>
                {user.level}
              </Badge>
            </div>
            <Card.Body style={{ padding: "20px" }}>
              <p
                className="text-muted small mb-3"
                style={{ marginBottom: "16px" }}
              >
                {user.bio}
              </p>
              <p
                className="text-muted small mb-4"
                style={{ marginBottom: "20px" }}
              >
                <i
                  className="bi bi-geo-alt-fill"
                  style={{ color: greenGradient, marginRight: "6px" }}
                ></i>
                {user.location}
              </p>
              <div
                className="d-flex justify-content-around my-3 py-3 border-top border-bottom"
                style={{ margin: "16px 0", padding: "16px 0" }}
              >
                <div
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => setActiveTab("posts")}
                >
                  <h5
                    className="mb-0"
                    style={{ color: greenGradient, marginBottom: "4px" }}
                  >
                    {posts.length}
                  </h5>
                  <p
                    className="small text-muted mb-0"
                    style={{ marginBottom: "0" }}
                  >
                    Posts
                  </p>
                </div>
                <div
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => {
                    setFollowersType("followers");
                    setShowFollowersModal(true);
                  }}
                >
                  <h5
                    className="mb-0"
                    style={{ color: greenGradient, marginBottom: "4px" }}
                  >
                    {followers.length}
                  </h5>
                  <p
                    className="small text-muted mb-0"
                    style={{ marginBottom: "0" }}
                  >
                    Followers
                  </p>
                </div>
                <div
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => {
                    setFollowersType("following");
                    setShowFollowersModal(true);
                  }}
                >
                  <h5
                    className="mb-0"
                    style={{ color: greenGradient, marginBottom: "4px" }}
                  >
                    {following.length}
                  </h5>
                  <p
                    className="small text-muted mb-0"
                    style={{ marginBottom: "0" }}
                  >
                    Following
                  </p>
                </div>
              </div>
              <Button
                style={{ ...accentStyle, width: "100%", marginTop: "12px" }}
                onClick={() => {
                  setEditForm({
                    fullName: user.name,
                    bio: user.bio,
                    location: user.location,
                  });
                  setEditShow(true);
                }}
              >
                <i className="bi bi-pencil-square me-2"></i>Edit Profile
              </Button>
            </Card.Body>
          </Card>

          {/* Enhanced Eco Progress Card */}
          <Card className="shadow-sm border-0 mb-4" style={styles.card}>
            <Card.Body style={{ padding: "20px" }}>
              <h6
                className="mb-3 d-flex align-items-center"
                style={{ marginBottom: "16px" }}
              >
                <Trophy size={20} className="text-warning me-2" />
                Eco Progress
              </h6>
              <div
                className="text-center mb-4 p-3 rounded"
                style={{
                  backgroundColor: `${ecoProgress.currentLevel.color}15`,
                  marginBottom: "20px",
                  padding: "16px",
                }}
              >
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
                  {ecoProgress.currentLevel.icon}
                </div>
                <h5
                  className="mb-1"
                  style={{
                    color: ecoProgress.currentLevel.color,
                    marginBottom: "8px",
                  }}
                >
                  {ecoProgress.currentLevel.name}
                </h5>
                <Badge bg="success" className="px-3 py-2">
                  <Star size={14} className="me-1" />
                  {user.ecoPoints} Points
                </Badge>
              </div>
              <div className="mb-4" style={{ marginBottom: "20px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted">
                    Progress to {ecoProgress.nextLevel?.name || "Max"}
                  </span>
                  <span
                    className="small fw-bold"
                    style={{ color: greenGradient }}
                  >
                    {Math.round(ecoProgress.progress)}%
                  </span>
                </div>
                <ProgressBar
                  now={ecoProgress.progress}
                  variant="success"
                  style={{
                    height: "12px",
                    borderRadius: "12px",
                    marginBottom: "8px",
                  }}
                  animated
                />
                {ecoProgress.nextLevel && (
                  <div className="d-flex justify-content-between mt-2">
                    <small className="text-muted">
                      {user.ecoPoints ?? 0} pts
                    </small>
                    <small className="text-muted">
                      {ecoProgress.currentLevel.max} pts
                    </small>
                  </div>
                )}
              </div>
              {ecoProgress.nextLevel ? (
                <Alert
                  variant="info"
                  className="mb-3 py-2"
                  style={{
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    marginBottom: "12px",
                    padding: "12px",
                  }}
                >
                  <TrendingUp size={16} className="me-2" />
                  <strong>{ecoProgress.pointsToNext}</strong> points to{" "}
                  {ecoProgress.nextLevel.icon} {ecoProgress.nextLevel.name}
                </Alert>
              ) : (
                <Alert
                  variant="success"
                  className="mb-3 py-2"
                  style={{
                    borderRadius: "12px",
                    marginBottom: "12px",
                    padding: "12px",
                  }}
                >
                  🎉 Max Level Reached!
                </Alert>
              )}
              <Alert
                variant="warning"
                className="mt-2 mb-3 py-2"
                style={{
                  borderRadius: "12px",
                  marginBottom: "12px",
                  padding: "12px",
                }}
              >
                <Flame size={16} className="text-danger me-2" />
                <strong>{user.streak}</strong> Day Streak! 🔥
              </Alert>
              <div
                className="mt-3 p-3 bg-light rounded"
                style={{
                  fontSize: "0.8rem",
                  marginTop: "12px",
                  padding: "12px",
                }}
              >
                <p className="mb-2 fw-bold" style={{ marginBottom: "8px" }}>
                  Earn Points:
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <Badge bg="secondary" style={{ margin: "2px" }}>
                    Post +{ECO_POINTS_CONFIG.createPost}
                  </Badge>
                  <Badge bg="secondary" style={{ margin: "2px" }}>
                    Add Product +{ECO_POINTS_CONFIG.addProduct}
                  </Badge>
                  <Badge bg="secondary" style={{ margin: "2px" }}>
                    Sell +{ECO_POINTS_CONFIG.sellProduct}
                  </Badge>
                  <Badge bg="secondary" style={{ margin: "2px" }}>
                    Buy +{ECO_POINTS_CONFIG.purchaseProduct}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>

          {user.badges?.length > 0 && (
            <Card className="shadow-sm border-0" style={styles.card}>
              <Card.Body style={{ padding: "20px" }}>
                <h6 className="mb-3" style={{ marginBottom: "16px" }}>
                  <i
                    className="bi bi-award-fill me-2"
                    style={{ color: greenGradient }}
                  ></i>
                  Badges ({user.badges.length})
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {user.badges.map((badge, idx) => (
                    <Badge
                      key={idx}
                      bg="primary"
                      className="p-2"
                      style={{ borderRadius: "8px", margin: "2px" }}
                    >
                      <i className="bi bi-award-fill me-1"></i>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={8} className="p-4">
          <div className="mb-4">
            <div
              className="d-flex justify-content-between align-items-center mb-4"
              style={{ marginBottom: "24px" }}
            >
              <h4 style={{ color: greenGradient, margin: "0" }}>
                <i className="bi bi-activity me-2"></i>My Activity
              </h4>

              <div className="d-flex gap-3">
                {/* زر Create Post - يظهر فقط في تبويب Posts */}
                {activeTab === "posts" && (
                  <Button
                    style={{ ...accentStyle }}
                    onClick={() => setAddShow(true)}
                  >
                    <i className="bi bi-plus-circle me-2"></i>Create Post
                  </Button>
                )}

                {/* زر Add Product - يظهر فقط في تبويب Products */}
                {activeTab === "products" && (
                  <Button
                    style={{ ...accentStyle }}
                    onClick={() => {
                      resetProductForm();
                      setShowAddProductModal(true);
                    }}
                  >
                    <Plus size={18} className="me-1" />
                    Add Product
                  </Button>
                )}
              </div>
            </div>

            {/* تبويبات مخصصة */}
            <div className="mb-4" style={customStyles.tabsContainer}>
              <div className="d-flex">
                <Button
                  variant="link"
                  style={
                    activeTab === "posts"
                      ? customStyles.activeTab
                      : customStyles.tabButton
                  }
                  onClick={() => setActiveTab("posts")}
                  onMouseEnter={(e) => {
                    if (activeTab !== "posts")
                      e.currentTarget.style.backgroundColor =
                        "rgba(56, 102, 65, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "posts")
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  className="me-2"
                >
                  <i className="bi bi-file-post me-2"></i>Posts ({posts.length})
                </Button>

                <Button
                  variant="link"
                  style={
                    activeTab === "products"
                      ? customStyles.activeTab
                      : customStyles.tabButton
                  }
                  onClick={() => setActiveTab("products")}
                  onMouseEnter={(e) => {
                    if (activeTab !== "products")
                      e.currentTarget.style.backgroundColor =
                        "rgba(56, 102, 65, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "products")
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  className="me-2"
                >
                  <i className="bi bi-bag me-2"></i>Products ({products.length})
                </Button>

                <Button
                  variant="link"
                  style={
                    activeTab === "about"
                      ? customStyles.activeTab
                      : customStyles.tabButton
                  }
                  onClick={() => setActiveTab("about")}
                  onMouseEnter={(e) => {
                    if (activeTab !== "about")
                      e.currentTarget.style.backgroundColor =
                        "rgba(56, 102, 65, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "about")
                      e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <i className="bi bi-person-circle me-2"></i>About
                </Button>
              </div>
            </div>
          </div>

          <div className="tab-content-wrapper">
            {/* محتوى التبويب Posts */}
            {activeTab === "posts" && (
              <div>
                {posts.length === 0 ? (
                  <Card
                    className="text-center py-5 shadow-sm"
                    style={styles.card}
                  >
                    <Card.Body style={{ padding: "40px 20px" }}>
                      <i
                        className="bi bi-file-earmark-text"
                        style={{
                          fontSize: "4rem",
                          color: "#ccc",
                          marginBottom: "16px",
                        }}
                      ></i>
                      <h5
                        className="mt-3 text-muted"
                        style={{ marginBottom: "8px" }}
                      >
                        No posts yet
                      </h5>
                      <p
                        className="text-muted mb-4"
                        style={{ marginBottom: "20px" }}
                      >
                        Share your eco-friendly journey with the community!
                      </p>
                      <Button
                        style={accentStyle}
                        onClick={() => setAddShow(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>Create First
                        Post
                      </Button>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row>
                    {posts.map((post) => (
                      <Col md={6} lg={6} key={post._id} className="mb-4">
                        <Card className="h-100 shadow-sm" style={styles.card}>
                          <Card.Body style={{ padding: "20px" }}>
                            {/* Post Header */}
                            <div
                              className="d-flex justify-content-between align-items-start mb-3"
                              style={{ marginBottom: "16px" }}
                            >
                              <div className="flex-grow-1">
                                <p
                                  className="mb-3"
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    fontSize: "15px",
                                    lineHeight: "1.5",
                                    marginBottom: "12px",
                                  }}
                                >
                                  {post.content}
                                </p>
                                <div className="d-flex align-items-center text-muted small">
                                  <i className="bi bi-calendar3 me-1"></i>
                                  <span>{formatPostTime(post.createdAt)}</span>
                                </div>
                              </div>
                              <div className="d-flex gap-2 ms-3">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    minWidth: "40px",
                                    height: "40px",
                                  }}
                                  onClick={() => handleEditPost(post)}
                                  title="Edit post"
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  style={{
                                    borderRadius: "8px",
                                    padding: "6px 10px",
                                    minWidth: "40px",
                                    height: "40px",
                                  }}
                                  onClick={() => handleDeletePost(post._id)}
                                  title="Delete post"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>

                            {post.media && (
                              <div
                                className="mb-4 rounded"
                                style={{
                                  overflow: "hidden",
                                  marginBottom: "16px",
                                }}
                              >
                                {post.media.type === "video" ? (
                                  <video
                                    src={post.media.url}
                                    controls
                                    className="w-100"
                                    style={{
                                      maxHeight: "300px",
                                      borderRadius: "8px",
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={post.media.url}
                                    alt="post"
                                    className="w-100"
                                    style={{
                                      maxHeight: "300px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                    }}
                                  />
                                )}
                              </div>
                            )}

                            {post.tags && post.tags.length > 0 && (
                              <div
                                className="mb-4"
                                style={{ marginBottom: "16px" }}
                              >
                                {post.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-light text-success me-2 mb-2"
                                    style={{
                                      marginRight: "6px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <i className="bi bi-hash"></i>
                                    {tag.replace("#", "")}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div
                              className="d-flex justify-content-between align-items-center text-muted small border-top pt-3"
                              style={{ paddingTop: "16px" }}
                            >
                              <div className="d-flex gap-3">
                                <span className="d-flex align-items-center">
                                  <i className="bi bi-heart-fill text-danger me-1"></i>
                                  {post.likes?.length || 0}
                                </span>
                                <span className="d-flex align-items-center">
                                  <i className="bi bi-chat-fill text-primary me-1"></i>
                                  {post.comments?.length || 0}
                                </span>
                              </div>
                              <Badge bg="light" text="dark">
                                <i className="bi bi-file-earmark-text me-1"></i>
                                Post
                              </Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )}

            {/* محتوى التبويب Products */}
            {activeTab === "products" && (
              <div>
                {products.length === 0 ? (
                  <Card
                    className="text-center py-5 shadow-sm"
                    style={styles.card}
                  >
                    <Card.Body style={{ padding: "40px 20px" }}>
                      <Package
                        size={64}
                        color="#ccc"
                        style={{ marginBottom: "16px" }}
                      />
                      <h5
                        className="mt-3 text-muted"
                        style={{ marginBottom: "8px" }}
                      >
                        No products listed
                      </h5>
                      <p className="text-muted" style={{ marginBottom: "0" }}>
                        Start selling eco-friendly products!
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row>
                    {products.map((product) => (
                      <Col md={4} key={product._id} className="mb-4">
                        <Card className="h-100 shadow-sm" style={styles.card}>
                          <div style={{ position: "relative" }}>
                            <Card.Img
                              variant="top"
                              src={getImageUrl(
                                product.images?.[0] || product.image
                              )}
                              style={styles.productImage}
                              onClick={() => navigate(`/marketplace`)}
                              onError={(e) => {
                                e.target.src = PLACEHOLDER_IMAGE;
                              }}
                            />
                            {product.isEcoFriendly && (
                              <Badge
                                bg="success"
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  left: "10px",
                                  padding: "6px 10px",
                                }}
                              >
                                <Leaf size={12} /> Eco
                              </Badge>
                            )}
                            <div
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                display: "flex",
                                gap: "6px",
                              }}
                            >
                              <Button
                                size="sm"
                                style={{
                                  ...styles.actionCircle,
                                  backgroundColor: greenGradient,
                                  border: "none",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProduct(product);
                                }}
                              >
                                <Pencil size={16} color="white" />
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                style={styles.actionCircle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProduct(product._id);
                                }}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                          <Card.Body style={{ padding: "16px" }}>
                            <Card.Title
                              className="small text-truncate"
                              style={{ marginBottom: "8px" }}
                            >
                              {product.title}
                            </Card.Title>
                            <Card.Text
                              className="fw-bold"
                              style={{
                                color: greenGradient,
                                marginBottom: "12px",
                              }}
                            >
                              ${product.price}
                            </Card.Text>
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge
                                bg={
                                  product.status === "sold"
                                    ? "danger"
                                    : "success"
                                }
                                style={{ padding: "6px 10px" }}
                              >
                                {product.status || "available"}
                              </Badge>
                              <small className="text-muted">
                                {product.condition}
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )}

            {/* محتوى التبويب About */}
            {activeTab === "about" && (
              <Card
                className="shadow-sm"
                style={{ borderRadius: "16px", marginBottom: "16px" }}
              >
                <Card.Body style={{ padding: "24px" }}>
                  <h6
                    className="mb-4"
                    style={{ color: greenGradient, marginBottom: "20px" }}
                  >
                    <i className="bi bi-info-circle-fill me-2"></i>Account
                    Information
                  </h6>
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ marginBottom: "20px", paddingBottom: "16px" }}
                  >
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Full Name
                    </p>
                    <p className="mb-0 fw-bold" style={{ marginBottom: "0" }}>
                      {user.name}
                    </p>
                  </div>
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ marginBottom: "20px", paddingBottom: "16px" }}
                  >
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Email
                    </p>
                    <p className="mb-0" style={{ marginBottom: "0" }}>
                      {user.email}
                    </p>
                  </div>
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ marginBottom: "20px", paddingBottom: "16px" }}
                  >
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Location
                    </p>
                    <p className="mb-0" style={{ marginBottom: "0" }}>
                      <i
                        className="bi bi-geo-alt-fill me-2"
                        style={{ color: greenGradient }}
                      ></i>
                      {user.location}
                    </p>
                  </div>
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ marginBottom: "20px", paddingBottom: "16px" }}
                  >
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Bio
                    </p>
                    <p className="mb-0" style={{ marginBottom: "0" }}>
                      {user.bio}
                    </p>
                  </div>
                  <div
                    className="mb-4 pb-3 border-bottom"
                    style={{ marginBottom: "20px", paddingBottom: "16px" }}
                  >
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Total Eco Points
                    </p>
                    <p className="mb-0" style={{ marginBottom: "0" }}>
                      <i className="bi bi-trophy-fill text-warning me-2"></i>
                      <strong>{user.ecoPoints}</strong> Points
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-muted small mb-2"
                      style={{ marginBottom: "6px" }}
                    >
                      Current Level
                    </p>
                    <Badge bg="success" className="px-3 py-2">
                      {ecoProgress.currentLevel.icon} {user.level}
                    </Badge>
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={editShow} onHide={() => setEditShow(false)} centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <i className="bi bi-pencil-square me-2"></i>Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={editForm.fullName || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
                style={{ borderRadius: "8px", padding: "10px 12px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Bio</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={editForm.bio || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                style={{ borderRadius: "8px", padding: "10px 12px" }}
                maxLength={500}
              />
              <Form.Text
                className="text-muted"
                style={{ marginTop: "6px", display: "block" }}
              >
                {editForm.bio?.length || 0}/500
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control
                type="text"
                value={editForm.location || ""}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                style={{ borderRadius: "8px", padding: "10px 12px" }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={() => setEditShow(false)}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Cancel
          </Button>
          <Button
            style={{ ...styles.actionButton, ...accentStyle }}
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

      {/* ✅ Edit Post Modal */}
      <Modal
        show={showEditPostModal}
        onHide={() => {
          setShowEditPostModal(false);
          setEditingPost(null);
        }}
        centered
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <Edit size={20} className="me-2" />
            Edit Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group>
              <Form.Label className="fw-bold">Post Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={editPostContent}
                onChange={(e) => setEditPostContent(e.target.value)}
                placeholder="What's on your mind?"
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </Form.Group>
            {editingPost?.media && (
              <div className="mt-3">
                <p className="small text-muted mb-2">Current Media:</p>
                {editingPost.media.type === "video" ? (
                  <video
                    src={editingPost.media.url}
                    controls
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <img
                    src={editingPost.media.url}
                    alt="Post media"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                )}
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={() => {
              setShowEditPostModal(false);
              setEditingPost(null);
            }}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Cancel
          </Button>
          <Button
            style={{ ...styles.actionButton, ...accentStyle }}
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
      <Modal
        show={showUploadModal}
        onHide={() => {
          setShowUploadModal(false);
          setShowDeleteConfirm(false);
        }}
        centered
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <Camera size={20} className="me-2" />
            Update Profile Picture
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          {uploading ? (
            <div className="text-center py-4">
              <Spinner
                animation="border"
                style={{ color: buttonColor, marginBottom: "16px" }}
              />
              <p className="mt-3 fw-bold" style={{ marginBottom: "0" }}>
                Uploading...
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  borderRadius: "12px",
                  padding: "12px",
                  height: "48px",
                }}
              >
                <ImageIcon size={20} />
                Choose Image
              </Button>
              {user.image && user.image !== PLACEHOLDER_IMAGE && (
                <Button
                  variant="outline-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="d-flex align-items-center justify-content-center gap-2"
                  style={{
                    borderRadius: "12px",
                    padding: "12px",
                    height: "48px",
                  }}
                >
                  <Trash2 size={20} />
                  Delete Picture
                </Button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleProfileImage}
                style={{ display: "none" }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={() => setShowUploadModal(false)}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirm Modal - محسنة بشكل كبير */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        centered
        dialogClassName="delete-confirm-modal"
      >
        <Modal.Body 
          className="p-0"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div 
            style={{
              padding: "40px 24px",
              textAlign: "center",
              backgroundColor: "white",
              maxWidth: "100%",
              width: "100%",
            }}
          >
            {/* أيقونة التحذير */}
            <div 
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                backgroundColor: "#fff2f2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                border: "3px solid #ffcccc"
              }}
            >
              <AlertCircle size={48} color="#dc3545" />
            </div>
            
            {/* العنوان الرئيسي */}
            <h4 
              className="fw-bold mb-3" 
              style={{ 
                color: "#343a40",
                fontSize: "1.5rem",
                lineHeight: "1.3"
              }}
            >
              Delete Profile Picture?
            </h4>
            
            {/* الرسالة التوضيحية */}
            <p 
              className="text-muted mb-4" 
              style={{ 
                fontSize: "1rem",
                lineHeight: "1.6",
                maxWidth: "400px",
                margin: "0 auto"
              }}
            >
              Are you sure you want to delete your profile picture? This action cannot be undone and your profile will revert to the default picture.
            </p>
            
            {/* زر الإجراءات */}
            <div 
              className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center"
              style={{ marginTop: "32px" }}
            >
              <Button
                variant="light"
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  borderRadius: "12px",
                  padding: "14px 28px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "2px solid #dee2e6",
                  color: "#495057",
                  minWidth: "140px",
                  width: "100%",
                  maxWidth: "200px"
                }}
                className="flex-grow-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={deleteProfileImage}
                style={{
                  borderRadius: "12px",
                  padding: "14px 28px",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "none",
                  minWidth: "140px",
                  width: "100%",
                  maxWidth: "200px",
                  backgroundColor: "#dc3545",
                  boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
                }}
                className="flex-grow-1"
              >
                <Trash2 size={20} className="me-2" />
                Delete
              </Button>
            </div>
            
            {/* رسالة إضافية صغيرة */}
            <p 
              className="text-muted small mt-4" 
              style={{ 
                fontSize: "0.875rem",
                opacity: 0.8
              }}
            >
              This will not affect your account information.
            </p>
          </div>
        </Modal.Body>
      </Modal>

      {/* Create Post Modal */}
      <Modal show={addShow} onHide={() => setAddShow(false)} centered size="lg">
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <i className="bi bi-plus-circle me-2"></i>Create Post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={styles.modalBody}>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">What's on your mind?</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share your eco-story..."
                style={{ borderRadius: "12px", padding: "12px" }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Add Media</Form.Label>
              <Form.Control
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                style={{ borderRadius: "12px", padding: "10px" }}
              />
              {newPostFile && (
                <div className="mt-3">
                  {newPostFile.type === "video" ? (
                    <video
                      src={newPostFile.url}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        borderRadius: "12px",
                        marginBottom: "12px",
                      }}
                    />
                  ) : (
                    <img
                      src={newPostFile.url}
                      alt="preview"
                      style={{
                        width: "100%",
                        maxHeight: "300px",
                        objectFit: "contain",
                        borderRadius: "12px",
                        marginBottom: "12px",
                      }}
                    />
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="mt-2 d-flex align-items-center gap-1"
                    onClick={() => setNewPostFile(null)}
                    style={{ padding: "8px 16px" }}
                  >
                    <X size={16} />
                    Remove
                  </Button>
                </div>
              )}
            </Form.Group>
          </Form>
          <Alert
            variant="info"
            className="mb-0"
            style={{ padding: "12px", borderRadius: "12px" }}
          >
            <Leaf size={16} className="me-2" />
            Earn <strong>+{ECO_POINTS_CONFIG.createPost} Eco Points</strong> for
            posting!
          </Alert>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={() => setAddShow(false)}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Cancel
          </Button>
          <Button
            style={{ ...styles.actionButton, ...accentStyle }}
            onClick={addPost}
            disabled={!newPostText.trim() && !newPostFile}
          >
            <i className="bi bi-send-fill me-2"></i>Publish
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal - محسن */}
      <Modal
        show={showAddProductModal}
        onHide={() => {
          setShowAddProductModal(false);
          resetProductForm();
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <Package size={20} className="me-2" />
            Add New Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ ...styles.modalBody, maxHeight: "70vh", overflowY: "auto" }}>
          <Alert
            variant="success"
            className="mb-4"
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
            }}
          >
            <Leaf size={16} className="me-2" />
            Earn <strong>+{ECO_POINTS_CONFIG.addProduct} Eco Points</strong> for
            listing a product!
          </Alert>
          <Form onSubmit={handleAddProduct}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newProduct.title}
                    onChange={(e) =>
                      setNewProduct((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Product name"
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Price ($) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your product..."
                style={{ borderRadius: "10px", padding: "12px" }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category *</Form.Label>
                  <Form.Select
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Condition *</Form.Label>
                  <Form.Select
                    value={newProduct.condition}
                    onChange={(e) =>
                      setNewProduct((prev) => ({
                        ...prev,
                        condition: e.target.value,
                      }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  >
                    <option value="">Select condition</option>
                    {conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control
                type="text"
                value={newProduct.location}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder={user.location || "Product location"}
                style={{ borderRadius: "10px", padding: "12px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={
                  <span className="fw-bold">
                    <Leaf size={16} className="text-success me-2" />
                    This is an eco-friendly/upcycled product
                  </span>
                }
                checked={newProduct.isEcoFriendly}
                onChange={(e) =>
                  setNewProduct((prev) => ({
                    ...prev,
                    isEcoFriendly: e.target.checked,
                  }))
                }
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Product Images * (Max 5)</Form.Label>
              <div className="d-flex flex-column gap-3">
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProductImageSelect}
                  style={{ borderRadius: "10px", padding: "10px" }}
                />
                <div className="d-flex justify-content-between align-items-center">
                  <Form.Text className="text-muted">
                    {newProduct.images.length}/5 images selected
                  </Form.Text>
                  {productImagePreviews.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        productImagePreviews.forEach(img => URL.revokeObjectURL(img.preview));
                        setNewProduct(prev => ({ ...prev, images: [] }));
                        setProductImagePreviews([]);
                      }}
                      className="text-danger p-0"
                    >
                      <Trash2 size={14} className="me-1" />
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            </Form.Group>

            {productImagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="small text-muted mb-2">Preview:</p>
                <div className="d-flex gap-3 flex-wrap">
                  {productImagePreviews.map((img, idx) => (
                    <div key={idx} className="position-relative">
                      <img
                        src={img.preview}
                        alt={`Preview ${idx + 1}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                        }}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          padding: 0,
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => removeProductImage(idx)}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={() => {
              setShowAddProductModal(false);
              resetProductForm();
            }}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Cancel
          </Button>
          <Button
            style={{ ...styles.actionButton, ...accentStyle }}
            onClick={handleAddProduct}
            disabled={addingProduct}
          >
            {addingProduct ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={18} className="me-2" />
                Add Product
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Followers Modal - محسن */}
      <Modal
        show={showFollowersModal}
        onHide={() => setShowFollowersModal(false)}
        centered
        size="md"
      >
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <i className="bi bi-people-fill me-2"></i>
            {followersType === "followers" ? "Followers" : "Following"}
            <Badge bg="light" text="dark" className="ms-2">
              {followersType === "followers" ? followers.length : following.length}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            padding: "16px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {(followersType === "followers" ? followers : following).length ===
          0 ? (
            <div className="text-center py-5">
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "#e9ecef",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <i className="bi bi-people" style={{ fontSize: "2rem", color: "#adb5bd" }}></i>
              </div>
              <h6 className="text-muted">No {followersType} yet</h6>
              <p className="text-muted small mt-2">
                {followersType === "followers" 
                  ? "You don't have any followers yet." 
                  : "You're not following anyone yet."}
              </p>
            </div>
          ) : (
            <div>
              {(followersType === "followers" ? followers : following).map((u) => (
                <div
                  key={u._id}
                  className="d-flex align-items-center justify-content-between p-3 mb-2 rounded"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e9ecef";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={getImageUrl(u.profilePicture)}
                      alt={u.fullName}
                      className="rounded-circle me-3"
                      style={{
                        width: "48px",
                        height: "48px",
                        objectFit: "cover",
                        border: "2px solid #dee2e6",
                      }}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <div>
                      <h6 className="mb-0 fw-bold" style={{ fontSize: "14px" }}>
                        {u.fullName}
                      </h6>
                      <small className="text-muted" style={{ fontSize: "12px" }}>
                        {u.email}
                      </small>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => navigate(`/profile/${u._id}`)}
                    style={{
                      borderRadius: "8px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      borderColor: buttonColor,
                      color: buttonColor,
                      minWidth: "100px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = buttonColor;
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = buttonColor;
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ ...styles.modalFooter, justifyContent: "center" }}>
          <Button
            variant="light"
            onClick={() => setShowFollowersModal(false)}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
              minWidth: "120px",
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Product Modal */}
      {showEditModal && editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => {
            setShowEditModal(false);
            setEditProduct(null);
          }}
          onSave={handleUpdateProduct}
        />
      )}
    </Container>
  );

  function EditProductModal({ product, onClose, onSave }) {
    const [formData, setFormData] = useState({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      category: product.category || "",
      condition: product.condition || "",
      isEcoFriendly: product.isEcoFriendly || false,
      location: product.location || "",
    });
    const [newImages, setNewImages] = useState([]);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (
        !formData.title ||
        !formData.price ||
        !formData.category ||
        !formData.condition
      ) {
        Swal.fire("Error", "Fill required fields", "error");
        return;
      }
      setSaving(true);
      try {
        await onSave({
          ...product,
          ...formData,
          newImages: newImages.map((img) => img.file),
        });
      } finally {
        setSaving(false);
      }
    };

    return (
      <Modal show={true} onHide={onClose} size="lg" centered>
        <Modal.Header closeButton style={styles.modalHeader}>
          <Modal.Title style={{ fontSize: "1.25rem" }}>
            <Pencil size={20} className="me-2" />
            Edit Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ ...styles.modalBody, maxHeight: "70vh", overflowY: "auto" }}>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Title *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, title: e.target.value }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, description: e.target.value }))
                }
                style={{ borderRadius: "10px", padding: "12px" }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Category *</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Condition *</Form.Label>
                  <Form.Select
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, condition: e.target.value }))
                    }
                    required
                    style={{ borderRadius: "10px", padding: "12px" }}
                  >
                    <option value="">Select</option>
                    {conditions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Location</Form.Label>
              <Form.Control
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, location: e.target.value }))
                }
                style={{ borderRadius: "10px", padding: "12px" }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label={
                  <span className="fw-bold">
                    <Leaf size={16} className="text-success me-2" />
                    Eco-Friendly Product
                  </span>
                }
                checked={formData.isEcoFriendly}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    isEcoFriendly: e.target.checked,
                  }))
                }
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Add More Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setNewImages((prev) => [
                    ...prev,
                    ...files.map((f) => ({
                      file: f,
                      preview: URL.createObjectURL(f),
                    })),
                  ]);
                }}
                style={{ borderRadius: "10px", padding: "10px" }}
              />
            </Form.Group>

            {product.images?.length > 0 && (
              <div className="mb-3">
                <p className="small text-muted mb-2">Current Images:</p>
                <div className="d-flex gap-2 flex-wrap">
                  {product.images.map((img, i) => (
                    <img
                      key={i}
                      src={getImageUrl(img)}
                      alt=""
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid #e9ecef",
                      }}
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer style={styles.modalFooter}>
          <Button
            variant="light"
            onClick={onClose}
            style={{
              ...styles.actionButton,
              backgroundColor: "#f8f9fa",
              color: "#495057",
              border: "1px solid #dee2e6",
            }}
          >
            Cancel
          </Button>
          <Button 
            style={{ ...styles.actionButton, ...accentStyle }} 
            onClick={handleSubmit} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Save Changes
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Row,
  ProgressBar,
  Alert,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { userAPI } from "../services/api"; // قمت بإزالة الواردات غير المستخدمة
import { useNavigate, useParams } from "react-router-dom";
import {
  Package,
  Leaf,
  Trophy,
  Flame,
  Star,
  TrendingUp,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { useUser } from "../context/UserContext";

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

export default function PublicProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useUser();

  const greenGradient = "#007D6E";
  const buttonColor = "#386641";

  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const buttonStyles = {
    borderRadius: "12px",
    padding: "10px 20px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "14px",
  };

  const accentStyle = {
    ...buttonStyles,
    backgroundColor: buttonColor,
    color: "white",
    border: "none",
  };

  const styles = {
    card: {
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    },
    headerGradient: {
      background: `linear-gradient(135deg, ${greenGradient} 0%, #005a4d 100%)`,
      padding: "20px",
      textAlign: "center",
    },
    avatar: {
      width: "120px",
      height: "120px",
      objectFit: "cover",
      border: "4px solid white",
      backgroundColor: "#f0f0f0",
      boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    },
    productImage: { height: "200px", objectFit: "cover", cursor: "pointer" },
  };

  const PLACEHOLDER_IMAGE =
    "https://t3.ftcdn.net/jpg/11/61/33/36/360_F_1161333642_i694dqMuUwQEpEPdQOhuxdRI9WHPREFJ.jpg";
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const token = localStorage.getItem("authToken");

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

  const fetchUserData = useCallback(async () => {
    if (!userId || !token) {
      setError("User not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user profile using userAPI
      const userRes = await userAPI.getUserProfile(userId, token);
      const u = userRes.data?.user || userRes.user || userRes.data || userRes;

      const ecoPoints =
        u.ecoPoints ?? u.points ?? u.stats?.ecoPoints ?? u.stats?.points ?? 0;
      const profileImageUrl = getImageUrl(
        u.profilePicture || u.avatar || u.image
      );

      const userData = {
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
      };

      setUser(userData);

      // Fetch user's posts using userAPI
      try {
        const postsRes = await userAPI.getUserPosts(userId, token);
        setPosts(postsRes.data || postsRes.posts || []);
      } catch (postErr) {
        console.warn("Failed to load user posts:", postErr);
        setPosts([]);
      }

      // Fetch user's products using userAPI
      try {
        const productsRes = await userAPI.getUserProducts(userId, token);
        setProducts(productsRes.data?.products || productsRes.data || []);
      } catch (productErr) {
        console.warn("Failed to load user products:", productErr);
        setProducts([]);
      }

      // Fetch followers/following
      try {
        const followersRes = await userAPI.getFollowers(userId, token);
        setFollowers(
          followersRes.data?.followers || followersRes.followers || []
        );

        const followingRes = await userAPI.getFollowing(userId, token);
        setFollowing(
          followingRes.data?.following || followingRes.following || []
        );
      } catch (followErr) {
        console.warn("Failed to load followers/following:", followErr);
      }

      // Check if current user is following this user
      if (currentUser?.id) {
        const isUserFollowing = u.followers?.some(
          (follower) =>
            follower._id === currentUser.id || follower.id === currentUser.id
        );
        setIsFollowing(isUserFollowing);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      setError(err.message || "Failed to load profile");
      if (err.message?.includes("401")) {
        Swal.fire("Session Expired", "Please login again.", "warning");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, token, navigate, getImageUrl, currentUser]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  const handleFollow = async () => {
    if (!currentUser?.id) {
      Swal.fire("Login Required", "Please login to follow users", "warning");
      navigate("/login");
      return;
    }

    if (currentUser.id === userId) {
      Swal.fire("Cannot Follow", "You cannot follow yourself", "info");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollowUser(userId, token);
        Swal.fire("Unfollowed", `You unfollowed ${user.name}`, "success");
        setIsFollowing(false);
        setFollowers((prev) =>
          prev.filter(
            (f) => f._id !== currentUser.id && f.id !== currentUser.id
          )
        );
      } else {
        await userAPI.followUser(userId, token);
        Swal.fire("Followed", `You are now following ${user.name}`, "success");
        setIsFollowing(true);
        setFollowers((prev) => [
          ...prev,
          {
            _id: currentUser.id,
            fullName: currentUser.name,
            email: currentUser.email,
            profilePicture: currentUser.image,
          },
        ]);
      }
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to follow/unfollow", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSendMessage = () => {
    navigate(`/messages?userId=${userId}`);
  };

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
        style={{ minHeight: "70vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            style={{ color: buttonColor, width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted">Loading Profile...</p>
        </div>
      </Container>
    );

  if (error || !user.id)
    return (
      <Container className="text-center py-5">
        <i
          className="bi bi-exclamation-triangle text-danger"
          style={{ fontSize: "4rem" }}
        ></i>
        <h4 className="mt-3">Profile Not Found</h4>
        <p className="text-danger">{error}</p>
        <Button href="/" style={accentStyle}>
          Go Home
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
          <Card className="shadow-sm border-0 mb-3" style={styles.card}>
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
              </div>
              <h5 className="mb-1 text-white">{user.name}</h5>
              <p className="text-white-50 small mb-2">{user.email}</p>
              <Badge bg="light" text="dark" className="mb-2 px-3 py-2">
                <span className="me-1">{ecoProgress.currentLevel.icon}</span>
                {user.level}
              </Badge>
            </div>
            <Card.Body>
              <p className="text-muted small mb-3">{user.bio}</p>
              <p className="text-muted small mb-3">
                <i
                  className="bi bi-geo-alt-fill"
                  style={{ color: greenGradient }}
                ></i>{" "}
                {user.location}
              </p>

              <div className="d-flex justify-content-around my-3 py-3 border-top border-bottom">
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("posts")}
                >
                  <h5 className="mb-0" style={{ color: greenGradient }}>
                    {posts.length}
                  </h5>
                  <p className="small text-muted mb-0">Posts</p>
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("followers")}
                >
                  <h5 className="mb-0" style={{ color: greenGradient }}>
                    {followers.length}
                  </h5>
                  <p className="small text-muted mb-0">Followers</p>
                </div>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setActiveTab("following")}
                >
                  <h5 className="mb-0" style={{ color: greenGradient }}>
                    {following.length}
                  </h5>
                  <p className="small text-muted mb-0">Following</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-2">
                <Button
                  style={{ ...accentStyle, flex: 1 }}
                  onClick={handleFollow}
                  disabled={followLoading || currentUser?.id === userId}
                >
                  {followLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : isFollowing ? (
                    <>
                      <i className="bi bi-person-dash me-2"></i>Unfollow
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>Follow
                    </>
                  )}
                </Button>

                <Button
                  variant="outline-primary"
                  style={{ ...buttonStyles, flex: 1 }}
                  onClick={handleSendMessage}
                  disabled={currentUser?.id === userId}
                >
                  <MessageSquare size={18} className="me-2" />
                  Message
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Eco Progress Card */}
          <Card className="shadow-sm border-0 mb-3" style={styles.card}>
            <Card.Body>
              <h6 className="mb-3 d-flex align-items-center">
                <Trophy size={20} className="text-warning me-2" />
                Eco Progress
              </h6>
              <div
                className="text-center mb-3 p-3 rounded"
                style={{
                  backgroundColor: `${ecoProgress.currentLevel.color}15`,
                }}
              >
                <div style={{ fontSize: "2.5rem" }}>
                  {ecoProgress.currentLevel.icon}
                </div>
                <h5
                  className="mb-1"
                  style={{ color: ecoProgress.currentLevel.color }}
                >
                  {ecoProgress.currentLevel.name}
                </h5>
                <Badge bg="success" className="px-3 py-2">
                  <Star size={14} className="me-1" />
                  {user.ecoPoints} Points
                </Badge>
              </div>
              <div className="mb-3">
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
                  style={{ height: "12px", borderRadius: "12px" }}
                  animated
                />
              </div>
              <Alert
                variant="warning"
                className="mt-2 mb-0 py-2"
                style={{ borderRadius: "12px" }}
              >
                <Flame size={16} className="text-danger me-2" />
                <strong>{user.streak}</strong> Day Streak! 🔥
              </Alert>
            </Card.Body>
          </Card>

          {/* Badges */}
          {user.badges?.length > 0 && (
            <Card className="shadow-sm border-0" style={styles.card}>
              <Card.Body>
                <h6 className="mb-3">
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
                      style={{ borderRadius: "8px" }}
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
            <h4 style={{ color: greenGradient, margin: 0 }}>
              <i className="bi bi-activity me-2"></i>
              {user.name}'s Activity
            </h4>

            {/* Tabs */}
            <div
              className="mb-4"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                padding: "8px",
              }}
            >
              <div className="d-flex">
                <Button
                  variant="link"
                  style={
                    activeTab === "posts"
                      ? {
                          color: "#fff",
                          backgroundColor: "#386641",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                      : {
                          color: "#386641",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                  }
                  onClick={() => setActiveTab("posts")}
                  className="me-2"
                >
                  <i className="bi bi-file-post me-2"></i>Posts
                </Button>

                <Button
                  variant="link"
                  style={
                    activeTab === "products"
                      ? {
                          color: "#fff",
                          backgroundColor: "#386641",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                      : {
                          color: "#386641",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                  }
                  onClick={() => setActiveTab("products")}
                  className="me-2"
                >
                  <i className="bi bi-bag me-2"></i>Products
                </Button>

                <Button
                  variant="link"
                  style={
                    activeTab === "followers"
                      ? {
                          color: "#fff",
                          backgroundColor: "#386641",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                      : {
                          color: "#386641",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                  }
                  onClick={() => setActiveTab("followers")}
                  className="me-2"
                >
                  <i className="bi bi-people me-2"></i>Followers
                </Button>

                <Button
                  variant="link"
                  style={
                    activeTab === "following"
                      ? {
                          color: "#fff",
                          backgroundColor: "#386641",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                      : {
                          color: "#386641",
                          backgroundColor: "transparent",
                          border: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          margin: "0 4px",
                          fontWeight: "600",
                        }
                  }
                  onClick={() => setActiveTab("following")}
                >
                  <i className="bi bi-person-plus me-2"></i>Following
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content-wrapper">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div>
                {posts.length === 0 ? (
                  <Card
                    className="text-center py-5 shadow-sm"
                    style={styles.card}
                  >
                    <Card.Body>
                      <i
                        className="bi bi-file-earmark-text"
                        style={{ fontSize: "4rem", color: "#ccc" }}
                      ></i>
                      <h5 className="mt-3 text-muted">No posts yet</h5>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row>
                    {posts.map((post) => (
                      <Col md={6} lg={6} key={post._id} className="mb-3">
                        <Card className="h-100 shadow-sm" style={styles.card}>
                          <Card.Body>
                            <p
                              className="mb-2"
                              style={{
                                whiteSpace: "pre-wrap",
                                fontSize: "15px",
                                lineHeight: "1.5",
                              }}
                            >
                              {post.content}
                            </p>

                            {post.media && (
                              <div
                                className="mb-3 rounded"
                                style={{ overflow: "hidden" }}
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

                            <div className="d-flex justify-content-between align-items-center text-muted small border-top pt-3">
                              <span>{formatPostTime(post.createdAt)}</span>
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
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                {products.length === 0 ? (
                  <Card
                    className="text-center py-5 shadow-sm"
                    style={styles.card}
                  >
                    <Card.Body>
                      <Package size={64} color="#ccc" />
                      <h5 className="mt-3 text-muted">No products listed</h5>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row>
                    {products.map((product) => (
                      <Col md={4} key={product._id} className="mb-3">
                        <Card className="h-100 shadow-sm" style={styles.card}>
                          <Card.Img
                            variant="top"
                            src={getImageUrl(
                              product.images?.[0] || product.image
                            )}
                            style={styles.productImage}
                            onClick={() => navigate(`/product/${product._id}`)}
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
                              }}
                            >
                              <Leaf size={12} /> Eco
                            </Badge>
                          )}
                          <Card.Body>
                            <Card.Title className="small text-truncate">
                              {product.title}
                            </Card.Title>
                            <Card.Text
                              className="fw-bold"
                              style={{ color: greenGradient }}
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

            {/* Followers Tab */}
            {activeTab === "followers" && (
              <Card className="shadow-sm" style={{ borderRadius: "16px" }}>
                <Card.Body>
                  <h6 className="mb-4" style={{ color: greenGradient }}>
                    <i className="bi bi-people-fill me-2"></i>Followers (
                    {followers.length})
                  </h6>
                  {followers.length === 0 ? (
                    <div className="text-center py-4">
                      <i
                        className="bi bi-people"
                        style={{ fontSize: "3rem", color: "#ccc" }}
                      ></i>
                      <p className="text-muted mt-3">No followers yet</p>
                    </div>
                  ) : (
                    followers.map((follower) => (
                      <div
                        key={follower._id}
                        className="d-flex align-items-center justify-content-between mb-3 p-3 border rounded"
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={getImageUrl(follower.profilePicture)}
                            alt={follower.fullName}
                            className="rounded-circle me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {follower.fullName || follower.name}
                            </h6>
                            <small className="text-muted">
                              {follower.email}
                            </small>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/profile/${follower._id || follower.id}`)
                          }
                        >
                          View Profile
                        </Button>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            )}

            {/* Following Tab */}
            {activeTab === "following" && (
              <Card className="shadow-sm" style={{ borderRadius: "16px" }}>
                <Card.Body>
                  <h6 className="mb-4" style={{ color: greenGradient }}>
                    <i className="bi bi-person-plus-fill me-2"></i>Following (
                    {following.length})
                  </h6>
                  {following.length === 0 ? (
                    <div className="text-center py-4">
                      <i
                        className="bi bi-person-plus"
                        style={{ fontSize: "3rem", color: "#ccc" }}
                      ></i>
                      <p className="text-muted mt-3">
                        Not following anyone yet
                      </p>
                    </div>
                  ) : (
                    following.map((followed) => (
                      <div
                        key={followed._id}
                        className="d-flex align-items-center justify-content-between mb-3 p-3 border rounded"
                      >
                        <div className="d-flex align-items-center">
                          <img
                            src={getImageUrl(followed.profilePicture)}
                            alt={followed.fullName}
                            className="rounded-circle me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <div>
                            <h6 className="mb-0">
                              {followed.fullName || followed.name}
                            </h6>
                            <small className="text-muted">
                              {followed.email}
                            </small>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() =>
                            navigate(`/profile/${followed._id || followed.id}`)
                          }
                        >
                          View Profile
                        </Button>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

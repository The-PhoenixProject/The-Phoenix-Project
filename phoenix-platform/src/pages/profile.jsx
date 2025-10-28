import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Swal from "sweetalert2";
import {
  Container,
  Col,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Row,
  ProgressBar,
} from "react-bootstrap";

export default function ProfilePhoenixComponent() {

  const greenGradient = " #007D6E";
  const buttonColor = "#EC744A";
  const lightGreen = "rgba(94, 180, 124, 0.1)";
  const followColor = "#4A90E2";
  const friendsColor = "#4A90E2";

  const accentStyle = {
    backgroundColor: buttonColor,
    color: "white",
    border: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const followStyle = {
    backgroundColor: followColor,
    color: "white",
    border: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const friendsStyle = {
    backgroundColor: friendsColor,
    color: "white",
    border: "none",
    fontWeight: "600",
    transition: "all 0.3s ease",
  };

  const hoverStyle = {
    ...accentStyle,
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(236, 116, 74, 0.3)",
  };

  const followHoverStyle = {
    ...followStyle,
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
  };

  const friendsHoverStyle = {
    ...friendsStyle,
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(236, 116, 74, 0.3)",
  };

  const outlineAccent = {
    border: "1px solid rgba(0,0,0,0.04)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  };

  // تحميل البيانات من localStorage 
  const loadUserData = () => {
    const savedUser = localStorage.getItem("phoenixUser");
    const savedPosts = localStorage.getItem("phoenixPosts");
    const savedProducts = localStorage.getItem("phoenixProducts");
    const savedPostsSaved = localStorage.getItem("phoenixSavedPosts");
    const savedFollowers = localStorage.getItem("phoenixFollowers");
    const savedFollowing = localStorage.getItem("phoenixFollowing");
    const savedFriends = localStorage.getItem("phoenixFriends");

    return {
      user: savedUser
        ? JSON.parse(savedUser)
        : {
            name: "Username", // تغيير من Sarah Johnson إلى Username
            email: "username@email.com",
            bio: "Creative designer passionate about UI/UX and digital art.",
            image: null,
          },
      posts: savedPosts ? JSON.parse(savedPosts) : [],
      products: savedProducts ? JSON.parse(savedProducts) : [],
      savedPosts: savedPostsSaved ? JSON.parse(savedPostsSaved) : [],
      followers: savedFollowers ? JSON.parse(savedFollowers) : [],
      following: savedFollowing ? JSON.parse(savedFollowing) : [],
      friends: savedFriends ? JSON.parse(savedFriends) : [],
    };
  };

  const [user, setUser] = useState(loadUserData().user);
  const [posts, setPosts] = useState(loadUserData().posts);
  const [products] = useState(loadUserData().products);
  const [savedPosts, setSavedPosts] = useState(loadUserData().savedPosts);
  const [followers, setFollowers] = useState(loadUserData().followers);
  const [following] = useState(loadUserData().following);
  const [friends, setFriends] = useState(loadUserData().friends);
  const [activeTab, setActiveTab] = useState("profile");

  const [editShow, setEditShow] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [addShow, setAddShow] = useState(false);
  const [newPostText, setNewPostText] = useState("");
  const [newPostFile, setNewPostFile] = useState(null);
  const [commentInput, setCommentInput] = useState({});
  const [editingComment, setEditingComment] = useState({
    postId: null,
    index: null,
    text: "",
  });
  const [buttonHover, setButtonHover] = useState({});
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // حفظ البيانات في localStorage 
  useEffect(() => {
    localStorage.setItem("phoenixUser", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem("phoenixPosts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("phoenixProducts", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("phoenixSavedPosts", JSON.stringify(savedPosts));
  }, [savedPosts]);

  useEffect(() => {
    localStorage.setItem("phoenixFollowers", JSON.stringify(followers));
  }, [followers]);

  useEffect(() => {
    localStorage.setItem("phoenixFollowing", JSON.stringify(following));
  }, [following]);

  useEffect(() => {
    localStorage.setItem("phoenixFriends", JSON.stringify(friends));
  }, [friends]);

  // تحديث صورة اليوزر في جميع المنشورات عند تغيير الصورة
  useEffect(() => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => ({
        ...post,
        authorImage: user.image,
      }))
    );
  }, [user.image]);

  // Check if user is following
  useEffect(() => {
    setIsFollowing(followers.length > 0);
  }, [followers]);

  // إظهار التنبيهات باستخدام SweetAlert
  const showAlert = (message, type = "success") => {
    Swal.fire({
      title:
        type === "success"
          ? "Success!"
          : type === "error"
          ? "Error!"
          : "Warning!",
      text: message,
      icon: type,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
    });
  };

  // Follow/Unfollow functionality
  const toggleFollow = () => {
    if (isFollowing) {
      setFollowers([]);
      showAlert("You have unfollowed this user");
    } else {
      setFollowers([
        { id: 1, name: "Current User", email: "user@example.com" },
      ]);
      showAlert("You are now following this user");
    }
    setIsFollowing(!isFollowing);
  };

  // Friends list functionality
  const openFriendsModal = () => {
    setShowFriendsModal(true);
  };

  const addFriend = (friendId) => {
    const newFriend = {
      id: friendId,
      name: `Friend ${friendId}`,
      email: `friend${friendId}@example.com`,
    };
    setFriends([...friends, newFriend]);
    showAlert("Friend added successfully!");
  };

  const removeFriend = (friendId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this friend?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove!",
    }).then((result) => {
      if (result.isConfirmed) {
        setFriends(friends.filter((friend) => friend.id !== friendId));
        showAlert("Friend removed successfully!");
      }
    });
  };

  // تشغيل الكاميرا
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      showAlert("Cannot access camera. Please check permissions.", "error");
      setCameraActive(false);
    }
  };

  // إيقاف الكاميرا
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // التقاط صورة من الكاميرا
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(
        (blob) => {
          const imgURL = URL.createObjectURL(blob);
          setUser({ ...user, image: imgURL });
          setUploading(true);

          // محاكاة عملية الرفع
          setTimeout(() => {
            setUploading(false);
            setCameraActive(false);
            setShowUploadModal(false);
            stopCamera();
            showAlert("Profile picture updated successfully from camera!");
          }, 1000);
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Handle image upload from file
  function handleProfileImage(e) {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      // محاكاة عملية الرفع
      setTimeout(() => {
        const imgURL = URL.createObjectURL(file);
        setUser({ ...user, image: imgURL });
        setUploading(false);
        setShowUploadModal(false);
        showAlert("Profile picture updated successfully!");
      }, 1500);
    }
  }

  // حذف الصورة الشخصية
  const deleteProfileImage = () => {
    setUser({ ...user, image: null });
    setShowDeleteConfirm(false);
    setShowUploadModal(false);
    showAlert("Profile picture deleted successfully!");
  };

  // فتح الكاميرا
  function openCamera() {
    startCamera();
  }

  // فتح معرض الصور
  function openGallery() {
    fileInputRef.current?.click();
  }

  // Edit profile handlers
  function openEdit() {
    setEditForm(user);
    setEditShow(true);
  }

  function saveEdit() {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showAlert("Please fill in all required fields", "error");
      return;
    }
    setUser({ ...user, ...editForm });
    setEditShow(false);
    showAlert("Profile updated successfully!");
  }

  // Add post handlers
  function handleFileChange(e) {
    const f = e.target.files[0];
    if (f) {
      const fileType = f.type.split("/")[0];
      if (fileType === "image" || fileType === "video") {
        setNewPostFile({
          file: f,
          url: URL.createObjectURL(f),
          type: fileType,
        });
      } else {
        showAlert("Please select an image or video file", "warning");
      }
    } else {
      setNewPostFile(null);
    }
  }

  function addPost() {
    if (!newPostText.trim() && !newPostFile) {
      showAlert("Please add some content to your post", "warning");
      return;
    }

    const next = {
      id: Date.now(),
      author: user.name,
      authorImage: user.image, // حفظ صورة المستخدم في المنشور
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toLocaleDateString(),
      text: newPostText,
      media: newPostFile
        ? {
            url: newPostFile.url,
            name: newPostFile.file.name,
            type: newPostFile.type,
          }
        : null,
      likes: 0,
      liked: false,
      comments: [],
    };
    setPosts([next, ...posts]);
    setNewPostText("");
    setNewPostFile(null);
    setAddShow(false);
    showAlert("Post published successfully!");
  }

  function deletePost(id) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPosts(posts.filter((p) => p.id !== id));
        showAlert("Post deleted successfully!");
      }
    });
  }

  // حفظ المنشور
  function savePost(post) {
    if (!savedPosts.find((p) => p.id === post.id)) {
      setSavedPosts([...savedPosts, post]);
      showAlert("Post saved successfully!");
    } else {
      showAlert("Post already saved!", "info");
    }
  }

  // إلغاء حفظ المنشور
  function unsavePost(id) {
    setSavedPosts(savedPosts.filter((p) => p.id !== id));
    showAlert("Post removed from saved!");
  }

  // Like toggle
  function toggleLike(id) {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  }

  // Comment logic
  function addComment(postId) {
    const text = (commentInput[postId] || "").trim();
    if (!text) {
      showAlert("Please write a comment", "warning");
      return;
    }
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, text] } : p
      )
    );
    setCommentInput({ ...commentInput, [postId]: "" });
    showAlert("Comment added successfully!");
  }

  function deleteComment(postId, index) {
    Swal.fire({
      title: "Delete Comment?",
      text: "Are you sure you want to delete this comment?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setPosts(
          posts.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((_, i) => i !== index) }
              : p
          )
        );
        showAlert("Comment deleted!");
      }
    });
  }

  function startEditComment(postId, index, text) {
    setEditingComment({ postId, index, text });
  }

  function saveEditedComment() {
    const { postId, index, text } = editingComment;
    if (!text.trim()) {
      showAlert("Comment cannot be empty", "warning");
      return;
    }
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments.map((c, i) => (i === index ? text : c)),
            }
          : p
      )
    );
    setEditingComment({ postId: null, index: null, text: "" });
    showAlert("Comment updated successfully!");
  }

  const postCount = posts.length;
  const productCount = products.length;
  const savedPostsCount = savedPosts.length;
  const followersCount = followers.length;
  const friendsCount = friends.length;
  const badgeVariant =
    postCount > 5 ? "success" : postCount > 0 ? "warning" : "secondary";

  // Get recent posts (first 4)
  const recentPosts = posts.slice(0, 4);

  // Get recent saved posts (first 4)
  const recentSavedPosts = savedPosts.slice(0, 4);

  // Products Page Component
  const ProductsPage = () => (
    <div>
      <div className="text-center mb-5">
        <i className="bi bi-cart display-1" style={{ color: "#007D6E" }}></i>
        <h3 className="mt-3" style={{ color: "#007D6E", fontWeight: "700" }}>
          My Products
        </h3>
        <p className="text-muted">Manage your products and start selling</p>
      </div>

      <Card
        className="text-center py-5"
        style={{ backgroundColor: lightGreen }}
      >
        <Card.Body>
          <i
            className="bi bi-cart-plus display-4"
            style={{ color: "#007D6E" }}
          ></i>
          <h5 className="mt-3" style={{ color: "#007D6E" }}>
            Products Feature Coming Soon
          </h5>
          <p className="text-muted">
            We're working on an amazing products feature for you!
          </p>
          <Button
            style={accentStyle}
            onClick={() => setActiveTab("profile")}
            className="px-4"
          >
            <i className="bi bi-arrow-left me-2"></i>Back to Profile
          </Button>
        </Card.Body>
      </Card>
    </div>
  );

  // Saved Posts Page Component
  const SavedPostsPage = () => (
    <div>
      <div className="text-center mb-5">
        <i
          className="bi bi-bookmark display-1"
          style={{ color: "#007D6E" }}
        ></i>
        <h3 className="mt-3" style={{ color: "#007D6E", fontWeight: "700" }}>
          Saved Posts
        </h3>
        <p className="text-muted">Your favorite posts all in one place</p>
      </div>

      {savedPosts.length > 0 ? (
        <div className="text-start">
          <h5 className="mb-3" style={{ color: "#007D6E", fontWeight: "600" }}>
            Saved Posts <Badge bg="success">{savedPostsCount}</Badge>
          </h5>
          {savedPosts.map((post) => (
            <Card
              key={post.id}
              className="mb-4"
              style={{ borderRadius: 12, ...outlineAccent }}
            >
              <Card.Body>
                <div className="d-flex align-items-start mb-3">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      {post.authorImage ? (
                        <div
                          className="rounded-circle me-3"
                          style={{
                            width: "45px",
                            height: "45px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={post.authorImage}
                            alt={post.author}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      ) : (
                        <i
                          className="bi bi-person-circle me-3"
                          style={{ fontSize: 45, color: "#007D6E" }}
                        ></i>
                      )}
                      <div>
                        <div style={{ fontWeight: 700, color: "#007D6E" }}>
                          {post.author}
                        </div>
                        <div className="small text-muted">
                          {post.date} at {post.time}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => unsavePost(post.id)}
                  >
                    <i className="bi bi-bookmark-x"></i>
                  </Button>
                </div>

                <div className="mb-3" style={{ lineHeight: "1.6" }}>
                  {post.text}
                </div>

                {post.media && (
                  <div className="mb-3">
                    {post.media.type === "video" ? (
                      <video
                        src={post.media.url}
                        controls
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          maxHeight: "400px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <img
                        src={post.media.url}
                        alt="media"
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          maxHeight: "400px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      ) : (
        <Card
          className="text-center py-5"
          style={{ backgroundColor: lightGreen }}
        >
          <Card.Body>
            <i
              className="bi bi-bookmark display-4"
              style={{ color: "#007D6E" }}
            ></i>
            <h5 className="mt-3" style={{ color: "#007D6E" }}>
              No Saved Posts Yet
            </h5>
            <p className="text-muted">Save posts you love to find them later</p>
            <Button
              style={accentStyle}
              onClick={() => setActiveTab("profile")}
              className="px-4"
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Profile
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  // Recent Posts Component
  const RecentPostsSection = () => (
    <div className="text-start">
      <h5 className="mb-3" style={{ color: "#007D6E", fontWeight: "600" }}>
        Recent Posts <Badge bg={badgeVariant}>{postCount}</Badge>
      </h5>
      {recentPosts.length > 0 ? (
        recentPosts.map((post) => (
          <Card
            key={post.id}
            className="mb-4"
            style={{ borderRadius: 12, ...outlineAccent }}
          >
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    {post.authorImage ? (
                      <div
                        className="rounded-circle me-3"
                        style={{
                          width: "45px",
                          height: "45px",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={post.authorImage}
                          alt={post.author}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ) : (
                      <i
                        className="bi bi-person-circle me-3"
                        style={{ fontSize: 45, color: "#007D6E" }}
                      ></i>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: "#007D6E" }}>
                        {post.author}
                      </div>
                      <div className="small text-muted">
                        {post.date} at {post.time}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => savePost(post)}
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="bi bi-bookmark"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => deletePost(post.id)}
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>

              <div className="mb-3" style={{ lineHeight: "1.6" }}>
                {post.text}
              </div>

              {post.media && (
                <div className="mb-3">
                  {post.media.type === "video" ? (
                    <video
                      src={post.media.url}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <img
                      src={post.media.url}
                      alt="media"
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <div className="d-flex gap-3 align-items-center">
                  <Button
                    variant={post.liked ? "danger" : "outline-danger"}
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    style={{ borderRadius: "20px" }}
                  >
                    <i
                      className={`bi bi-heart${post.liked ? "-fill" : ""} me-1`}
                    ></i>
                    {post.likes}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      setCommentInput({
                        ...commentInput,
                        [`show_${post.id}`]: !(
                          commentInput[`show_${post.id}`] || false
                        ),
                      })
                    }
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="bi bi-chat me-1"></i>
                    {post.comments.length}
                  </Button>
                </div>
              </div>

              {/* comments section */}
              {commentInput[`show_${post.id}`] && (
                <div className="mt-3">
                  <InputGroup className="mb-3">
                    <Form.Control
                      placeholder="Write a comment..."
                      value={commentInput[post.id] || ""}
                      onChange={(e) =>
                        setCommentInput({
                          ...commentInput,
                          [post.id]: e.target.value,
                        })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addComment(post.id);
                        }
                      }}
                      style={{ borderRadius: "20px 0 0 20px" }}
                    />
                    <Button
                      style={{
                        ...accentStyle,
                        borderRadius: "0 20px 20px 0",
                        border: "none",
                      }}
                      onClick={() => addComment(post.id)}
                    >
                      <i className="bi bi-send"></i>
                    </Button>
                  </InputGroup>

                  {post.comments.length > 0 && (
                    <div className="comments-section">
                      <h6 className="mb-2" style={{ color: "#007D6E" }}>
                        Comments ({post.comments.length})
                      </h6>
                      {post.comments.map((c, i) => (
                        <div
                          key={i}
                          className="small bg-light p-3 rounded mb-2 d-flex justify-content-between align-items-center"
                          style={{ borderRadius: "12px" }}
                        >
                          {editingComment.postId === post.id &&
                          editingComment.index === i ? (
                            <>
                              <Form.Control
                                value={editingComment.text}
                                onChange={(e) =>
                                  setEditingComment({
                                    ...editingComment,
                                    text: e.target.value,
                                  })
                                }
                                size="sm"
                                style={{ borderRadius: "8px" }}
                                autoFocus
                              />
                              <div className="ms-2">
                                <Button
                                  style={accentStyle}
                                  size="sm"
                                  onClick={saveEditedComment}
                                  className="me-1"
                                >
                                  <i className="bi bi-check"></i>
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    setEditingComment({
                                      postId: null,
                                      index: null,
                                      text: "",
                                    })
                                  }
                                >
                                  <i className="bi bi-x"></i>
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <span>{c}</span>
                              <div>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() =>
                                    startEditComment(post.id, i, c)
                                  }
                                  className="me-1"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => deleteComment(post.id, i)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card
          className="text-center py-4"
          style={{
            borderRadius: 12,
            ...outlineAccent,
            backgroundColor: lightGreen,
          }}
        >
          <Card.Body>
            <i
              className="bi bi-file-earmark-text display-4"
              style={{ color: "#007D6E" }}
            ></i>
            <h5 className="mt-3" style={{ color: "#007D6E" }}>
              No Posts Yet
            </h5>
            <p className="text-muted">
              Share your first post with the community
            </p>
            <Button
              style={accentStyle}
              onClick={() => setAddShow(true)}
              className="px-4"
            >
              <i className="bi bi-plus-lg me-2"></i>Create Your First Post
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  // Saved Posts Section Component
  const SavedPostsSection = () => (
    <div className="text-start">
      <h5 className="mb-3" style={{ color: "#007D6E", fontWeight: "600" }}>
        Saved Posts <Badge bg="success">{savedPostsCount}</Badge>
      </h5>
      {recentSavedPosts.length > 0 ? (
        recentSavedPosts.map((post) => (
          <Card
            key={post.id}
            className="mb-4"
            style={{ borderRadius: 12, ...outlineAccent }}
          >
            <Card.Body>
              <div className="d-flex align-items-start mb-3">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    {post.authorImage ? (
                      <div
                        className="rounded-circle me-3"
                        style={{
                          width: "45px",
                          height: "45px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={post.authorImage}
                          alt={post.author}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ) : (
                      <i
                        className="bi bi-person-circle me-3"
                        style={{ fontSize: 45, color: "#007D6E" }}
                      ></i>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, color: "#007D6E" }}>
                        {post.author}
                      </div>
                      <div className="small text-muted">
                        {post.date} at {post.time}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => unsavePost(post.id)}
                >
                  <i className="bi bi-bookmark-x"></i>
                </Button>
              </div>

              <div className="mb-3" style={{ lineHeight: "1.6" }}>
                {post.text}
              </div>

              {post.media && (
                <div className="mb-3">
                  {post.media.type === "video" ? (
                    <video
                      src={post.media.url}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <img
                      src={post.media.url}
                      alt="media"
                      style={{
                        width: "100%",
                        borderRadius: 12,
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                    />
                  )}
                </div>
              )}

              <div className="text-center">
                <Button
                  variant="outline-primary"
                  onClick={() => setActiveTab("saved")}
                  className="px-4"
                >
                  View All Saved Posts
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card
          className="text-center py-4"
          style={{
            borderRadius: 12,
            ...outlineAccent,
            backgroundColor: lightGreen,
          }}
        >
          <Card.Body>
            <i
              className="bi bi-bookmark display-4"
              style={{ color: "#007D6E" }}
            ></i>
            <h5 className="mt-3" style={{ color: "#007D6E" }}>
              No Saved Posts Yet
            </h5>
            <p className="text-muted">Save posts you love to find them later</p>
            <Button
              style={accentStyle}
              onClick={() => setActiveTab("profile")}
              className="px-4"
            >
              <i className="bi bi-arrow-left me-2"></i>Back to Profile
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );

  return (
    <Container className="py-5 d-flex justify-content-center">
      <Col md={12} lg={10}>
        {/* Navigation Tabs */}
        <Card
          className="mb-4"
          style={{ borderRadius: "16px", ...outlineAccent }}
        >
          {/* <Card.Body className="p-0">
            <Nav variant="pills" className="justify-content-center">
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "profile"}
                  onClick={() => setActiveTab("profile")}
                  style={activeTab === "profile" ? accentStyle : {}}
                  className="mx-2 rounded-pill"
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "products"}
                  onClick={() => setActiveTab("products")}
                  style={activeTab === "products" ? accentStyle : {}}
                  className="mx-2 rounded-pill"
                >
                  <i className="bi bi-cart me-2"></i>
                  Products
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={activeTab === "saved"}
                  onClick={() => setActiveTab("saved")}
                  style={activeTab === "saved" ? accentStyle : {}}
                  className="mx-2 rounded-pill"
                >
                  <i className="bi bi-bookmark me-2"></i>
                  Saved Posts
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body> */}
        </Card>

        {activeTab === "products" ? (
          <ProductsPage />
        ) : activeTab === "saved" ? (
          <SavedPostsPage />
        ) : (
          <>
            {/* Profile Card */}
            <Card
              style={{ borderRadius: 16, overflow: "hidden", ...outlineAccent }}
              className="mb-4"
            >
              <div
                style={{ height: 140, background: greenGradient }}
                className="d-flex justify-content-center align-items-end position-relative"
              >
                <div style={{ transform: "translateY(50%)" }}>
                  <div
                    className="rounded-circle bg-white d-flex justify-content-center align-items-center position-relative border border-4 border-white mb-5"
                    style={{ width: 120, height: 120, overflow: "hidden" }}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="bi bi-person-circle"
                        style={{ fontSize: 80, color: "rgba(0,0,0,0.55)" }}
                      ></i>
                    )}
                    {/*  الكاميرا   */}
                    <Button
                      size="sm"
                      style={{
                        ...accentStyle,
                        position: "absolute",
                        right: 15,
                        bottom: 10,
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(236, 116, 74, 0.3)",
                        border: "3px solid white",
                        zIndex: 10,
                      }}
                      onClick={() => setShowUploadModal(true)}
                    >
                      <i
                        className="bi bi-camera"
                        style={{ fontSize: "16px" }}
                      ></i>
                    </Button>
                  </div>
                </div>
              </div>

              <Card.Body
                className="pt-5"
                style={{ backgroundColor: lightGreen }}
              >
                {/* User Name - Centered under profile picture */}
                <div className="text-center mb-4">
                  <h4
                    style={{
                      fontWeight: 700,
                      color: "#007D6E",
                      margin: 0,
                      marginBottom: "20px",
                    }}
                  >
                    {user.name}
                  </h4>
                </div>

                {/* Follow and Friends Section - Centered with proper spacing */}
                <div className="d-flex justify-content-center align-items-center mb-4">
                  {/* Follow Section */}
                  <div className="d-flex flex-column align-items-center me-5">
                    <Button
                      style={
                        buttonHover.follow ? followHoverStyle : followStyle
                      }
                      onMouseEnter={() =>
                        setButtonHover({ ...buttonHover, follow: true })
                      }
                      onMouseLeave={() =>
                        setButtonHover({ ...buttonHover, follow: false })
                      }
                      onClick={toggleFollow}
                      className="px-3 mb-2"
                      size="sm"
                    >
                      <i
                        className={`bi bi-${
                          isFollowing ? "person-check" : "person-plus"
                        } me-1`}
                      ></i>
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <div className="d-flex flex-column align-items-center">
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: followColor,
                        }}
                      >
                        {followersCount}
                      </span>
                      <span className="small" style={{ color: followColor }}>
                        Followers
                      </span>
                    </div>
                  </div>

                  {/* Friends Section */}
                  <div className="d-flex flex-column align-items-center ms-5">
                    <Button
                      style={
                        buttonHover.friends ? friendsHoverStyle : friendsStyle
                      }
                      onMouseEnter={() =>
                        setButtonHover({ ...buttonHover, friends: true })
                      }
                      onMouseLeave={() =>
                        setButtonHover({ ...buttonHover, friends: false })
                      }
                      onClick={openFriendsModal}
                      className="px-3 mb-2"
                      size="sm"
                    >
                      <i className="bi bi-people me-1"></i>Friends
                    </Button>
                    <div className="d-flex flex-column align-items-center">
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: "700",
                          color: friendsColor,
                        }}
                      >
                        {friendsCount}
                      </span>
                      <span className="small" style={{ color: friendsColor }}>
                        Friends
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Info and Echo Points */}
                <div className="text-center mb-4">
                  <Badge
                    bg="warning"
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      borderRadius: "20px",
                      padding: "6px 12px",
                    }}
                  >
                    <i className="bi bi-lightning-charge me-1"></i>
                    150 Echo Points
                  </Badge>
                </div>

                <div className="text-center text-muted small mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  {user.email}
                </div>
                <p className="text-center mb-4" style={{ color: "#5a5a5a" }}>
                  {user.bio}
                </p>

                {/* Edit, Products, Saved Buttons - Centered */}
                <div className="d-flex justify-content-center gap-3 mb-4 flex-wrap">
                  <Button
                    style={buttonHover.edit ? hoverStyle : accentStyle}
                    onMouseEnter={() =>
                      setButtonHover({ ...buttonHover, edit: true })
                    }
                    onMouseLeave={() =>
                      setButtonHover({ ...buttonHover, edit: false })
                    }
                    onClick={openEdit}
                    className="px-4"
                  >
                    <i className="bi bi-pencil-square me-2"></i>Edit Profile
                  </Button>
                  <Button
                    style={buttonHover.product ? hoverStyle : accentStyle}
                    onMouseEnter={() =>
                      setButtonHover({ ...buttonHover, product: true })
                    }
                    onMouseLeave={() =>
                      setButtonHover({ ...buttonHover, product: false })
                    }
                    onClick={() => setActiveTab("products")}
                    className="px-4"
                  >
                    <i className="bi bi-cart me-2"></i>Products
                  </Button>
                  <Button
                    style={buttonHover.saved ? hoverStyle : accentStyle}
                    onMouseEnter={() =>
                      setButtonHover({ ...buttonHover, saved: true })
                    }
                    onMouseLeave={() =>
                      setButtonHover({ ...buttonHover, saved: false })
                    }
                    onClick={() => setActiveTab("saved")}
                    className="px-4"
                  >
                    <i className="bi bi-bookmark me-2"></i>Saved
                  </Button>
                </div>

                {/* Stats Section - Without Boxes */}
                <Row className="mb-4 text-center">
                  {/* Posts Counter */}
                  <Col>
                    <div className="p-3">
                      <h5
                        style={{
                          color: "#EC744A",
                          fontWeight: "700",
                          margin: 0,
                          fontSize: "1.8rem",
                        }}
                      >
                        {postCount}
                      </h5>
                      <div className="small" style={{ color: "#EC744A" }}>
                        Posts
                      </div>
                    </div>
                  </Col>

                  {/* Products Counter */}
                  <Col>
                    <div className="p-3">
                      <h5
                        style={{
                          color: "#EC744A",
                          fontWeight: "700",
                          margin: 0,
                          fontSize: "1.8rem",
                        }}
                      >
                        {productCount}
                      </h5>
                      <div className="small" style={{ color: "#EC744A" }}>
                        Products
                      </div>
                    </div>
                  </Col>

                  {/* Saved Counter */}
                  <Col>
                    <div className="p-3">
                      <h5
                        style={{
                          color: "#EC744A",
                          fontWeight: "700",
                          margin: 0,
                          fontSize: "1.8rem",
                        }}
                      >
                        {savedPostsCount}
                      </h5>
                      <div className="small" style={{ color: "#EC744A" }}>
                        Saved
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Two Columns Layout for Posts and Saved Posts */}
            <Row>
              {/* Recent Posts Column - Left */}
              <Col md={6} className="mb-4">
                <RecentPostsSection />
              </Col>

              {/* Saved Posts Column - Right */}
              <Col md={6} className="mb-4">
                <SavedPostsSection />
              </Col>
            </Row>
          </>
        )}

        {/* Edit Modal */}
        <Modal
          show={editShow}
          onHide={() => setEditShow(false)}
          centered
          size="lg"
        >
          <Modal.Header
            closeButton
            style={{ background: greenGradient, color: "white" }}
          >
            <Modal.Title>
              <i className="bi bi-pencil-square me-2"></i>
              Edit Profile
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Name</Form.Label>
                <Form.Control
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  placeholder="Tell us about yourself..."
                />
                <Form.Text className="text-muted">
                  Brief description for your profile.
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setEditShow(false)}
            >
              Cancel
            </Button>
            <Button style={accentStyle} onClick={saveEdit} className="px-4">
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Friends Modal */}
        <Modal
          show={showFriendsModal}
          onHide={() => setShowFriendsModal(false)}
          centered
          size="lg"
        >
          <Modal.Header
            closeButton
            style={{ background: greenGradient, color: "white" }}
          >
            <Modal.Title>
              <i className="bi bi-people me-2"></i>
              Friends List
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <div className="mb-4">
              <h5 style={{ color: "#007D6E" }}>Your Friends</h5>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <Card key={friend.id} className="mb-2">
                    <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontWeight: "600" }}>{friend.name}</div>
                        <div className="small text-muted">{friend.email}</div>
                      </div>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeFriend(friend.id)}
                      >
                        <i className="bi bi-person-dash"></i>
                      </Button>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-people display-4 text-muted"></i>
                  <p className="mt-2 text-muted">No friends yet</p>
                </div>
              )}
            </div>

            <div>
              <h5 style={{ color: "#007D6E" }}>Suggested Friends</h5>
              <Card>
                <Card.Body className="py-2 d-flex justify-content-between align-items-center">
                  <div>
                    <div style={{ fontWeight: "600" }}>Alex Johnson</div>
                    <div className="small text-muted">
                      alex.johnson@example.com
                    </div>
                  </div>
                  <Button
                    style={friendsStyle}
                    size="sm"
                    onClick={() => addFriend(Date.now())}
                  >
                    <i className="bi bi-person-plus"></i>
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowFriendsModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Upload Modal */}
        <Modal
          show={showUploadModal}
          onHide={() => {
            setShowUploadModal(false);
            stopCamera();
            setShowDeleteConfirm(false);
          }}
          centered
          size="lg"
        >
          <Modal.Header
            closeButton
            style={{ background: greenGradient, color: "white" }}
          >
            <Modal.Title>
              <i className="bi bi-camera me-2"></i>
              {showDeleteConfirm
                ? "Delete Profile Picture"
                : "Change Profile Picture"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {showDeleteConfirm ? (
              <div className="text-center">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle display-4 text-warning"></i>
                  <h4 className="mt-3">Delete Profile Picture?</h4>
                  <p className="text-muted">
                    Are you sure you want to delete your profile picture? This
                    action cannot be undone.
                  </p>
                </div>
                <div className="d-grid gap-2">
                  <Button
                    variant="danger"
                    onClick={deleteProfileImage}
                    size="lg"
                  >
                    <i className="bi bi-trash me-2"></i>Yes, Delete Picture
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Cancel
                  </Button>
                </div>
              </div>
            ) : uploading ? (
              <div className="text-center py-4">
                <Spinner animation="border" style={{ color: buttonColor }} />
                <div className="mt-3">Uploading your picture...</div>
                <ProgressBar
                  animated
                  now={100}
                  style={{ marginTop: "1rem", height: "6px" }}
                />
              </div>
            ) : cameraActive ? (
              <div className="text-center">
                <div className="camera-container mb-3">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      borderRadius: "12px",
                      backgroundColor: "#000",
                    }}
                  />
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
                <div className="d-grid gap-2">
                  <Button style={accentStyle} onClick={capturePhoto} size="lg">
                    <i className="bi bi-camera me-2"></i>Capture Photo
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => {
                      stopCamera();
                      setCameraActive(false);
                    }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Options
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle bg-light d-inline-flex justify-content-center align-items-center mb-3 position-relative"
                    style={{ width: 120, height: 120, overflow: "hidden" }}
                  >
                    {user.image ? (
                      <img
                        src={user.image}
                        alt="Current Profile"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <i
                        className="bi bi-person"
                        style={{ fontSize: 48, color: "#6c757d" }}
                      ></i>
                    )}
                  </div>
                  <h6>Current Profile Picture</h6>
                  {user.image && (
                    <p className="text-muted small">
                      You have a profile picture set
                    </p>
                  )}
                </div>

                <div className="d-grid gap-2 mb-4">
                  <Button
                    variant="outline-primary"
                    onClick={openCamera}
                    size="lg"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="bi bi-camera me-2"></i>Take Photo with Camera
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={openGallery}
                    size="lg"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="bi bi-images me-2"></i>Choose from Gallery
                  </Button>
                </div>

                {/* Delete Button - يظهر فقط إذا كانت هناك صورة حالية */}
                {user.image && (
                  <div className="border-top pt-3">
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      size="lg"
                      style={{ borderRadius: "10px", width: "100%" }}
                    >
                      <i className="bi bi-trash me-2"></i>Delete Current Picture
                    </Button>
                  </div>
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
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadModal(false);
                stopCamera();
                setShowDeleteConfirm(false);
              }}
              disabled={uploading}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Add Post Modal */}
        <Modal
          show={addShow}
          onHide={() => setAddShow(false)}
          centered
          size="lg"
        >
          <Modal.Header
            closeButton
            style={{ background: greenGradient, color: "white" }}
          >
            <Modal.Title>
              <i className="bi bi-plus-circle me-2"></i>
              Create New Post
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  What's on your mind?
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Share your thoughts..."
                  style={{ borderRadius: "12px" }}
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Add Media (Optional)
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ borderRadius: "12px" }}
                />
                {newPostFile && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">
                        {newPostFile.file.name}
                      </span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => setNewPostFile(null)}
                      >
                        <i className="bi bi-x"></i>
                      </Button>
                    </div>
                    {newPostFile.type === "video" ? (
                      <video
                        src={newPostFile.url}
                        controls
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          maxHeight: "300px",
                        }}
                      />
                    ) : (
                      <img
                        src={newPostFile.url}
                        alt="preview"
                        style={{
                          width: "100%",
                          borderRadius: "12px",
                          maxHeight: "300px",
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={() => setAddShow(false)}
            >
              Cancel
            </Button>
            <Button
              style={accentStyle}
              onClick={addPost}
              disabled={!newPostText.trim() && !newPostFile}
              className="px-4"
            >
              <i className="bi bi-send me-2"></i>Publish Post
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Container>
  );
}

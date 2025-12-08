// CreatePost.jsx - FIXED WITH HASHTAG EXTRACTION
import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import "../../../styles/Home/CreatePost.css";

const CreatePost = ({ currentUser, onCreatePost, isCreating }) => {
  const [postContent, setPostContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("other");
  
  const fileInputRef = useRef(null);

  const PLACEHOLDER_AVATAR = "https://t3.ftcdn.net/jpg/11/61/33/36/360_F_1161333642_i694dqMuUwQEpEPdQOhuxdRC9WHPREFJ.jpg";

  const categories = [
    { value: "recycling", label: "♻️ Recycling", icon: "bi-recycle" },
    { value: "upcycling", label: "🔄 Upcycling", icon: "bi-arrow-repeat" },
    { value: "story", label: "📖 Story", icon: "bi-book" },
    { value: "tip", label: "💡 Tip", icon: "bi-lightbulb" },
    { value: "other", label: "📌 Other", icon: "bi-bookmark" }
  ];

  // ✅ Extract hashtags from text
  const extractHashtags = (text) => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? [...new Set(matches)] : []; // Remove duplicates
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!postContent.trim() && !selectedMedia) {
      Swal.fire("Error", "Please add text or media to your post", "error");
      return;
    }

    // ✅ Extract hashtags from post content
    const extractedTags = extractHashtags(postContent);

    const postData = {
      content: postContent,
      media: selectedMedia,
      tags: extractedTags, // Use extracted hashtags
      category: selectedCategory
    };

    onCreatePost(postData);

    // Reset form
    handleCancel();
  };

  const handleCancel = () => {
    setPostContent("");
    setIsExpanded(false);
    setSelectedMedia(null);
    setMediaPreview(null);
    setSelectedCategory("other");
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Error", "Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire("Error", "File size must be less than 10MB", "error");
      return;
    }

    setSelectedMedia(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview({
        url: reader.result,
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Get detected hashtags for display
  const detectedHashtags = extractHashtags(postContent);

  return (
    <div className="card create-post-card mb-4 border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex gap-3">
          <div className="user-avatar-create">
            <img
              src={currentUser?.avatar || PLACEHOLDER_AVATAR}
              alt="User Avatar"
              className="rounded-circle"
              width="48"
              height="48"
              onError={(e) => {
                e.target.src = PLACEHOLDER_AVATAR;
              }}
            />
          </div>

          <div className="flex-grow-1">
            <form onSubmit={handleSubmit}>
              <textarea
                className="form-control create-post-input border-0 ps-0"
                placeholder="Share your eco-story... 🌿 (Use #hashtags to tag your post)"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 4 : 1}
                disabled={isCreating}
                style={{ resize: 'none' }}
              />

              {/* ✅ Display detected hashtags */}
              {detectedHashtags.length > 0 && (
                <div className="mt-2 mb-2">
                  <small className="text-muted">Detected hashtags:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {detectedHashtags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="badge bg-success"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {mediaPreview && (
                <div className="media-preview mt-3 position-relative">
                  {mediaPreview.type === 'video' ? (
                    <video 
                      src={mediaPreview.url} 
                      controls 
                      className="w-100 rounded"
                      style={{ maxHeight: "300px" }}
                    />
                  ) : (
                    <img 
                      src={mediaPreview.url} 
                      alt="Preview" 
                      className="w-100 rounded"
                      style={{ maxHeight: "300px", objectFit: "cover" }}
                    />
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                    onClick={handleRemoveMedia}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <small className="text-muted d-block mt-2">
                    <i className="bi bi-file-earmark"></i> {mediaPreview.name}
                  </small>
                </div>
              )}

              {isExpanded && (
                <>
                  <div className="mt-3">
                    <label className="form-label small text-muted">Category</label>
                    <div className="d-flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          className={`btn btn-sm ${selectedCategory === cat.value ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setSelectedCategory(cat.value)}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="form-label small text-muted">
                      💡 Tip: Type # followed by keywords to add hashtags
                    </label>
                    <p className="small text-muted mb-0">
                      Examples: #RecycleMore #EcoFriendly #SustainableLiving #ZeroWaste
                    </p>
                  </div>

                  <div className="mt-3 d-flex gap-2 justify-content-between align-items-center">
                    <div className="post-action-buttons">
                      <button 
                        type="button" 
                        className="btn btn-light btn-sm me-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isCreating}
                      >
                        <i className="bi bi-image text-success"></i> Photo/Video
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        style={{ display: "none" }}
                        onChange={handleMediaSelect}
                      />
                    </div>
                    
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-light btn-sm"
                        onClick={handleCancel}
                        disabled={isCreating}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn orangebtn btn-sm"
                        disabled={(!postContent.trim() && !selectedMedia) || isCreating}
                      >
                        {isCreating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Posting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-1"></i>
                            Post
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
// PostCard.jsx - FIXED VERSION WITH WORKING LIKE/COMMENT/SAVE
import React, { useState } from "react";
import { postAPI, userAPI } from "../../../services/api";
import Swal from "sweetalert2";
import "../../../styles/Home/PostCard.css";

const PostCard = ({ post, onLikeToggle, onComment, onShare, onDelete, onEdit, currentUser, isOwner = false }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [shareCount, setShareCount] = useState(post.shares || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("authToken");
  const PLACEHOLDER_AVATAR = "https://ui-avatars.com/api/?name=User&background=007D6E&color=fff&size=100";
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = (url) => {
    if (!url) return PLACEHOLDER_AVATAR;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads')) return `${API_BASE_URL}${url}`;
    if (url.startsWith('uploads/')) return `${API_BASE_URL}/${url}`;
    return url;
  };

  // ✅ FIXED: Like handler with API call
  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      const response = await postAPI.likePost(post.id, token);
      if (response.data !== undefined) {
        setLikeCount(response.data);
      }
      if (onLikeToggle) onLikeToggle(post.id, newLikedState);
    } catch (err) {
      setIsLiked(!newLikedState);
      setLikeCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error("Like error:", err);
      Swal.fire("Error", "Failed to like post", "error");
    } finally {
      setIsLiking(false);
    }
  };

  // ✅ FIXED: Comment handler with API call
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const response = await postAPI.commentPost(post.id, { content: commentText }, token);
      
      if (response.data) {
        setComments(response.data);
      } else {
        const newComment = {
          _id: Date.now().toString(),
          user: {
            _id: currentUser?.id,
            fullName: currentUser?.name || "User",
            profilePicture: currentUser?.avatar
          },
          content: commentText,
          createdAt: new Date().toISOString()
        };
        setComments(prev => [...prev, newComment]);
      }
      
      setCommentText("");
      if (onComment) onComment(post.id, commentText);
      
      Swal.fire({
        icon: "success",
        title: "Comment Added!",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Comment error:", err);
      Swal.fire("Error", "Failed to add comment", "error");
    } finally {
      setIsCommenting(false);
    }
  };

  // ✅ NEW: Save post handler with API call
  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      await userAPI.toggleSavePost(post.id, token);
      
      Swal.fire({
        icon: "success",
        title: newSavedState ? "Post Saved!" : "Post Unsaved",
        text: newSavedState ? "You can find it in your saved posts" : "",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      setIsSaved(!newSavedState);
      console.error("Save error:", err);
      Swal.fire("Error", "Failed to save post", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(postUrl);
      setShareCount(prev => prev + 1);
      if (onShare) onShare(post.id);
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        text: "Post link copied to clipboard",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleDelete = async () => {
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
        await postAPI.deletePost(post.id, token);
        if (onDelete) onDelete(post.id);
        Swal.fire('Deleted!', 'Your post has been deleted.', 'success');
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Failed to delete post", "error");
      }
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(post);
  };

  const formatCommentTime = (date) => {
    if (!date) return "Just now";
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now - commentDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return commentDate.toLocaleDateString();
  };

  const isPostOwner = currentUser?.id === post.author?.id || isOwner;

  return (
    <div className="card post-card mb-4 border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-3 align-items-center">
            <img
              src={getImageUrl(post.author?.avatar)}
              alt={post.author?.name}
              className="rounded-circle"
              width="48"
              height="48"
              onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
            />
            <div>
              <h6 className="mb-0 fw-bold">{post.author?.name || "User"}</h6>
              <small className="text-muted">{post.timestamp || "Just now"}</small>
            </div>
          </div>
          <div className="dropdown">
            <button className="btn btn-light btn-sm" type="button" data-bs-toggle="dropdown">
              <i className="bi bi-three-dots-vertical"></i>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleSave(); }}>
                  <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} me-2`}></i>
                  {isSaved ? 'Unsave' : 'Save'} Post
                </a>
              </li>
              <li>
                <a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleShare(); }}>
                  <i className="bi bi-share me-2"></i>Share
                </a>
              </li>
              {isPostOwner && (
                <>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item text-primary" href="#" onClick={(e) => { e.preventDefault(); handleEdit(); }}>
                      <i className="bi bi-pencil me-2"></i>Edit
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item text-danger" href="#" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
                      <i className="bi bi-trash me-2"></i>Delete
                    </a>
                  </li>
                </>
              )}
              {!isPostOwner && (
                <>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <a className="dropdown-item text-danger" href="#">
                      <i className="bi bi-flag me-2"></i>Report
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="post-content mb-3">
          <p className="card-text mb-0" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
        </div>

        {post.image && (
          <div className="post-image mb-3">
            {post.mediaType === 'video' ? (
              <video src={post.image} controls className="img-fluid rounded w-100" style={{ maxHeight: "500px", objectFit: "contain" }} />
            ) : (
              <img 
                src={post.image} 
                alt="Post content" 
                className="img-fluid rounded w-100" 
                style={{ maxHeight: "500px", objectFit: "cover", cursor: "pointer" }} 
                onClick={() => window.open(post.image, '_blank')} 
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            )}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags mb-3">
            {post.tags.map((tag, index) => (
              <span key={index} className="badge bg-light text-success me-2 mb-1">
                <i className="bi bi-hash"></i>{tag.replace('#', '')}
              </span>
            ))}
          </div>
        )}

        <div className="post-stats d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
          <div>
            {likeCount > 0 && (
              <span className="small text-muted">
                <i className={`bi bi-hand-thumbs-up-fill ${isLiked ? 'text-success' : ''} me-1`}></i>
                {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
              </span>
            )}
          </div>
          <div className="d-flex gap-3">
            {comments.length > 0 && (
              <span className="small text-muted" style={{ cursor: "pointer" }} onClick={() => setShowComments(!showComments)}>
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </span>
            )}
            {shareCount > 0 && (
              <span className="small text-muted">{shareCount} {shareCount === 1 ? 'Share' : 'Shares'}</span>
            )}
          </div>
        </div>

        <div className="post-actions d-flex justify-content-around mb-3">
          <button 
            className={`btn btn-light btn-sm flex-grow-1 me-2 ${isLiked ? 'text-success fw-bold' : ''}`} 
            onClick={handleLike} 
            disabled={isLiking}
          >
            <i className={`bi ${isLiked ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'} me-1`}></i>
            {isLiking ? 'Liking...' : 'Like'}
          </button>
          <button className="btn btn-light btn-sm flex-grow-1 me-2" onClick={() => setShowComments(!showComments)}>
            <i className="bi bi-chat-dots me-1"></i>Comment
          </button>
          <button 
            className={`btn btn-light btn-sm flex-grow-1 me-2 ${isSaved ? 'text-primary fw-bold' : ''}`} 
            onClick={handleSave}
            disabled={isSaving}
          >
            <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'} me-1`}></i>
            {isSaving ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
          </button>
          <button className="btn btn-light btn-sm flex-grow-1" onClick={handleShare}>
            <i className="bi bi-share me-1"></i>Share
          </button>
        </div>

        {showComments && (
          <div className="comments-section">
            <form onSubmit={handleCommentSubmit} className="mb-3">
              <div className="d-flex gap-2">
                <img 
                  src={getImageUrl(currentUser?.avatar)} 
                  alt="Your avatar" 
                  className="rounded-circle" 
                  width="32" 
                  height="32" 
                  onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }} 
                />
                <div className="flex-grow-1">
                  <input 
                    type="text" 
                    className="form-control form-control-sm" 
                    placeholder="Write a comment..." 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    disabled={isCommenting} 
                  />
                </div>
                <button type="submit" className="btn btn-sm btn-success" disabled={!commentText.trim() || isCommenting}>
                  {isCommenting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send"></i>}
                </button>
              </div>
            </form>

            {comments.length > 0 && (
              <div className="comments-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {comments.map((comment, index) => (
                  <div key={comment._id || index} className="comment-item d-flex gap-2 mb-3">
                    <img 
                      src={getImageUrl(comment.user?.profilePicture)} 
                      alt={comment.user?.fullName || "User"} 
                      className="rounded-circle" 
                      width="32" 
                      height="32" 
                      onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }} 
                    />
                    <div className="flex-grow-1">
                      <div className="comment-content bg-light rounded p-2">
                        <h6 className="mb-1 small fw-bold">{comment.user?.fullName || "User"}</h6>
                        <p className="mb-0 small">{comment.content}</p>
                      </div>
                      <div className="comment-meta mt-1">
                        <small className="text-muted">{formatCommentTime(comment.createdAt)}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
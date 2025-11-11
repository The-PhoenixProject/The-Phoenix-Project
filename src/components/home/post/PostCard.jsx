import React, { useState } from "react";
import "../../../styles/Home/PostCard.css";
import PostActions from "./PostActions";
import logoIcon from "../../../assets/landingImgs/logo-icon.png";

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="card post-card mb-4 border-0 shadow-sm">
      <div className="card-body p-4">
        {/* Post Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-3 align-items-center">
            <img
              src={post.author.avatar || logoIcon}
              alt={post.author.name}
              className="rounded-circle"
              width="48"
              height="48"
            />
            <div>
              <h6 className="mb-0 fw-bold">{post.author.name}</h6>
              <small className="text-muted">
                {post.timestamp || "Just now"}
              </small>
            </div>
          </div>
          <button className="btn btn-light btn-sm">
            <i className="bi bi-three-dots-vertical"></i>
          </button>
        </div>

        {/* Post Content */}
        <div className="post-content mb-3">
          <p className="card-text mb-0">{post.content}</p>
        </div>

        {/* Post Image */}
        {post.image && (
          <div className="post-image mb-3">
            <img
              src={post.image}
              alt="Post content"
              className="img-fluid rounded"
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </div>
        )}

        {/* Post Tags/Category */}
        {post.tags && post.tags.length > 0 && (
          <div className="post-tags mb-3">
            {post.tags.map((tag, index) => (
              <span key={index} className="badge bg-light text-success me-2">
                <i className="bi bi-check-circle-fill"></i> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="post-actions-footer">
          <PostActions
            likes={post.likes}
            comments={post.comments}
            isLiked={isLiked}
            onLikeToggle={() => setIsLiked(!isLiked)}
          />
        </div>
      </div>
    </div>
  );
};

export default PostCard;

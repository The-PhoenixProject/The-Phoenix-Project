import React, { useState } from "react";
import "/src/styles/Home/PostActions.css";

const PostActions = ({
  likes = 0,
  comments = 0,
  isLiked = false,
  onLikeToggle,
}) => {
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(isLiked);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLikeToggle) onLikeToggle();
  };

  return (
    <div className="post-actions-container">
      <div className="action-buttons d-flex justify-content-around border-top pt-3">
        <button
          className={`btn btn-light btn-sm flex-grow-1 action-btn ${
            liked ? "liked" : ""
          }`}
          onClick={handleLike}
        >
          <i
            className={`bi ${
              liked ? "bi-hand-thumbs-up-fill" : "bi-hand-thumbs-up"
            } me-1`}
          ></i>
          Like
        </button>
        <button className="btn btn-light btn-sm flex-grow-1 action-btn">
          <i className="bi bi-chat-dots me-1"></i>
          Comment
        </button>
        <button className="btn btn-light btn-sm flex-grow-1 action-btn">
          <i className="bi bi-share me-1"></i>
          Share
        </button>
      </div>

      <div className="action-stats d-flex justify-content-between align-items-center border-top mt-3 pt-3 small text-muted">
        <span>
          <i className="bi bi-hand-thumbs-up-fill text-success me-1"></i>
          {likeCount} Likes
        </span>
        <span>
          <i className="bi bi-chat-dots text-success me-1"></i>
          {comments} Comments
        </span>
      </div>
    </div>
  );
};

export default PostActions;

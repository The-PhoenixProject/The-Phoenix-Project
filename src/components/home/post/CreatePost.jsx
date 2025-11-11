import React, { useState } from "react";
import "../../../styles/Home/CreatePost.css";
const logoIcon = "/assets/landingImgs/logo-icon.png";

const CreatePost = ({ currentUser }) => {
  const [postContent, setPostContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement post submission logic
    console.log("Submitting post:", postContent);
    setPostContent("");
    setIsExpanded(false);
  };

  return (
    <div className="card create-post-card mb-4 border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex gap-3">
          <div className="user-avatar-create">
            <img
              src={currentUser?.avatar || logoIcon}
              alt="User Avatar"
              className="rounded-circle"
              width="48"
              height="48"
            />
          </div>

          <div className="flex-grow-1">
            <form onSubmit={handleSubmit}>
              <textarea
                className="form-control create-post-input border-0 ps-0"
                placeholder="Share your story..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                rows={isExpanded ? 4 : 1}
              />

              {isExpanded && (
                <div className="mt-3 d-flex gap-2 justify-content-between align-items-center">
                  <div className="post-action-buttons">
                    <button type="button" className="btn btn-light btn-sm me-2">
                      <i className="bi bi-image text-success"></i> Photo/Video
                    </button>
                    <button type="button" className="btn btn-light btn-sm me-2">
                      <i className="bi bi-emoji-smile text-success"></i> Feeling
                    </button>
                    <button type="button" className="btn btn-light btn-sm">
                      <i className="bi bi-tag text-success"></i> Category
                    </button>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-light btn-sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setPostContent("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn orangebtn btn-sm"
                      disabled={!postContent.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;

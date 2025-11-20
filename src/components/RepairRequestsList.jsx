import React from "react";

function RepairRequestsList({ requests, onDelete }) {
  const defaultImage = "/assets/landingImgs/logo-icon.png";
  const getStatusClass = (status) => {
    const statusMap = {
      Pending: "status-pending",
      "In Progress": "status-progress",
      New: "status-new",
      Completed: "status-completed",
      Accepted: "status-accepted",
    };
    return statusMap[status] || "status-default";
  };

  const handleDelete = (requestId) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      if (onDelete) {
        onDelete(requestId);
      }
    }
  };

  // Check if request was added by user (postedBy === "You")
  const isUserAdded = (request) => {
    return request.postedBy === "You";
  };

  return (
    <div className="repair-requests-list">
      <div className="section-header">
        <h3>Recent Repair Requests</h3>
        <div className="header-actions">
          <button className="btn-icon">
            <i className="bi bi-chevron-down"></i> Filter
          </button>
          <button className="btn-icon">
            <i className="bi bi-list"></i> Sort
          </button>
        </div>
      </div>

      <div className="requests-grid">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <img
              src={request.image || defaultImage}
              alt={request.itemName}
              className="request-image"
            />
            <div className="request-content">
              <h4 className="request-title">{request.itemName}</h4>
              <p className="request-description">{request.description}</p>
              <div className="request-details">
                <span className="request-budget">{request.budget}</span>
                <span className="request-posted">
                  Posted by {request.postedBy}
                </span>
              </div>
              <div className="request-footer">
                <span
                  className={`status-badge ${getStatusClass(request.status)}`}
                >
                  {request.status}
                </span>
                <div className="request-actions">
                  <button className="action-link">Apply</button>
                  <button className="action-link">View Details</button>
                  {isUserAdded(request) && (
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(request.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RepairRequestsList;

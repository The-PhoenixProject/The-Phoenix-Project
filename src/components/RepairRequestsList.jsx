import React, { useState, useEffect } from "react";
import { maintenanceAPI } from "../services/api";

function RepairRequestsList({ token, onDelete }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultImage = "/assets/landingImgs/logo-icon.png";

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await maintenanceAPI.getAllRequests(token);
        setRequests(res.data || []);
      } catch {
        console.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [token]);

  const handleDelete = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      await maintenanceAPI.deleteRequest(requestId, token);
      setRequests(prev => prev.filter(r => r._id !== requestId));
      onDelete?.();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Failed to delete request");
    }
  };

  const getStatusClass = (status) => {
    const map = {
      New: "status-new",
      Pending: "status-pending",
      "In Progress": "status-progress",
      Completed: "status-completed",
    };
    return map[status] || "status-default";
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="repair-requests-list">
      <div className="section-header">
        <h3>Recent Repair Requests</h3>
      </div>

      <div className="requests-grid">
        {requests.map((request) => (
          <div key={request._id} className="request-card">
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
                  by {request.user?.fullName || "User"}
                </span>
              </div>
              <div className="request-footer">
                <span className={`status-badge ${getStatusClass(request.status)}`}>
                  {request.status}
                </span>
                <div className="request-actions">
                  <button className="action-link">Apply</button>
                  <button className="action-link">View Details</button>
                  {request.user?._id === token?.userId && (
                    <button
                      className="btn btn-delete"
                      onClick={() => handleDelete(request._id)}
                      title="Delete"
                    >
                      Delete
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

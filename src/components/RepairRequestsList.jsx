import React, { useState, useEffect } from "react";
import { maintenanceAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";

function RepairRequestsList({ onDelete }) {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultImage = "/assets/landingImgs/logo-icon.png";

  useEffect(() => {
    const loadRequests = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch MY requests from backend
        const res = await maintenanceAPI.getMyRequests(token);
        console.log("✅ My requests loaded:", res);
        
        const myRequests = res.data || [];
        setRequests(myRequests);
      } catch (error) {
        console.error("❌ Failed to load requests:", error);
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
      
      // ✅ Update local state
      setRequests(prev => prev.filter(r => r._id !== requestId));
      
      // ✅ Notify parent component
      if (onDelete) onDelete();
      
      alert("Request deleted successfully");
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete request: " + err.message);
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

  if (loading) return <p>Loading your requests...</p>;

  if (!token) {
    return (
      <div className="repair-requests-list">
        <div className="section-header">
          <h3>My Repair Requests</h3>
        </div>
        <p className="no-requests">Please login to view your requests</p>
      </div>
    );
  }

  return (
    <div className="repair-requests-list">
      <div className="section-header">
        <h3>My Repair Requests</h3>
      </div>

      {requests.length === 0 ? (
        <p className="no-requests">
          You haven't created any repair requests yet
        </p>
      ) : (
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
                    by {request.user?.fullName || "You"}
                  </span>
                </div>
                <div className="request-footer">
                  <span className={`status-badge ${getStatusClass(request.status)}`}>
                    {request.status}
                  </span>
                  <div className="request-actions">
                    {request.status === "New" && (
                      <>
                        <button className="action-link">View Offers</button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(request._id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {request.status === "Pending" && (
                      <button className="action-link">
                        View Offers ({request.offers?.length || 0})
                      </button>
                    )}
                    {request.status === "In Progress" && (
                      <button className="action-link">Track Progress</button>
                    )}
                    {request.status === "Completed" && (
                      <button className="action-link">Leave Review</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RepairRequestsList;
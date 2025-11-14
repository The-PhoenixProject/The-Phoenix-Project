import React, { useState, useEffect } from "react";
import { loadData } from "../services/dataService";
import { Link } from "react-router-dom";
import "../styles/maintenance_pages/MyMaintenanceRequestsPage.css";

function MyMaintenanceRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData().then((data) => {
      const transformedRequests = data.myRequests.map((req) => ({
        ...req,
        description: `Request for ${req.item} in ${req.category} category`,
        offersCount: Math.floor(Math.random() * 5) + 1,
      }));
      setRequests(transformedRequests);
    });
  }, []);

  const getStatusClass = (status) => {
    const statusMap = {
      Pending: "status-pending",
      "In Progress": "status-progress",
      Completed: "status-completed",
      Cancelled: "status-cancelled",
      Accepted: "status-accepted",
    };
    return statusMap[status] || "status-default";
  };

  const formatDate = () => {
    const dates = [
      "Oct 12, 2024",
      "Oct 10, 2024",
      "Oct 5, 2024",
      "Oct 8, 2024",
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  };

  return (
    <div className="my-maintenance-requests-page">
      <div className="page-header">
        <div>
          <h1>My Maintenance Requests</h1>
          <p className="page-subtitle">
            Track your submitted repair and restoration requests.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/" className="btn btn-home">
            Home
          </Link>
          <Link to="/request" className="btn btn-primary-orange">
            New Request
          </Link>
          <button className="btn btn-secondary">View Offers</button>
        </div>
      </div>

      <div className="requests-list">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-card-header">
                <h3 className="request-item-name">{request.item}</h3>
                <span
                  className={`status-badge ${getStatusClass(request.status)}`}
                >
                  {request.status}
                </span>
              </div>
              <p className="request-description">{request.description}</p>
              <div className="request-card-footer">
                <div className="request-meta">
                  <span className="request-date">{formatDate()}</span>
                  <span className="request-offers">
                    {request.offersCount}{" "}
                    {request.offersCount === 1 ? "offer" : "offers"}
                  </span>
                </div>
                <div className="request-actions">
                  <button className="btn btn-view">View</button>
                  <button className="btn btn-cancel">Cancel</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-requests">No requests found</p>
        )}
      </div>
    </div>
  );
}

export default MyMaintenanceRequestsPage;

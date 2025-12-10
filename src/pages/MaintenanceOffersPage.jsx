import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { maintenanceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth'; // ✅ Import useAuth hook
import './MaintenanceOffersPage.css';

function MaintenanceOffersPage() {
  const { token } = useAuth(); // ✅ Get token from AuthContext
  const [activeTab, setActiveTab] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      // ✅ Check if user is authenticated
      if (!token) {
        setError('Please login to view maintenance requests');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // ✅ Call backend API with token
        const response = await maintenanceAPI.getAllRequests(token);
        console.log('✅ Maintenance requests loaded:', response);

        const availableRequests =
          response.data?.requests || response.data || [];

        setRequests(availableRequests);
      } catch (err) {
        console.error('❌ Failed to fetch requests:', err);
        setError(err.message || 'Failed to load maintenance requests');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [token]); // ✅ Re-run when token changes

  const getStatusClass = (status) => {
    const statusMap = {
      Pending: 'status-pending',
      'In Progress': 'status-progress',
      New: 'status-new',
      Completed: 'status-completed',
      Accepted: 'status-accepted',
    };
    return statusMap[status] || 'status-default';
  };

  const filteredRequests =
    activeTab === 'all'
      ? requests
      : requests.filter((req) => req.status === activeTab);

  const handleApply = async (requestId) => {
    if (!token) {
      alert('Please login to apply for maintenance requests');
      return;
    }

    // TODO: Navigate to detail page or open application modal
    alert(
      `Applied to request #${requestId}. This feature will be implemented soon!`
    );
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="maintenance-offers-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="maintenance-offers-page">
        <div className="error-container">
          <h3>⚠️ Error Loading Requests</h3>
          <p>{error}</p>
          {!token && (
            <Link to="/login" className="btn btn-primary">
              Login to Continue
            </Link>
          )}
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-offers-page">
      <div className="page-header">
        <div>
          <h1>Maintenance Requests</h1>
          <p className="page-subtitle">
            Browse available repair requests and apply to help others fix their
            items.
          </p>
        </div>
        <Link to="/maintenance" className="btn btn-home">
          Back
        </Link>
      </div>

      <div className="offers-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Requests
        </button>
        <button
          className={`tab ${activeTab === 'New' ? 'active' : ''}`}
          onClick={() => setActiveTab('New')}
        >
          New
        </button>
        <button
          className={`tab ${activeTab === 'Pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('Pending')}
        >
          Pending
        </button>
        <button
          className={`tab ${activeTab === 'In Progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('In Progress')}
        >
          In Progress
        </button>
      </div>

      <div className="offers-grid">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request._id || request.id} className="offer-card">
              <img
                src={request.image || '/assets/landingImgs/logo-icon.png'}
                alt={request.itemName}
                className="offer-provider-image"
              />
              <div className="offer-content">
                <h3 className="offer-provider-name">{request.itemName}</h3>
                <p className="offer-description">{request.description}</p>
                <div className="request-meta">
                  <div className="offer-price">Budget: {request.budget}</div>
                  <div className="offer-duration">
                    Category: {request.category}
                  </div>
                  {request.location && (
                    <div className="offer-duration">
                      Location: {request.location}
                    </div>
                  )}
                  <span
                    className={`status-badge ${getStatusClass(request.status)}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="request-posted">
                  Posted by{' '}
                  {request.user?.fullName || request.postedBy || 'Unknown'}
                </div>
                <div className="offer-actions">
                  <button
                    className="btn btn-view-offer"
                    onClick={() => handleApply(request._id || request.id)}
                  >
                    Apply
                  </button>
                  <Link
                    to={`/maintenance/requests/${request._id || request.id}`}
                    className="btn btn-accept"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-offers">
            No requests found for "{activeTab}" status
          </p>
        )}
      </div>
    </div>
  );
}

export default MaintenanceOffersPage;

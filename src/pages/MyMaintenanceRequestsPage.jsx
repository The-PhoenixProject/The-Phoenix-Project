import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { maintenanceAPI } from '../services/api';
import toast from 'react-hot-toast';
import './MyMaintenanceRequestsPage.css';

function MyMaintenanceRequestsPage() {
  const { token } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const loadRequests = useCallback(async () => {
    if (!token) {
      toast.error('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await maintenanceAPI.getMyRequests(token);

      // Handle different response structures
      const requestsData = response?.data || response || [];
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error('Failed to load requests:', error);
      toast.error(`Failed to load requests: ${error.message}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?'))
      return;

    try {
      await maintenanceAPI.deleteRequest(requestId, token);
      toast.success('Request deleted successfully');
      loadRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error(`Error deleting request: ${error.message}`);
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active')
      return ['New', 'Matched', 'In Progress'].includes(req.status);
    if (activeTab === 'completed') return req.status === 'Completed';
    if (activeTab === 'disputed') return req.status === 'Disputed';
    return true;
  });

  if (loading) {
    return (
      <div className="my-requests-page">
        <div className="loading-state">
          <p>Loading your maintenance requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <div className="page-header">
        <div>
          <h1>My Maintenance Requests</h1>
          <p className="page-subtitle">
            Track and manage all your maintenance requests
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/maintenance" className="btn btn-primary-orange">
            + Create New Request
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="requests-tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
        <button
          className={`tab ${activeTab === 'disputed' ? 'active' : ''}`}
          onClick={() => setActiveTab('disputed')}
        >
          Disputed
        </button>
      </div>

      {/* Requests Grid */}
      <div className="requests-grid">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>{request.itemName || 'Unnamed Request'}</h3>
                <span
                  className={`status-badge status-${request.status
                    ?.toLowerCase()
                    .replace(/\s+/g, '-')}`}
                >
                  {request.status || 'Unknown'}
                </span>
              </div>

              <div className="request-category">
                <span className="badge-category">
                  {request.category || 'General'}
                </span>
              </div>

              <p className="request-description">
                {request.description?.substring(0, 100) || 'No description'}...
              </p>

              <div className="request-info">
                <div className="info-item">
                  <strong>Budget:</strong> {request.budget || 'Not specified'}
                </div>
                <div className="info-item">
                  <strong>Location:</strong>{' '}
                  {request.location || 'Not specified'}
                </div>
                <div className="info-item">
                  <strong>Offers:</strong> {request.offers?.length || 0}
                </div>
              </div>

              <div className="request-date">
                Posted: {new Date(request.createdAt).toLocaleDateString()}
              </div>

              <div className="request-actions">
                <Link
                  to={`/maintenance/requests/${request._id}`}
                  className="btn btn-view"
                >
                  View Details
                </Link>
                {request.status === 'New' && (
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeleteRequest(request._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-requests">
            <p>No maintenance requests found.</p>
            <Link to="/maintenance" className="btn btn-primary-orange">
              Create Your First Request
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        .my-requests-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0;
          font-size: 2rem;
          color: #2c3e50;
        }

        .page-subtitle {
          margin: 0.5rem 0 0 0;
          color: #7f8c8d;
        }

        .requests-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #ecf0f1;
        }

        .tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: #7f8c8d;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tab:hover {
          color: #2c3e50;
        }

        .tab.active {
          color: #ff6b35;
          border-bottom-color: #ff6b35;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .request-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
        }

        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .request-header h3 {
          margin: 0;
          font-size: 1.2rem;
          color: #2c3e50;
          flex: 1;
        }

        .status-badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-new {
          background: #e3f2fd;
          color: #1976d2;
        }
        .status-matched {
          background: #f3e5f5;
          color: #7b1fa2;
        }
        .status-in-progress {
          background: #e8f5e9;
          color: #388e3c;
        }
        .status-completed {
          background: #c8e6c9;
          color: #2e7d32;
        }
        .status-disputed {
          background: #ffebee;
          color: #c62828;
        }

        .request-category {
          margin-bottom: 1rem;
        }

        .badge-category {
          display: inline-block;
          background: #ecf0f1;
          color: #2c3e50;
          padding: 0.3rem 0.8rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .request-description {
          color: #7f8c8d;
          margin: 0.5rem 0 1rem 0;
          flex-grow: 1;
        }

        .request-info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 8px;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .info-item {
          margin: 0.4rem 0;
          color: #555;
        }

        .info-item strong {
          color: #2c3e50;
        }

        .request-date {
          font-size: 0.8rem;
          color: #95a5a6;
          margin-bottom: 1rem;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          text-align: center;
          transition: all 0.3s;
          flex: 1;
        }

        .btn-view {
          background: #ff6b35;
          color: white;
        }

        .btn-view:hover {
          background: #e55a24;
        }

        .btn-delete {
          background: #e74c3c;
          color: white;
        }

        .btn-delete:hover {
          background: #c0392b;
        }

        .btn-primary-orange {
          background: #ff6b35;
          color: white;
        }

        .btn-primary-orange:hover {
          background: #e55a24;
        }

        .no-requests {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 2rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .no-requests p {
          color: #7f8c8d;
          margin-bottom: 1.5rem;
        }

        .loading-state {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        @media (max-width: 1024px) {
          .requests-tabs {
            gap: 0.75rem;
          }

          .tab {
            padding: 0.6rem 1.2rem;
            font-size: 0.95rem;
          }
        }

        @media (max-width: 768px) {
          .requests-grid {
            grid-template-columns: 1fr;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .requests-tabs {
            flex-wrap: wrap;
            gap: 0.5rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 0.5rem;
          }

          .tab {
            padding: 0.6rem 1rem;
            font-size: 0.9rem;
            white-space: nowrap;
            flex-shrink: 0;
          }
        }

        @media (max-width: 600px) {
          .requests-tabs {
            gap: 0.4rem;
          }

          .tab {
            padding: 0.5rem 0.8rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 480px) {
          .requests-tabs {
            gap: 0.3rem;
            margin-bottom: 1.5rem;
          }

          .tab {
            padding: 0.5rem 0.6rem;
            font-size: 0.8rem;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
}

export default MyMaintenanceRequestsPage;

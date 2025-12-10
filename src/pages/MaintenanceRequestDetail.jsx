import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { maintenanceAPI } from "../services/api";

function ServiceProviderDashboard({ token }) {
  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [jobsResponse, statsResponse] = await Promise.all([
        maintenanceAPI.getMyJobs(token),
        maintenanceAPI.getProviderStats(token)
      ]);
      setJobs(jobsResponse.data || []);
      setStats(statsResponse.data || {});
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartWork = async (jobId) => {
    if (!window.confirm("Start working on this job?")) return;
    try {
      await maintenanceAPI.updateWorkStatus(jobId, "In Progress", token);
      alert("Job status updated to In Progress");
      loadDashboardData();
    } catch (error) {
      alert("Failed to start work: " + error.message);
    }
  };

  const handleMarkComplete = async (jobId) => {
    if (!window.confirm("Mark this job as complete?")) return;
    try {
      await maintenanceAPI.updateWorkStatus(jobId, "Awaiting Confirmation", token);
      alert("Job marked as complete. Waiting for customer confirmation.");
      loadDashboardData();
    } catch (error) {
      alert("Failed to mark complete: " + error.message);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      Matched: "status-matched",
      "In Progress": "status-progress",
      "Awaiting Confirmation": "status-awaiting",
      Completed: "status-completed",
      Disputed: "status-disputed"
    };
    return map[status] || "status-default";
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === "active") {
      return ["Matched", "In Progress"].includes(job.status);
    } else if (activeTab === "pending") {
      return job.status === "Awaiting Confirmation";
    } else if (activeTab === "completed") {
      return job.status === "Completed";
    }
    return true;
  });

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="provider-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Service Provider Dashboard</h1>
          <p className="page-subtitle">Manage your accepted jobs and track earnings</p>
        </div>
        <Link to="/" className="btn btn-home">Home</Link>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">💼</div>
            <div className="stat-content">
              <h3>{stats.activeJobs || 0}</h3>
              <p>Active Jobs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completedJobs || 0}</h3>
              <p>Completed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${stats.totalEarnings || 0}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.averageRating || 0}/5</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Jobs ({jobs.filter(j => ["Matched", "In Progress"].includes(j.status)).length})
        </button>
        <button
          className={`tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          Pending Confirmation ({jobs.filter(j => j.status === "Awaiting Confirmation").length})
        </button>
        <button
          className={`tab ${activeTab === "completed" ? "active" : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed ({jobs.filter(j => j.status === "Completed").length})
        </button>
      </div>

      {/* Jobs List */}
      <div className="jobs-list">
        {filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <p>No jobs in this category</p>
            <Link to="/maintenance-offers" className="btn btn-primary">
              Browse Available Requests
            </Link>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job._id} className="job-card">
              <div className="job-header">
                <div className="job-title-section">
                  <img 
                    src={job.image || "/assets/landingImgs/logo-icon.png"} 
                    alt={job.itemName}
                    className="job-image"
                  />
                  <div>
                    <h3>{job.itemName}</h3>
                    <p className="job-category">{job.category}</p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusClass(job.status)}`}>
                  {job.status}
                </span>
              </div>

              <div className="job-body">
                <p className="job-description">{job.description}</p>
                
                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-label">Client:</span>
                    <span className="detail-value">{job.user?.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Agreed Price:</span>
                    <span className="detail-value price">{job.agreedPrice}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{job.location || "Not specified"}</span>
                  </div>
                  {job.preferredContactTime && (
                    <div className="detail-item">
                      <span className="detail-label">Contact Time:</span>
                      <span className="detail-value">{job.preferredContactTime}</span>
                    </div>
                  )}
                </div>

                {/* Timeline Progress */}
                {job.status !== "Completed" && (
                  <div className="job-timeline">
                    <div className={`timeline-step ${job.status === "Matched" ? "current" : "completed"}`}>
                      <div className="step-dot"></div>
                      <span>Job Accepted</span>
                    </div>
                    <div className={`timeline-step ${job.status === "In Progress" ? "current" : job.status === "Awaiting Confirmation" || job.status === "Completed" ? "completed" : ""}`}>
                      <div className="step-dot"></div>
                      <span>Work In Progress</span>
                    </div>
                    <div className={`timeline-step ${job.status === "Awaiting Confirmation" ? "current" : job.status === "Completed" ? "completed" : ""}`}>
                      <div className="step-dot"></div>
                      <span>Awaiting Confirmation</span>
                    </div>
                    <div className={`timeline-step ${job.status === "Completed" ? "completed" : ""}`}>
                      <div className="step-dot"></div>
                      <span>Payment Released</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="job-actions">
                {job.status === "Matched" && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStartWork(job._id)}
                  >
                    Start Work
                  </button>
                )}
                {job.status === "In Progress" && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleMarkComplete(job._id)}
                  >
                    Mark as Complete
                  </button>
                )}
                {job.status === "Completed" && !job.providerReview && (
                  <Link 
                    to={`/maintenance/requests/${job._id}/review`}
                    className="btn btn-primary"
                  >
                    Leave Review
                  </Link>
                )}
                <Link 
                  to={`/maintenance/requests/${job._id}`}
                  className="btn btn-secondary"
                >
                  View Details
                </Link>
                <button className="btn btn-chat">
                  Message Client
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .provider-dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          margin: 0;
          color: #2c3e50;
        }

        .page-subtitle {
          color: #666;
          margin: 0.5rem 0 0;
        }

        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 2rem;
          color: #2c3e50;
        }

        .stat-content p {
          margin: 0.25rem 0 0;
          color: #666;
          font-size: 0.9rem;
        }

        .dashboard-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          border-bottom: 3px solid transparent;
          transition: all 0.3s;
        }

        .tab.active {
          color: #ff6b35;
          border-bottom-color: #ff6b35;
        }

        .tab:hover {
          color: #ff6b35;
        }

        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .job-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .job-title-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .job-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }

        .job-title-section h3 {
          margin: 0;
          color: #2c3e50;
        }

        .job-category {
          margin: 0.25rem 0 0;
          color: #999;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-matched { background: #f3e5f5; color: #7b1fa2; }
        .status-progress { background: #e8f5e9; color: #388e3c; }
        .status-awaiting { background: #fff9c4; color: #f57f17; }
        .status-completed { background: #c8e6c9; color: #2e7d32; }
        .status-disputed { background: #ffcdd2; color: #c62828; }

        .job-body {
          margin-bottom: 1rem;
        }

        .job-description {
          color: #666;
          margin-bottom: 1rem;
        }

        .job-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-label {
          font-size: 0.85rem;
          color: #999;
        }

        .detail-value {
          font-weight: 500;
          color: #2c3e50;
        }

        .detail-value.price {
          color: #ff6b35;
          font-size: 1.1rem;
        }

        .job-timeline {
          display: flex;
          justify-content: space-between;
          margin: 1.5rem 0;
          position: relative;
          padding: 0 20px;
        }

        .job-timeline::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 20px;
          right: 20px;
          height: 2px;
          background: #e0e0e0;
          z-index: 0;
        }

        .timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          z-index: 1;
        }

        .step-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #e0e0e0;
        }

        .timeline-step.current .step-dot {
          background: #ff6b35;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.2);
        }

        .timeline-step.completed .step-dot {
          background: #4caf50;
        }

        .timeline-step span {
          font-size: 0.75rem;
          color: #666;
          text-align: center;
          white-space: nowrap;
        }

        .job-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          transition: all 0.3s;
        }

        .btn-primary { background: #1976d2; color: white; }
        .btn-success { background: #4caf50; color: white; }
        .btn-secondary { background: #9e9e9e; color: white; }
        .btn-chat { background: #9c27b0; color: white; }
        .btn-home { background: #ff6b35; color: white; }

        .btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .no-jobs {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .no-jobs p {
          color: #999;
          margin-bottom: 1rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}

export default ServiceProviderDashboard;
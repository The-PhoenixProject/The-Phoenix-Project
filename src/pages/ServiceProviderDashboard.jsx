import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { maintenanceAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/Mantainance/ServiceProviderDashboard.css";

function ServiceProviderDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("active");
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [jobsResponse, statsResponse] = await Promise.all([
        maintenanceAPI.getMyJobs(token),
        maintenanceAPI.getProviderStats(token).catch(() => ({ data: {} }))
      ]);
      
      setJobs(jobsResponse.data || []);
      setStats(statsResponse.data || {
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0,
        averageRating: 0
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token, loadDashboardData]);

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
    </div>
  );
}

export default ServiceProviderDashboard;
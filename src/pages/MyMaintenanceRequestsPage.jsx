import React, { useState, useEffect, useCallback } from "react";
import { maintenanceAPI } from "../services/api";

function MaintenanceRequestDetail({ requestId, token, currentUserId }) {
  const [request, setRequest] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({ price: "", message: "" });

  const loadRequestDetails = useCallback(async () => {
    try {
      const response = await maintenanceAPI.getRequestById(requestId, token);
      const data = response?.data || response || null;
      setRequest(data);
      setOffers(data?.offers || []);
    } catch (error) {
      console.error("Failed to load request details:", error);
    } finally {
      setLoading(false);
    }
  }, [requestId, token]);

  useEffect(() => {
    loadRequestDetails();
  }, [loadRequestDetails]);

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    try {
      await maintenanceAPI.applyToRequest(requestId, offerData, token);
      alert("Offer submitted successfully!");
      setShowOfferForm(false);
      setOfferData({ price: "", message: "" });
      loadRequestDetails();
    } catch (error) {
      alert("Failed to submit offer: " + error.message);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    if (!window.confirm("Accept this offer and start the work?")) return;
    try {
      await maintenanceAPI.acceptOffer(requestId, offerId, token);
      alert("Offer accepted! Payment has been held in escrow.");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to accept offer: " + error.message);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm("Reject this offer?")) return;
    try {
      await maintenanceAPI.rejectOffer(requestId, offerId, token);
      alert("Offer rejected.");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to reject offer: " + error.message);
    }
  };

  const handleStartWork = async () => {
    try {
      await maintenanceAPI.updateWorkStatus(requestId, "In Progress", token);
      alert("Work status updated to In Progress");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to update status: " + error.message);
    }
  };

  const handleCompleteWork = async () => {
    try {
      await maintenanceAPI.updateWorkStatus(requestId, "Awaiting Confirmation", token);
      alert("Work marked as complete. Waiting for customer confirmation.");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to mark work complete: " + error.message);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!window.confirm("Confirm that the work is satisfactory? Payment will be released.")) return;
    try {
      await maintenanceAPI.confirmWorkCompletion(requestId, token);
      alert("Work confirmed! Payment has been released to the service provider.");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to confirm work: " + error.message);
    }
  };

  const handleOpenDispute = async () => {
    const reason = prompt("Please describe the issue:");
    if (!reason) return;
    try {
      await maintenanceAPI.openDispute(requestId, reason, token);
      alert("Dispute opened. Admin will review within 48 hours.");
      loadRequestDetails();
    } catch (error) {
      alert("Failed to open dispute: " + error.message);
    }
  };

  const isRequester = request?.user?._id === currentUserId;
  const isProvider = request?.selectedProvider?._id === currentUserId;
  const hasAcceptedOffer = offers.some(o => o.status === "accepted");

  if (loading) return <div className="loading">Loading request details...</div>;
  if (!request) return <div className="error">Request not found</div>;

  return (
    <div className="maintenance-request-detail">
      {/* Request Information */}
      <div className="request-header">
        <div className="request-title-section">
          <h2>{request.itemName}</h2>
          <span className={`status-badge status-${request.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {request.status}
          </span>
        </div>
        <div className="request-meta">
          <p><strong>Posted by:</strong> {request.user?.fullName}</p>
          <p><strong>Budget:</strong> {request.budget}</p>
          <p><strong>Location:</strong> {request.location || "Not specified"}</p>
          <p><strong>Category:</strong> {request.category}</p>
        </div>
      </div>

      {/* Request Details */}
      <div className="request-body">
        <div className="request-images">
          {request.image && (
            <img src={request.image} alt={request.itemName} className="request-main-image" />
          )}
        </div>
        <div className="request-description">
          <h3>Description</h3>
          <p>{request.description}</p>
        </div>
        {request.preferredContactTime && (
          <div className="preferred-time">
            <h3>Preferred Contact Time</h3>
            <p>{request.preferredContactTime}</p>
          </div>
        )}
      </div>

      {/* Work Progress Section (if work has started) */}
      {(request.status === "Matched" || request.status === "In Progress" || request.status === "Awaiting Confirmation") && (
        <div className="work-progress-section">
          <h3>Work Progress</h3>
          <div className="progress-timeline">
            <div className={`timeline-step ${["Matched", "In Progress", "Awaiting Confirmation", "Completed"].includes(request.status) ? "completed" : ""}`}>
              <span className="step-number">1</span>
              <span className="step-label">Provider Selected</span>
            </div>
            <div className={`timeline-step ${["In Progress", "Awaiting Confirmation", "Completed"].includes(request.status) ? "completed" : ""}`}>
              <span className="step-number">2</span>
              <span className="step-label">Work In Progress</span>
            </div>
            <div className={`timeline-step ${["Awaiting Confirmation", "Completed"].includes(request.status) ? "completed" : ""}`}>
              <span className="step-number">3</span>
              <span className="step-label">Awaiting Confirmation</span>
            </div>
            <div className={`timeline-step ${request.status === "Completed" ? "completed" : ""}`}>
              <span className="step-number">4</span>
              <span className="step-label">Completed</span>
            </div>
          </div>

          {/* Provider Actions */}
          {isProvider && (
            <div className="provider-actions">
              {request.status === "Matched" && (
                <button className="btn btn-primary" onClick={handleStartWork}>
                  Start Work
                </button>
              )}
              {request.status === "In Progress" && (
                <button className="btn btn-success" onClick={handleCompleteWork}>
                  Mark as Complete
                </button>
              )}
            </div>
          )}

          {/* Requester Actions */}
          {isRequester && request.status === "Awaiting Confirmation" && (
            <div className="requester-actions">
              <button className="btn btn-success" onClick={handleConfirmCompletion}>
                Confirm Completion & Release Payment
              </button>
              <button className="btn btn-danger" onClick={handleOpenDispute}>
                Open Dispute
              </button>
            </div>
          )}
        </div>
      )}

      {/* Offers Section */}
      <div className="offers-section">
        <div className="offers-header">
          <h3>Service Offers ({offers.length})</h3>
          {!isRequester && !hasAcceptedOffer && request.status === "New" && (
            <button 
              className="btn btn-primary-orange" 
              onClick={() => setShowOfferForm(!showOfferForm)}
            >
              {showOfferForm ? "Cancel" : "Submit Offer"}
            </button>
          )}
        </div>

        {/* Submit Offer Form */}
        {showOfferForm && (
          <form className="offer-form" onSubmit={handleSubmitOffer}>
            <div className="form-group">
              <label>Your Price Offer *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. $50"
                value={offerData.price}
                onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Explain your approach, timeline, and experience..."
                value={offerData.message}
                onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-submit">
              Submit Offer
            </button>
          </form>
        )}

        {/* Offers List */}
        <div className="offers-list">
          {offers.length === 0 ? (
            <p className="no-offers">No offers yet. Be the first to help!</p>
          ) : (
            offers.map((offer) => (
              <div key={offer._id} className={`offer-card ${offer.status}`}>
                <div className="offer-header">
                  <div className="provider-info">
                    <img 
                      src={offer.provider?.avatar || "/assets/landingImgs/logo-icon.png"} 
                      alt={offer.provider?.fullName}
                      className="provider-avatar"
                    />
                    <div>
                      <h4>{offer.provider?.fullName}</h4>
                      <div className="provider-rating">
                        ⭐ {offer.provider?.rating || 4.5} ({offer.provider?.reviewCount || 0} reviews)
                      </div>
                    </div>
                  </div>
                  <div className="offer-price">
                    <strong>{offer.price}</strong>
                    <span className={`offer-status status-${offer.status}`}>
                      {offer.status}
                    </span>
                  </div>
                </div>
                <div className="offer-body">
                  <p>{offer.message}</p>
                  <span className="offer-date">
                    Submitted {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {isRequester && offer.status === "pending" && !hasAcceptedOffer && (
                  <div className="offer-actions">
                    <button 
                      className="btn btn-accept" 
                      onClick={() => handleAcceptOffer(offer._id)}
                    >
                      Accept Offer
                    </button>
                    <button 
                      className="btn btn-reject" 
                      onClick={() => handleRejectOffer(offer._id)}
                    >
                      Reject
                    </button>
                    <button className="btn btn-chat">
                      Chat with Provider
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .maintenance-request-detail {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .request-header {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .request-title-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .request-title-section h2 {
          margin: 0;
          color: #2c3e50;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .status-new { background: #e3f2fd; color: #1976d2; }
        .status-pending { background: #fff3e0; color: #f57c00; }
        .status-matched { background: #f3e5f5; color: #7b1fa2; }
        .status-in-progress { background: #e8f5e9; color: #388e3c; }
        .status-awaiting-confirmation { background: #fff9c4; color: #f57f17; }
        .status-completed { background: #c8e6c9; color: #2e7d32; }

        .request-meta p {
          margin: 0.5rem 0;
          color: #666;
        }

        .request-body {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .request-main-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .work-progress-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .progress-timeline {
          display: flex;
          justify-content: space-between;
          margin: 2rem 0;
          position: relative;
        }

        .progress-timeline::before {
          content: '';
          position: absolute;
          top: 20px;
          left: 0;
          right: 0;
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

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e0e0;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .timeline-step.completed .step-number {
          background: #4caf50;
          color: white;
        }

        .step-label {
          font-size: 0.85rem;
          color: #666;
          text-align: center;
        }

        .provider-actions, .requester-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .offers-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .offers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .offer-form {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .offer-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .offer-card.accepted {
          border-color: #4caf50;
          background: #f1f8f4;
        }

        .offer-card.rejected {
          opacity: 0.6;
        }

        .offer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .provider-info {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .provider-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }

        .provider-rating {
          font-size: 0.9rem;
          color: #666;
        }

        .offer-price {
          text-align: right;
        }

        .offer-price strong {
          display: block;
          font-size: 1.5rem;
          color: #ff6b35;
        }

        .offer-status {
          font-size: 0.85rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }

        .offer-status.status-pending {
          background: #fff3e0;
          color: #f57c00;
        }

        .offer-status.status-accepted {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .offer-status.status-rejected {
          background: #ffcdd2;
          color: #c62828;
        }

        .offer-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .btn-primary { background: #1976d2; color: white; }
        .btn-primary-orange { background: #ff6b35; color: white; }
        .btn-success { background: #4caf50; color: white; }
        .btn-danger { background: #f44336; color: white; }
        .btn-accept { background: #4caf50; color: white; }
        .btn-reject { background: #f44336; color: white; }
        .btn-chat { background: #9c27b0; color: white; }
        .btn-submit { background: #ff6b35; color: white; }

        .btn:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .no-offers {
          text-align: center;
          color: #999;
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }

        textarea.form-control {
          resize: vertical;
        }
      `}</style>
    </div>
  );
}

export default MaintenanceRequestDetail;
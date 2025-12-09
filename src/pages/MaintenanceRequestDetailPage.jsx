import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { maintenanceAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import "../styles/Mantainance/MaintenanceRequestDetailPage.css";

function MaintenanceRequestDetailPage() {
  const { requestId } = useParams();
//   const navigate = useNavigate();
  const { token, currentUser } = useAuth();
  
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
    if (token && requestId) {
      loadRequestDetails();
    }
  }, [loadRequestDetails, token, requestId]);

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

  if (loading) return <div className="loading">Loading request details...</div>;
  if (!request) return <div className="error">Request not found</div>;

  const isRequester = request?.user?._id === currentUser?.userId || request?.user?._id === currentUser?._id;
//   const isProvider = request?.selectedProvider?._id === currentUser?.userId || request?.selectedProvider?._id === currentUser?._id;
  const hasAcceptedOffer = offers.some(o => o.status === "accepted");
//   const currentUserId = currentUser?.userId || currentUser?._id;

  return (
    <div className="maintenance-request-detail">
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/maintenance-offers">Maintenance Requests</Link>
        <span>/</span>
        <span>{request.itemName}</span>
      </div>

      {/* Request Information */}
      <div className="request-header">
        <div className="request-title-section">
          <h2>{request.itemName}</h2>
          <span className={`status-badge status-${request.status.toLowerCase().replace(/\s+/g, '-')}`}>
            {request.status}
          </span>
          {request.isUrgent && <span className="urgent-badge">🔥 Urgent</span>}
        </div>
        <div className="request-meta">
          <div className="meta-item">
            <strong>Posted by:</strong> {request.user?.fullName}
          </div>
          <div className="meta-item">
            <strong>Budget:</strong> <span className="budget-amount">{request.budget}</span>
          </div>
          <div className="meta-item">
            <strong>Location:</strong> {request.location || "Not specified"}
          </div>
          <div className="meta-item">
            <strong>Category:</strong> <span className="category-badge">{request.category}</span>
          </div>
          <div className="meta-item">
            <strong>Posted:</strong> {new Date(request.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="request-body">
        {request.image && (
          <div className="request-images">
            <img src={request.image} alt={request.itemName} className="request-main-image" />
          </div>
        )}
        <div className="request-description">
          <h3>Description</h3>
          <p>{request.description}</p>
        </div>
        {request.preferredContactTime && (
          <div className="preferred-time">
            <h3>📅 Preferred Contact Time</h3>
            <p>{request.preferredContactTime}</p>
          </div>
        )}
      </div>

      {/* Work Progress Section */}
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

          {/* Requester Actions */}
          {isRequester && request.status === "Awaiting Confirmation" && (
            <div className="requester-actions">
              <button className="btn btn-success" onClick={handleConfirmCompletion}>
                ✅ Confirm Completion & Release Payment
              </button>
              <button className="btn btn-danger" onClick={handleOpenDispute}>
                ⚠️ Open Dispute
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
              {showOfferForm ? "Cancel" : "📝 Submit Offer"}
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
            <p className="no-offers">No offers yet. Be the first to help! 🙌</p>
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
                      ✅ Accept Offer
                    </button>
                    <button 
                      className="btn btn-reject" 
                      onClick={() => handleRejectOffer(offer._id)}
                    >
                      ❌ Reject
                    </button>
                    <button className="btn btn-chat">
                      💬 Chat with Provider
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MaintenanceRequestDetailPage;
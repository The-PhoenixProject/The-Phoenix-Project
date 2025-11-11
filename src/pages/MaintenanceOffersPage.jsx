import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadData } from "../services/dataService";
import "./MaintenanceOffersPage.css";

function MaintenanceOffersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const loadRequests = async () => {
      const data = await loadData();

      // Filter out requests posted by "You" - only show requests from others
      let availableRequests = (data.repairRequests || []).filter(
        (req) => req.postedBy !== "You"
      );

      // If there are fewer than 10 requests, add mock requests
      if (availableRequests.length < 10) {
        const mockRequests = [
          {
            id: 1001,
            itemName: "Vintage Wooden Chair",
            category: "Furniture",
            description: "Need repair for broken leg and refinishing",
            budget: "$50 - $80",
            location: "Downtown",
            status: "New",
            postedBy: "John Smith",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1002,
            itemName: "Laptop Screen Replacement",
            category: "Electronics",
            description: "Screen cracked, needs replacement",
            budget: "$100 - $150",
            location: "Midtown",
            status: "Pending",
            postedBy: "Sarah Johnson",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1003,
            itemName: "Leather Jacket Repair",
            category: "Clothing",
            description: "Zipper broken and small tear on sleeve",
            budget: "$30 - $50",
            location: "Uptown",
            status: "New",
            postedBy: "Mike Davis",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1004,
            itemName: "Antique Clock Restoration",
            category: "Other",
            description: "Clock stopped working, needs mechanical repair",
            budget: "$120 - $180",
            location: "Historic District",
            status: "Pending",
            postedBy: "Emily Chen",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1005,
            itemName: "Bicycle Chain Repair",
            category: "Other",
            description: "Chain keeps falling off, needs adjustment",
            budget: "$25 - $40",
            location: "Park Area",
            status: "New",
            postedBy: "David Wilson",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1006,
            itemName: "Washing Machine Fix",
            category: "Electronics",
            description: "Machine not spinning, making loud noise",
            budget: "$80 - $120",
            location: "Suburbs",
            status: "New",
            postedBy: "Lisa Anderson",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1007,
            itemName: "Vintage Radio Restoration",
            category: "Electronics",
            description: "Radio not turning on, needs electrical repair",
            budget: "$60 - $90",
            location: "Old Town",
            status: "Pending",
            postedBy: "Robert Brown",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1008,
            itemName: "Wooden Table Refinishing",
            category: "Furniture",
            description:
              "Table surface scratched, needs sanding and refinishing",
            budget: "$70 - $100",
            location: "Riverside",
            status: "New",
            postedBy: "Jennifer Lee",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1009,
            itemName: "Sewing Machine Service",
            category: "Electronics",
            description: "Machine jamming, needs cleaning and adjustment",
            budget: "$40 - $60",
            location: "Crafts District",
            status: "New",
            postedBy: "Michael Taylor",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1010,
            itemName: "Vintage Lamp Rewiring",
            category: "Electronics",
            description: "Old lamp needs new wiring and socket replacement",
            budget: "$35 - $55",
            location: "Arts Quarter",
            status: "Pending",
            postedBy: "Amanda White",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1011,
            itemName: "Guitar String Replacement",
            category: "Other",
            description: "Need all strings replaced and tuning",
            budget: "$20 - $35",
            location: "Music Street",
            status: "New",
            postedBy: "Chris Martinez",
            image: "/assets/landingImgs/logo-icon.png",
          },
          {
            id: 1012,
            itemName: "Ceramic Vase Repair",
            category: "Other",
            description: "Vase broken into pieces, needs professional gluing",
            budget: "$45 - $70",
            location: "Museum Area",
            status: "New",
            postedBy: "Patricia Garcia",
            image: "/assets/landingImgs/logo-icon.png",
          },
        ];
        availableRequests = [...availableRequests, ...mockRequests];
      }

      setRequests(availableRequests);
    };

    loadRequests();
  }, []);

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

  const filteredRequests =
    activeTab === "all"
      ? requests
      : requests.filter((req) => req.status === activeTab);

  const handleApply = (requestId) => {
    alert(
      `Applied to request #${requestId}. This feature will be implemented soon!`
    );
  };

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
        <Link to="/" className="btn btn-home">
          Home
        </Link>
      </div>

      <div className="offers-tabs">
        <button
          className={`tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Requests
        </button>
        <button
          className={`tab ${activeTab === "New" ? "active" : ""}`}
          onClick={() => setActiveTab("New")}
        >
          New
        </button>
        <button
          className={`tab ${activeTab === "Pending" ? "active" : ""}`}
          onClick={() => setActiveTab("Pending")}
        >
          Pending
        </button>
        <button
          className={`tab ${activeTab === "In Progress" ? "active" : ""}`}
          onClick={() => setActiveTab("In Progress")}
        >
          In Progress
        </button>
      </div>

      <div className="offers-grid">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request.id} className="offer-card">
              <img
                src={request.image}
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
                  Posted by {request.postedBy}
                </div>
                <div className="offer-actions">
                  <button
                    className="btn btn-view-offer"
                    onClick={() => handleApply(request.id)}
                  >
                    Apply
                  </button>
                  <button className="btn btn-accept">View Details</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-offers">No requests found</p>
        )}
      </div>
    </div>
  );
}

export default MaintenanceOffersPage;

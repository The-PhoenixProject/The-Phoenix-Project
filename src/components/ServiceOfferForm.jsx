import React, { useState } from "react";
import { addMyOffer } from "../services/dataService";

function ServiceOfferForm({ onOfferAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Electronics",
    description: "",
    startingPrice: "",
    location: "",
    experience: "",
    specialties: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.startingPrice) {
        setSubmitMessage("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Add to my offers only
      await addMyOffer({
        serviceName: formData.name,
        category: formData.category,
        price: formData.startingPrice,
        description: formData.description,
        status: "Active",
      });

      // Reset form
      setFormData({
        name: "",
        category: "Electronics",
        description: "",
        startingPrice: "",
        location: "",
        experience: "",
        specialties: "",
      });

      setSubmitMessage("Service offer submitted successfully!");

      // Notify parent component to refresh data
      if (onOfferAdded) {
        onOfferAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting offer:", error);
      setSubmitMessage("Error submitting offer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      category: "Electronics",
      description: "",
      startingPrice: "",
      location: "",
      experience: "",
      specialties: "",
    });
    setSubmitMessage("");
  };

  return (
    <div className="request-form-container" id="offer-service-form">
      <h3 className="form-title">Offer a Service</h3>
      {submitMessage && (
        <div
          className={`submit-message ${
            submitMessage.includes("Error") ? "error" : "success"
          }`}
        >
          {submitMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Service Name *</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="e.g. Electronics Repair Service"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            className="form-control"
            rows="4"
            placeholder="Describe your service and expertise...."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Starting Price *</label>
          <input
            type="text"
            name="startingPrice"
            className="form-control"
            placeholder="e.g. $25/hour or $50 - $100"
            value={formData.startingPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            className="form-control"
            placeholder="e.g. New York, NY"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="text"
            name="experience"
            className="form-control"
            placeholder="e.g. 5 years"
            value={formData.experience}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Specialties</label>
          <input
            type="text"
            name="specialties"
            className="form-control"
            placeholder="e.g. Vintage electronics, Antique furniture"
            value={formData.specialties}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Offer"}
          </button>
          <button
            type="button"
            className="btn-cancel-link"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ServiceOfferForm;

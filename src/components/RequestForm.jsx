import React, { useState } from "react";
import { addRepairRequest } from "../services/dataService";

function RequestForm({ onRequestAdded }) {
  const [formData, setFormData] = useState({
    itemName: "",
    category: "Electronics",
    description: "",
    budget: "",
    location: "",
    preferredContactTime: "",
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
      if (!formData.itemName || !formData.description || !formData.budget) {
        setSubmitMessage("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      // Add the request using dataService
      await addRepairRequest({
        itemName: formData.itemName,
        category: formData.category,
        description: formData.description,
        budget: formData.budget,
        location: formData.location,
        preferredContactTime: formData.preferredContactTime,
      });

      // Reset form
      setFormData({
        itemName: "",
        category: "Electronics",
        description: "",
        budget: "",
        location: "",
        preferredContactTime: "",
      });

      setSubmitMessage("Request submitted successfully!");

      // Notify parent component to refresh data
      if (onRequestAdded) {
        onRequestAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting request:", error);
      setSubmitMessage("Error submitting request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      itemName: "",
      category: "Electronics",
      description: "",
      budget: "",
      location: "",
      preferredContactTime: "",
    });
    setSubmitMessage("");
  };

  return (
    <div className="request-form-container" id="request-repair-form">
      <h3 className="form-title">Request a Repair</h3>
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
          <label>Item Name *</label>
          <input
            type="text"
            name="itemName"
            className="form-control"
            placeholder="e.g. Vintage Lamp"
            value={formData.itemName}
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
            placeholder="Describe what needs repair...."
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <button type="button" className="btn btn-upload">
            <i className="bi bi-camera"></i> Upload Photos
          </button>
        </div>

        <div className="form-group">
          <label>Budget *</label>
          <input
            type="text"
            name="budget"
            className="form-control"
            placeholder="$20 - $30"
            value={formData.budget}
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
            placeholder="e.g. Before Export"
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Preferred Contact Time</label>
          <input
            type="text"
            name="preferredContactTime"
            className="form-control"
            placeholder="e.g. mm/dd/yyyy"
            value={formData.preferredContactTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
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

export default RequestForm;

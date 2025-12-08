import React, { useState } from "react";
import { maintenanceAPI } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

function ServiceOfferForm({ onOfferAdded }) {
  const { token } = useAuth();
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Please login to submit an offer");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.startingPrice) {
        toast.error("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      // ✅ FIXED: Match backend expected field names
      const offerData = {
        name: formData.name,              // Backend expects "name" not "serviceName"
        category: formData.category,
        description: formData.description,
        startingPrice: formData.startingPrice,  // Backend expects "startingPrice" not "price"
        location: formData.location || "",
        experience: formData.experience || "",
        specialties: formData.specialties || "",
      };

      console.log('📤 Submitting offer data:', offerData);

      const response = await maintenanceAPI.createOffer(offerData, token);
      
      console.log('✅ Offer created successfully:', response);

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

      toast.success("Service offer submitted successfully!");

      // Notify parent component to refresh data
      if (onOfferAdded) {
        onOfferAdded();
      }
    } catch (error) {
      console.error('❌ Error submitting offer:', error);
      toast.error(error.message || "Error submitting offer. Please try again.");
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
  };

  return (
    <div className="request-form-container" id="offer-service-form">
      <h3 className="form-title">Offer a Service</h3>
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
            <option value="Appliances">Appliances</option>
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
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { maintenanceAPI } from '../services/api';
import toast from 'react-hot-toast';
import './MyServicesPage.css';

function MyServicesPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOffers = useCallback(async () => {
    if (!token) {
      toast.error('Authentication required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await maintenanceAPI.getMyOffers(token);

      // Handle different response structures
      const offersData =
        response?.data?.offers || response?.data || response || [];

      // Transform offers data to match the offers layout
      const transformedOffers = (
        Array.isArray(offersData) ? offersData : []
      ).map((offer) => ({
        id: offer._id || offer.id,
        name: offer.serviceName || offer.name || 'Service',
        category: offer.category || 'General',
        basePrice:
          offer.basePrice || offer.price || offer.startingPrice || '$50',
        description: offer.description || '',
        status: offer.status?.toLowerCase() || 'active',
      }));

      setOffers(transformedOffers);
    } catch (error) {
      console.error('Error loading offers:', error);
      toast.error(`Failed to load offers: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;

    try {
      await maintenanceAPI.deleteOffer(offerId, token);
      toast.success('Offer deleted successfully');
      loadOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast.error(`Error deleting offer: ${error.message}`);
    }
  };

  const filteredOffers =
    activeTab === 'active'
      ? offers.filter((o) => o.status === 'active')
      : activeTab === 'completed'
      ? offers.filter((o) => o.status === 'completed')
      : offers;

  if (loading) {
    return (
      <div className="my-services-page">
        <div className="loading-state">
          <p>Loading your service offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-services-page">
      <div className="page-header">
        <div>
          <h1>My Offers</h1>
          <p className="page-subtitle">
            Manage the service offers you have posted.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/maintenance" className="btn btn-home">
            Back
          </Link>
          <Link to="/maintenance" className="btn btn-primary-orange">
            Add New Offer
          </Link>
        </div>
      </div>

      <div className="services-tabs">
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
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      <div className="services-grid">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer) => (
            <div key={offer.id} className="service-card">
              <div className="service-header">
                <h3 className="service-name">{offer.name}</h3>
                <span className="service-category">{offer.category}</span>
              </div>
              {offer.description && (
                <p
                  className="service-description"
                  style={{
                    color: '#666',
                    fontSize: '0.9rem',
                    margin: '0.5rem 0',
                  }}
                >
                  {offer.description}
                </p>
              )}
              <div className="service-price">Price: {offer.basePrice}</div>
              <div className="service-stats">
                <span className={`service-status ${offer.status}`}>
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </span>
              </div>
              <div className="service-actions">
                <button className="btn btn-edit">Edit</button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(offer.id)}
                >
                  Delete
                </button>
                <button className="btn btn-view">View</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-services">No offers found</p>
        )}
      </div>
    </div>
  );
}

export default MyServicesPage;

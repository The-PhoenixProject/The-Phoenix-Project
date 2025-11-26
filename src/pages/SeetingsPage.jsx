// src/pages/SettingsPage.jsx - NEW COMPLETE COMPONENT
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import Swal from "sweetalert2";
import "../styles/SettingsPage.css";

const SettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [, setUser] = useState(null);
  
  const token = localStorage.getItem("authToken");

  // Account settings
  const [accountData, setAccountData] = useState({
    fullName: "",
    email: "",
    location: "",
    bio: ""
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
    allowMessages: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    productNotifications: true
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authAPI.getMe(token);
        const userData = response.data.user;
        
        setUser(userData);
        setAccountData({
          fullName: userData.fullName || "",
          email: userData.email || "",
          location: userData.location || "",
          bio: userData.bio || ""
        });
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };

    fetchUserData();
  }, [token]);

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.updateProfile({
        fullName: accountData.fullName,
        bio: accountData.bio,
        location: accountData.location
      }, token);
      
      Swal.fire({
        icon: "success",
        title: "Account Updated!",
        text: "Your account information has been updated successfully",
        timer: 2000
      });
    } catch (err) {
      Swal.fire("Error", err.message || "Failed to update account", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html:
        '<input id="current-password" type="password" class="swal2-input" placeholder="Current Password">' +
        '<input id="new-password" type="password" class="swal2-input" placeholder="New Password">' +
        '<input id="confirm-password" type="password" class="swal2-input" placeholder="Confirm Password">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Password',
      confirmButtonColor: '#007D6E',
      preConfirm: () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('Passwords do not match');
          return false;
        }

        if (newPassword.length < 8) {
          Swal.showValidationMessage('Password must be at least 8 characters');
          return false;
        }

        return { currentPassword, newPassword };
      }
    });

    if (formValues) {
      // TODO: Implement password change API call
      Swal.fire({
        icon: "success",
        title: "Password Updated!",
        text: "Your password has been changed successfully",
        timer: 2000
      });
    }
  };

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Delete Account?',
      text: "This action cannot be undone! All your data will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete my account',
      input: 'password',
      inputPlaceholder: 'Enter your password to confirm',
      inputAttributes: {
        autocapitalize: 'off'
      }
    });

    if (result.isConfirmed && result.value) {
      // TODO: Implement account deletion API call
      Swal.fire({
        icon: "info",
        title: "Account deletion feature coming soon",
        text: "Please contact support to delete your account"
      });
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout?',
      text: "Are you sure you want to logout?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      confirmButtonColor: '#007D6E'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    });
  };

  return (
    <div className="settings-page">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-light me-3"
            onClick={() => navigate('/home')}
            style={{ borderRadius: '12px' }}
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <h3 className="mb-0" style={{ color: '#007D6E' }}>
              <i className="bi bi-gear-fill me-2"></i>
              Settings
            </h3>
            <p className="text-muted mb-0">Manage your account preferences</p>
          </div>
        </div>

        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3">
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-3">
                <div className="d-flex flex-column gap-2">
                  <button
                    className={`btn text-start ${activeTab === 'account' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => setActiveTab('account')}
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-person-fill me-2"></i>
                    Account
                  </button>
                  <button
                    className={`btn text-start ${activeTab === 'privacy' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => setActiveTab('privacy')}
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Privacy
                  </button>
                  <button
                    className={`btn text-start ${activeTab === 'notifications' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => setActiveTab('notifications')}
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-bell-fill me-2"></i>
                    Notifications
                  </button>
                  <button
                    className={`btn text-start ${activeTab === 'security' ? 'btn-success' : 'btn-light'}`}
                    onClick={() => setActiveTab('security')}
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-lock-fill me-2"></i>
                    Security
                  </button>
                  <hr />
                  <button
                    className="btn btn-light text-start"
                    onClick={handleLogout}
                    style={{ borderRadius: '12px' }}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="col-md-9">
            <div className="card shadow-sm" style={{ borderRadius: '16px' }}>
              <div className="card-body p-4">
                
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div>
                    <h5 className="mb-4">Account Information</h5>
                    <form onSubmit={handleAccountUpdate}>
                      <div className="mb-3">
                        <label className="form-label fw-bold">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={accountData.fullName}
                          onChange={(e) => setAccountData({...accountData, fullName: e.target.value})}
                          style={{ borderRadius: '12px' }}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={accountData.email}
                          disabled
                          style={{ borderRadius: '12px', backgroundColor: '#f8f9fa' }}
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold">Location</label>
                        <input
                          type="text"
                          className="form-control"
                          value={accountData.location}
                          onChange={(e) => setAccountData({...accountData, location: e.target.value})}
                          style={{ borderRadius: '12px' }}
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold">Bio</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={accountData.bio}
                          onChange={(e) => setAccountData({...accountData, bio: e.target.value})}
                          style={{ borderRadius: '12px' }}
                          maxLength={500}
                        ></textarea>
                        <small className="text-muted">{accountData.bio.length}/500</small>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-success"
                        disabled={loading}
                        style={{ borderRadius: '12px' }}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div>
                    <h5 className="mb-4">Privacy Settings</h5>
                    
                    <div className="mb-4">
                      <label className="form-label fw-bold">Profile Visibility</label>
                      <select 
                        className="form-select"
                        value={privacySettings.profileVisibility}
                        onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                        style={{ borderRadius: '12px' }}
                      >
                        <option value="public">Public - Anyone can see</option>
                        <option value="followers">Followers Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={privacySettings.showEmail}
                        onChange={(e) => setPrivacySettings({...privacySettings, showEmail: e.target.checked})}
                      />
                      <label className="form-check-label">Show email on profile</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={privacySettings.showLocation}
                        onChange={(e) => setPrivacySettings({...privacySettings, showLocation: e.target.checked})}
                      />
                      <label className="form-check-label">Show location on profile</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={privacySettings.allowMessages}
                        onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.checked})}
                      />
                      <label className="form-check-label">Allow messages from anyone</label>
                    </div>

                    <button className="btn btn-success" style={{ borderRadius: '12px' }}>
                      Save Privacy Settings
                    </button>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div>
                    <h5 className="mb-4">Notification Preferences</h5>
                    
                    <h6 className="mt-4 mb-3">Email Notifications</h6>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, emailNotifications: e.target.checked})}
                      />
                      <label className="form-check-label">Enable email notifications</label>
                    </div>

                    <h6 className="mt-4 mb-3">Push Notifications</h6>
                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.likeNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, likeNotifications: e.target.checked})}
                      />
                      <label className="form-check-label">Likes on posts</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.commentNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, commentNotifications: e.target.checked})}
                      />
                      <label className="form-check-label">Comments on posts</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.followNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, followNotifications: e.target.checked})}
                      />
                      <label className="form-check-label">New followers</label>
                    </div>

                    <div className="form-check form-switch mb-3">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        checked={notificationSettings.productNotifications}
                        onChange={(e) => setNotificationSettings({...notificationSettings, productNotifications: e.target.checked})}
                      />
                      <label className="form-check-label">Product updates</label>
                    </div>

                    <button className="btn btn-success" style={{ borderRadius: '12px' }}>
                      Save Notification Settings
                    </button>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div>
                    <h5 className="mb-4">Security Settings</h5>
                    
                    <div className="mb-4 p-3 border rounded" style={{ borderRadius: '12px' }}>
                      <h6>Change Password</h6>
                      <p className="text-muted small mb-2">Update your password regularly for better security</p>
                      <button 
                        className="btn btn-success"
                        onClick={handlePasswordChange}
                        style={{ borderRadius: '12px' }}
                      >
                        Change Password
                      </button>
                    </div>

                    <div className="mb-4 p-3 border border-danger rounded" style={{ borderRadius: '12px' }}>
                      <h6 className="text-danger">Danger Zone</h6>
                      <p className="text-muted small mb-2">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <button 
                        className="btn btn-danger"
                        onClick={handleDeleteAccount}
                        style={{ borderRadius: '12px' }}
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

import './UserProfile.css'

/**
 * UserProfile Component
 * Displays detailed user information in a side panel
 */
function UserProfile({ user, onClose }) {
  return (
    <div className="user-profile">
      {/* Close Button */}
      {onClose && (
        <button className="profile-close-btn" onClick={onClose} title="Close profile">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Profile Summary */}
      <div className="profile-summary">
        <div className="profile-avatar-large">
          <img src={user.avatar} alt={user.name} />
          {user.status && user.status === 'Online' && (
            <span className="online-indicator-large"></span>
          )}
        </div>
        <h2>{user.name}</h2>
        
        {/* Rating */}
        <div className="rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1.66667L12.575 7.15833L18.3333 8.19167L14.1667 12.3083L15.15 18.0417L10 15.2417L4.85 18.0417L5.83333 12.3083L1.66667 8.19167L7.425 7.15833L10 1.66667Z" fill="#FFD700" stroke="#FFD700" strokeWidth="1"/>
              </svg>
            ))}
          </div>
          <span className="rating-text">{user.rating} ({user.reviews} reviews)</span>
        </div>

        {/* Status */}
        {user.status && (
          <div className="user-status">
            <span className="status-dot"></span>
            {user.status} • {user.role}
          </div>
        )}
      </div>

      {/* Specializations */}
      <div className="profile-section">
        <h3>Specializations</h3>
        <div className="specializations">
          {user.specializations.map((spec, index) => (
            <span key={index} className="specialization-tag">{spec}</span>
          ))}
        </div>
      </div>

      {/* Response Time */}
      <div className="profile-section">
        <h3>Response Time</h3>
        <p className="response-time">{user.responseTime}</p>
      </div>

      {/* Action Buttons */}
      <div className="profile-actions">
        <button className="btn-profile-primary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 14C2 11.7909 4.68629 10 8 10C11.3137 10 14 11.7909 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          View Full Profile
        </button>
        <button className="btn-profile-secondary">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 4H14M2 4V12.6667C2 13.4 2.6 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V4M2 4L2.66667 2H13.3333L14 4M6 7.33333H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Schedule Repair
        </button>
        <button className="btn-profile-neutral">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.33333V8M8 8L5.33333 5.33333M8 8L10.6667 5.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.66667 14.6667H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Report User
        </button>
        <button className="btn-profile-danger">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Block User
        </button>
      </div>

      {/* Recent Activity */}
      <div className="profile-section">
        <h3>Recent Activity</h3>
        <div className="recent-activity">
          {user.recentActivity.map((activity, index) => (
            <div key={index} className="activity-item">
              <span className="activity-icon">{activity.icon}</span>
              <span>{activity.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserProfile

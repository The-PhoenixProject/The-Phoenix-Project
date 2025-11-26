import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/chat-page/UserProfile.css'

const DEFAULT_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect fill='%23ddd' width='80' height='80'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='14'>User</text></svg>`
  )

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

function UserProfile({ user, onClose, initialTab = 'summary' }) {
  const navigate = useNavigate()
  const [userProducts, setUserProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab) // 'summary' | 'products'

  const getAvatarUrl = (avatar) => {
    if (!avatar) return DEFAULT_PLACEHOLDER
    if (avatar.startsWith('http')) return avatar
    if (avatar.startsWith('/uploads')) {
      return `${API_URL}${avatar}`
    }
    return avatar
  }

  useEffect(() => {
    if (user?.userId) {
      fetchUserProducts(user.userId)
    }
  }, [user?.userId])

  const fetchUserProducts = async (userId) => {
    if (!userId) return

    setLoadingProducts(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_URL}/api/products/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUserProducts(data.data?.products || [])
      }
    } catch (error) {
      console.error('Error fetching user products:', error)
      setUserProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const handleViewProfile = () => {
    // open full profile (navigate to profile page)
    if (user?.userId) {
      navigate(`/profile/${user.userId}`)
      if (onClose) onClose()
    }
  }

  const handleViewProducts = () => {
    // show products inside the modal/panel
    setActiveTab('products')
  }

  return (
    <div className="user-profile">
      {onClose && (
        <button className="profile-close-btn" onClick={onClose} title="Close profile">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div className="profile-summary">
        <div className="profile-avatar-large">
          <img
            src={getAvatarUrl(user.avatar)}
            alt={user.name}
            onError={(e) => (e.target.src = DEFAULT_PLACEHOLDER)}
          />
          {user.status === 'Online' && (
            <span className="online-indicator-large"></span>
          )}
        </div>

        <h2>{user.name}</h2>

        <div className="user-status">
          <span className={`status-dot ${user.status === 'Online' ? 'online' : 'offline'}`}></span>
          {user.status}
        </div>
      </div>

      <div className="profile-section">
        <h3>Products ({userProducts.length})</h3>
        {loadingProducts ? (
          <p className="loading-products">Loading products...</p>
        ) : userProducts.length > 0 ? (
          activeTab === 'products' ? (
            <div className="products-list-full">
              {userProducts.map((product, index) => (
                <div key={index} className="product-full-item">
                  <img
                    src={product.images?.[0] || product.image || DEFAULT_PLACEHOLDER}
                    alt={product.title}
                    onError={(e) => (e.target.src = DEFAULT_PLACEHOLDER)}
                  />
                  <div className="product-info">
                    <p className="product-title">{product.title}</p>
                    <p className="product-price">{product.price} EGP</p>
                    <p className="product-desc">{product.description?.substring(0, 120)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="products-preview">
              {userProducts.slice(0, 3).map((product, index) => (
                <div key={index} className="product-preview-item">
                  <img
                    src={product.images?.[0] || product.image || DEFAULT_PLACEHOLDER}
                    alt={product.title}
                    onError={(e) => (e.target.src = DEFAULT_PLACEHOLDER)}
                  />
                  <div className="product-info">
                    <p className="product-title">{product.title}</p>
                    <p className="product-price">{product.price} EGP</p>
                  </div>
                </div>
              ))}
              {userProducts.length > 3 && (
                <p className="more-products">+{userProducts.length - 3} more products</p>
              )}
            </div>
          )
        ) : (
          <p className="no-products">No products listed yet</p>
        )}
      </div>

      <div className="profile-action-buttons">
        <button className="btn-profile-primary" onClick={handleViewProfile}>
          View Full Profile
        </button>

        {userProducts.length > 0 && (
          <button className="btn-profile-secondary" onClick={handleViewProducts}>
            View All Products ({userProducts.length})
          </button>
        )}
      </div>
    </div>
  )
}

export default UserProfile

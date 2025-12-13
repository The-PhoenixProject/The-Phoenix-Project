// src/services/api.js - COMPLETE FIXED VERSION

// Handle API URL configuration for both development and production
// VITE_API_URL should be the full base URL (e.g., https://your-app.railway.app/api)
// If it doesn't end with /api, we'll append it
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    // Development fallback
    return 'http://localhost:3000/api';
  }
  
  // Remove trailing slash if present
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  
  // If the URL already includes /api, use it as is
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  
  // If it doesn't end with /api, append it
  return `${cleanUrl}/api`;
};

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return 'http://localhost:3000';
  }
  // Remove /api suffix if present for base URL usage
  return envUrl.replace(/\/api\/?$/, '');
};

const API_BASE_URL = getApiBaseUrl();
const API_URL = getApiUrl();

// Debug logging in production to help troubleshoot
console.log('🔧 API Configuration:', {
  envUrl: import.meta.env.VITE_API_URL || 'NOT SET',
  apiBaseUrl: API_BASE_URL,
  apiUrl: API_URL,
  isProd: import.meta.env.PROD
});

// Warn if API_BASE_URL doesn't end with /api in production
if (import.meta.env.PROD && !API_BASE_URL.endsWith('/api')) {
  console.error('⚠️ WARNING: API_BASE_URL does not end with /api:', API_BASE_URL);
  console.error('⚠️ Set VITE_API_URL in Vercel to: https://the-phoenix-project-back-end-production.up.railway.app/api');
}

const apiCall = async (endpoint, options = {}) => {
  try {
    const userHeaders = options.headers || {};
    const isForm = options.body instanceof FormData;
    const headers = { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...userHeaders };

    const maskToken = (h) => {
      if (!h) return null;
      try {
        const t = h.replace(/^Bearer\s+/i, '');
        return `${t.slice(0,6)}...${t.slice(-4)}`;
      } catch { return '***'; }
    };
    
    // Ensure endpoint starts with / to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;
    
    console.debug('API Request ->', { 
      url: fullUrl,
      endpoint: cleanEndpoint,
      fullEndpoint: `${API_BASE_URL}${cleanEndpoint}`, 
      method: options.method || 'GET', 
      headers: { ...headers, Authorization: userHeaders.Authorization ? `Bearer ${maskToken(userHeaders.Authorization)}` : undefined },
      apiBaseUrl: API_BASE_URL,
      envUrl: import.meta.env.VITE_API_URL,
      computedUrl: fullUrl
    });

    const response = await fetch(fullUrl, { 
      method: options.method || 'GET',
      headers,
      body: options.body,
      // Add credentials for CORS
      credentials: 'include',
      mode: 'cors'
    });
    
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }

    if (!response.ok) {
      // Allow callers to suppress noisy error logging for optional endpoints
      if (options && options.suppressErrors) {
        // Keep this quiet in development logs (use debug level)
        console.debug('API suppressed error for', endpoint, data);
        // Return parsed payload to let caller decide; do not throw
        return data;
      }
      
      // Enhanced error logging for 405 errors
      if (response.status === 405) {
        console.error('❌ 405 Method Not Allowed Error Details:', {
          attemptedUrl: fullUrl,
          method: options.method || 'GET',
          endpoint,
          apiBaseUrl: API_BASE_URL,
          envUrl: import.meta.env.VITE_API_URL || 'NOT SET - Using fallback',
          responseText: text,
          fix: 'Set VITE_API_URL in Vercel to: https://the-phoenix-project-back-end-production.up.railway.app/api'
        });
        
        // If URL doesn't contain /api, suggest the fix
        if (!fullUrl.includes('/api')) {
          console.error('⚠️ URL is missing /api prefix!');
          console.error('⚠️ Current URL:', fullUrl);
          console.error('⚠️ Should be:', fullUrl.replace('railway.app/', 'railway.app/api/'));
          console.error('⚠️ Fix: Set VITE_API_URL in Vercel environment variables');
        }
      }
      
      console.log('API error payload:', data);
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error('API Error:', error);
    // If it's a network error, provide more helpful message
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(`Cannot connect to backend. Check that ${API_BASE_URL} is accessible and CORS is configured.`);
    }
    throw error;
  }
};

/* ======================================== AUTH API ======================================== */
export const authAPI = {
  signup: async ({ email, password, fullName, location }) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, location }),
    });
  },
  resendOTP: async (email) =>
    apiCall('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyOTP: async (email, otp) =>
    apiCall('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  login: async (email, password) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  socialLogin: async (idToken) =>
    apiCall('/auth/social-login', { method: 'POST', body: JSON.stringify({ idToken }) }),
  forgotPassword: async (email) =>
    apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: async (email, otp, newPassword) =>
    apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) }),
  getMe: async (token) =>
    apiCall('/users/me', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
  updateProfile: async (data, token) =>
    apiCall('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  logout: async (token, refreshToken) =>
    apiCall('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ refreshToken }),
    }),
  refreshToken: async (refreshToken) =>
    apiCall('/auth/refresh-token', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

/* ======================================== PRODUCT API ======================================== */
export const productAPI = {
  getAllProducts: async (filters = {}, token) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
        else queryParams.append(key, value);
      }
    });
    return apiCall(`/products?${queryParams.toString()}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  getProductById: async (id, token) =>
    apiCall(`/products/${id}`, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} }),
  createProduct: async (formData, token) => {
    try {
      console.debug('productAPI.createProduct -> token present:', !!token);
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },
  getMyProducts: async (status, token) => {
    const query = status ? `?status=${status}` : '';
    return apiCall(`/products/my/products${query}`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
  },
  getProductsByUser: async (userId, token) => {
    return apiCall(`/products/user/${userId}`, { method: 'GET', headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
  updateProduct: async (id, formData, token) => {
    try {
      console.debug('productAPI.updateProduct -> id:', id, 'token present:', !!token);
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  },
  deleteProduct: async (id, token) =>
    apiCall(`/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  toggleWishlist: async (productId, token) =>
    apiCall(`/products/${productId}/wishlist`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  getWishlist: async (token) =>
    apiCall('/products/my/wishlist', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
};

/* ======================================== POST API ======================================== */
export const postAPI = {
  getMyPosts: async (token) =>
    apiCall('/posts/my', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
  getPostsByUser: async (userId, token) =>
    apiCall(`/posts/user/${userId}`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
  createPost: async (formData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create post');
      return data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },
  getFeedPosts: async (token) =>
    apiCall('/posts/feed', { method: 'GET', headers: { Authorization: `Bearer ${token}` } }),
  likePost: async (postId, token) =>
    apiCall(`/posts/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
  commentPost: async (postId, commentData, token) =>
    apiCall(`/posts/${postId}/comment`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(commentData),
    }),
  deletePost: async (postId, token) =>
    apiCall(`/posts/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  updatePost: async (postId, updateData, token) =>
    apiCall(`/posts/${postId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(updateData),
    }),
};

/* ======================================== CHAT API ======================================== */
export const chatAPI = {
  startConversation: async (sellerId, token) => {
    try {
      console.log('🔵 Starting conversation with sellerId:', sellerId);
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sellerId }),
      });
      const data = await response.json();
      console.log('🔵 Conversation response:', data);
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      return data;
    } catch (error) {
      console.error('❌ Start conversation error:', error);
      throw error;
    }
  },
  getConversations: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations');
      return data;
    } catch (error) {
      console.error('❌ Get conversations error:', error);
      throw error;
    }
  },
  getConversationById: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch conversation');
      return data;
    } catch (error) {
      console.error('❌ Get conversation by ID error:', error);
      throw error;
    }
  },
  getMessages: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch messages');
      return data;
    } catch (error) {
      console.error('❌ Get messages error:', error);
      throw error;
    }
  },
  sendMessage: async (conversationId, message, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send message');
      return data;
    } catch (error) {
      console.error('❌ Send message error:', error);
      throw error;
    }
  },
  archiveConversation: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/archive`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to archive conversation');
      return data;
    } catch (error) {
      console.error('❌ Archive conversation error:', error);
      throw error;
    }
  },
  unarchiveConversation: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/unarchive`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to unarchive conversation');
      return data;
    } catch (error) {
      console.error('❌ Unarchive conversation error:', error);
      throw error;
    }
  },
  deleteConversation: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete conversation');
      return data;
    } catch (error) {
      console.error('❌ Delete conversation error:', error);
      throw error;
    }
  },
  deleteMessage: async (messageId, deleteForEveryone, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ deleteForEveryone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete message');
      return data;
    } catch (error) {
      console.error('❌ Delete message error:', error);
      throw error;
    }
  },
  togglePinMessage: async (conversationId, messageId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/${messageId}/pin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to toggle pin');
      return data;
    } catch (error) {
      console.error('❌ Toggle pin error:', error);
      throw error;
    }
  },
  pinConversation: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/pin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to pin conversation');
      return data;
    } catch (error) {
      console.error('❌ Pin conversation error:', error);
      throw error;
    }
  },
  unpinConversation: async (conversationId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/unpin`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to unpin conversation');
      return data;
    } catch (error) {
      console.error('❌ Unpin conversation error:', error);
      throw error;
    }
  },
  markAsRead: async (conversationId, messageIds, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ messageIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to mark messages as read');
      return data;
    } catch (error) {
      console.error('❌ Mark as read error:', error);
      throw error;
    }
  },
  getUnreadCount: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/unread/count`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to get unread count');
      return data;
    } catch (error) {
      console.error('❌ Get unread count error:', error);
      throw error;
    }
  }
};

/* ======================================== USER PROFILE API ======================================== */
export const userAPI = {
  getUserProfile: async (userId, token) => {
    return apiCall(`/users/${userId}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  updateUserProfile: async (userId, userData, token) => {
    return apiCall(`/users/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(userData),
    });
  },
  uploadAvatar: async (formData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to upload avatar');
      return data;
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw error;
    }
  },
  deleteAvatar: async (token) => {
    return apiCall('/users/me/avatar', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  },
  getFollowers: async (userId, token) => {
    return apiCall(`/users/${userId}/followers`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  getFollowing: async (userId, token) => {
    return apiCall(`/users/${userId}/following`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  getSuggestedFriends: async (token) => {
    return apiCall('/users/suggestions', {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
  getTrendingTopics: async () => {
    return apiCall('/users/trending-topics', { method: 'GET' });
  },
  toggleSavePost: async (postId, token) => {
    return apiCall(`/users/posts/${postId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getSavedPosts: async (token) => {
    return apiCall('/users/saved-posts', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  followUser: async (userId, token) => {
    console.debug('followUser -> userId:', userId, 'token present:', !!token);
    return apiCall(`/users/follow/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  unfollowUser: async (userId, token) => {
    console.debug('unfollowUser -> userId:', userId, 'token present:', !!token);
    return apiCall(`/users/unfollow/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  getSettings: async (token) => {
    return apiCall('/users/settings', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  updateSettings: async (settings, token) => {
    return apiCall('/users/settings', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
  },
  changePassword: async (currentPassword, newPassword, token) => {
    return apiCall('/users/change-password', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  deleteAccount: async (password, token) => {
    return apiCall('/users/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password }),
    });
  },
};

/* ======================================== NOTIFICATION API ======================================== */
export const notificationAPI = {
  getNotifications: async (token) => {
    return apiCall('/notifications', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  getUnreadCount: async (token) => {
    return apiCall('/notifications/unread-count', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  markAsRead: async (notificationId, token) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  markAllAsRead: async (token) => {
    return apiCall('/notifications/read-all', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  deleteNotification: async (notificationId, token) => {
    return apiCall(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};

/* ======================================== MAINTENANCE & REPAIR HUB API ======================================== */
export const maintenanceAPI = {
  getAllRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch requests');
      return data;
    } catch (error) {
      console.error('❌ Get all requests error:', error);
      throw error;
    }
  },

  getRequestById: async (requestId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch request');
      return data;
    } catch (error) {
      console.error('❌ Get request by ID error:', error);
      throw error;
    }
  },

  createRequest: async (requestData, token) => {
    try {
      console.log('📤 Creating request:', requestData);
      const response = await fetch(`${API_BASE_URL}/maintenance/requests`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create request');
      console.log('✅ Request created:', data);
      return data;
    } catch (error) {
      console.error('❌ Create request error:', error);
      throw error;
    }
  },

  deleteRequest: async (requestId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete request');
      return data;
    } catch (error) {
      console.error('❌ Delete request error:', error);
      throw error;
    }
  },

  getMyRequests: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/my-requests`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch my requests');
      return data;
    } catch (error) {
      console.error('❌ Get my requests error:', error);
      throw error;
    }
  },

  applyToRequest: async (requestId, offerData, token) => {
    try {
      console.log('📤 Applying to request:', requestId, offerData);
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/apply`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(offerData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit offer');
      console.log('✅ Offer submitted:', data);
      return data;
    } catch (error) {
      console.error('❌ Apply to request error:', error);
      throw error;
    }
  },

  acceptOffer: async (requestId, offerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/offers/${offerId}/accept`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to accept offer');
      return data;
    } catch (error) {
      console.error('❌ Accept offer error:', error);
      throw error;
    }
  },

  rejectOffer: async (requestId, offerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/offers/${offerId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reject offer');
      return data;
    } catch (error) {
      console.error('❌ Reject offer error:', error);
      throw error;
    }
  },

  updateWorkStatus: async (requestId, status, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      return data;
    } catch (error) {
      console.error('❌ Update work status error:', error);
      throw error;
    }
  },

  confirmWorkCompletion: async (requestId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/confirm`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to confirm completion');
      return data;
    } catch (error) {
      console.error('❌ Confirm completion error:', error);
      throw error;
    }
  },

  getMyJobs: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/my-jobs`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch my jobs');
      return data;
    } catch (error) {
      console.error('❌ Get my jobs error:', error);
      throw error;
    }
  },

  openDispute: async (requestId, reason, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/dispute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to open dispute');
      return data;
    } catch (error) {
      console.error('❌ Open dispute error:', error);
      throw error;
    }
  },

  submitReview: async (requestId, rating, review, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/${requestId}/review`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ rating, review })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit review');
      return data;
    } catch (error) {
      console.error('❌ Submit review error:', error);
      throw error;
    }
  },
 getMyOffers: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/my-offers`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch my offers');
      return data;
    } catch (error) {
      console.error('❌ Get my offers error:', error);
      throw error;
    }
  },
  getAllOffers: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/offers`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch offers');
      return data;
    } catch (error) {
      console.error('❌ Get all offers error:', error);
      throw error;
    }
  },

  createOffer: async (offerData, token) => {
    try {
      console.log('📤 Creating offer:', offerData);
      const response = await fetch(`${API_BASE_URL}/maintenance/offers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(offerData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create offer');
      console.log('✅ Offer created:', data);
      return data;
    } catch (error) {
      console.error('❌ Create offer error:', error);
      throw error;
    }
  },

  deleteOffer: async (offerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/offers/${offerId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete offer');
      return data;
    } catch (error) {
      console.error('❌ Delete offer error:', error);
      throw error;
    }
  },

  updateOffer: async (offerId, offerData, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/offers/${offerId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(offerData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update offer');
      return data;
    } catch (error) {
      console.error('❌ Update offer error:', error);
      throw error;
    }
  },

  getOfferById: async (offerId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/offers/${offerId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch offer');
      return data;
    } catch (error) {
      console.error('❌ Get offer by ID error:', error);
      throw error;
    }
  },

  getProviderStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/provider/stats`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch provider stats');
      return data;
    } catch (error) {
      console.error('❌ Get provider stats error:', error);
      throw error;
    }
  },

  getRequestStats: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maintenance/requests/stats`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch request stats');
      return data;
    } catch (error) {
      console.error('❌ Get request stats error:', error);
      throw error;
    }
  }
};

/* ======================================== ECO POINTS API ======================================== */
export const ecoPointsAPI = {
  getEcoStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/eco-points/stats`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get eco stats');
    return data;
  },
  getLeaderboard: async (limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/eco-points/leaderboard?limit=${limit}`, { method: 'GET' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get leaderboard');
    return data;
  },
  getLevelProgress: async (token) => {
    const response = await fetch(`${API_BASE_URL}/eco-points/progress`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get level progress');
    return data;
  },
  updateStreak: async (token) => {
    const response = await fetch(`${API_BASE_URL}/eco-points/streak`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to update streak');
    return data;
  },
  getPointsConfig: async () => {
    const response = await fetch(`${API_BASE_URL}/eco-points/config`, { method: 'GET' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get points config');
    return data;
  },
};

export default authAPI;

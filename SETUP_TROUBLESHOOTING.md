# 🚀 Phoenix Maintenance & Services Hub - Setup & Troubleshooting Guide

## ✅ What Has Been Fixed

### 1. **API Integration** 
- ✅ MyServicesPage.jsx now uses `maintenanceAPI` instead of json-server
- ✅ MyMaintenanceRequestsPage.jsx properly fetches user's requests with authentication
- ✅ All pages now use `token` from `useAuth()` hook for authenticated requests

### 2. **Authentication**
- ✅ Token properly retrieved from `localStorage.authToken` via AuthContext
- ✅ All API calls include `Authorization: Bearer {token}` header
- ✅ Error handling for invalid/expired tokens

### 3. **Navigation Enhanced**
- ✅ Navbar now includes dropdown menu with:
  - Maintenance Hub links (Dashboard, My Requests, My Services, Browse Services)
  - Quick Access links (Saved Posts, Marketplace, Wishlist, Notifications, Settings)
- ✅ All main pages are accessible from navbar

### 4. **Documentation Created**
- ✅ Complete API endpoint documentation: `MAINTENANCE_API_DOCS.md`
- ✅ Testing guide with full workflow examples
- ✅ Request/response format specifications

---

## 🔧 Fixing the Remaining Errors

### Error 1: `net::ERR_CONNECTION_REFUSED` on myOffers endpoint

**Problem:**
```
GET http://localhost:3001/myOffers net::ERR_CONNECTION_REFUSED
```

**Root Cause:** 
The old code was trying to call `http://localhost:3001` (json-server) instead of the main API at `http://localhost:3000/api`

**Solution Applied:** ✅
- Updated MyServicesPage.jsx to use `maintenanceAPI.getAllOffers(token)` 
- This calls `/maintenance/offers` on the main backend API

**What to do:** 
Make sure your backend is running:
```bash
npm run dev  # or your backend start command
```

---

### Error 2: `401 (Unauthorized)` on maintenance requests

**Problem:**
```
GET http://localhost:3000/api/maintenance/requests/undefined 401 (Unauthorized)
Invalid token
```

**Root Cause:** 
- Token is `undefined` or invalid
- OR the token wasn't being passed in the Authorization header

**Solution Applied:** ✅
- Updated both pages to get `token` from `useAuth()` hook
- All API calls now check if token exists before making requests
- Toast error displayed if token missing

**What to do:**
1. Make sure you're logged in
2. Check console: `console.log(localStorage.getItem('authToken'))`
3. If no token, log out and log back in
4. Verify login endpoint is working

---

### Error 3: Calling wrong API endpoints

**Problem:**
```
POST http://localhost:3001/myOffers  // WRONG - calling old json-server
```

**Solution Applied:** ✅
- Replaced all dataService calls with maintenanceAPI calls
- Now using correct endpoints:
  - `/maintenance/requests` - Get all requests
  - `/maintenance/offers` - Get all offers  
  - `/maintenance/my-requests` - Get user's requests
  - `/maintenance/my-jobs` - Get user's jobs

---

## 📋 File Changes Summary

### Updated Files:
1. **src/pages/MyServicesPage.jsx**
   - Now uses `maintenanceAPI.getAllOffers(token)`
   - Added loading state
   - Better error handling with toast notifications
   - Fixed navigation links

2. **src/pages/MyMaintenanceRequestsPage.jsx**
   - Completely rewritten to use maintenanceAPI
   - Added tab filtering (All, Active, Completed, Disputed)
   - Proper authentication with token
   - Better UI with grid layout

3. **src/components/shared/Navbar.jsx**
   - Added NavDropdown for quick navigation
   - Maintenance Hub submenu with all maintenance links
   - Quick Access submenu with all app features

4. **Created: MAINTENANCE_API_DOCS.md**
   - Complete API documentation
   - All endpoint specifications
   - Testing workflow with Postman examples

---

## 🧪 Testing the Fixes

### Step 1: Verify Backend is Running
```bash
# In your backend directory
npm run dev

# Check if API is accessible
curl http://localhost:3000/api/maintenance/requests
# Should return 401 if not authenticated (expected)
```

### Step 2: Login to Frontend
```
1. Go to http://localhost:5173 (or your frontend URL)
2. Click Sign In / Sign Up
3. Create account or login
4. Check console for auth token: 
   console.log(localStorage.getItem('authToken'))
```

### Step 3: Test Pages
```
1. Navigate to: /my-services
2. Should see: "Loading your service offers..." then list
3. Click: "Add New Offer" button
4. Navigate to: /my-maintenance-requests  
5. Should see: "Loading your maintenance requests..." then list
```

### Step 4: Test API Directly (Postman)
```
GET http://localhost:3000/api/maintenance/requests
Headers: Authorization: Bearer {your_token}

Response should be:
{
  "success": true,
  "data": [...]
}
```

---

## 🐛 Debugging Checklist

| Issue | Check | Fix |
|-------|-------|-----|
| 401 Unauthorized | Token in localStorage | Re-login |
| Connection Refused | Backend running? | Start backend server |
| Can't see requests | Logged in? | Login first |
| Empty list | Created requests? | Create via UI or API |
| Can't edit offer | Status is "New"? | Only "New" offers can be edited |

---

## 🔑 Key Implementation Details

### Authentication Flow
```javascript
// In any page:
import { useAuth } from '../hooks/useAuth';
import { maintenanceAPI } from '../services/api';

function MyPage() {
  const { token } = useAuth();  // Get token from context
  
  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      return;
    }
    
    // All API calls need token
    maintenanceAPI.getAllRequests(token)
      .then(response => setData(response.data))
      .catch(error => toast.error(error.message));
  }, [token]);
}
```

### Error Response Handling
```javascript
// API returns error as error.message
// Frontend catches and displays to user via toast

try {
  const response = await maintenanceAPI.getAllOffers(token);
  // Handle response.data or response
} catch (error) {
  // error.message contains server error
  toast.error(error.message);
}
```

### Token Persistence
```javascript
// Token automatically persisted in:
// 1. localStorage.authToken - Survives page refresh
// 2. AuthContext - Available to all components via useAuth()

// On page load, if token exists in localStorage,
// it's automatically loaded in AuthContext
```

---

## 📚 API Endpoints Reference

### Maintenance Requests
```
GET    /maintenance/requests              - Browse all requests
GET    /maintenance/requests/{id}         - Get single request
GET    /maintenance/my-requests           - Get user's requests
POST   /maintenance/requests              - Create new request
DELETE /maintenance/requests/{id}         - Delete request
PATCH  /maintenance/requests/{id}/status  - Update status
```

### Service Offers
```
GET    /maintenance/offers                - Get all offers
GET    /maintenance/offers/{id}           - Get single offer
POST   /maintenance/offers                - Create new offer
PUT    /maintenance/offers/{id}           - Update offer
DELETE /maintenance/offers/{id}           - Delete offer
```

### Applications & Jobs
```
POST   /maintenance/requests/{id}/apply   - Submit offer on request
POST   /maintenance/requests/{id}/offers/{offerId}/accept - Accept offer
POST   /maintenance/requests/{id}/offers/{offerId}/reject - Reject offer
GET    /maintenance/my-jobs               - Get user's accepted jobs
```

### Work Progress
```
PATCH  /maintenance/requests/{id}/status  - Update work status
POST   /maintenance/requests/{id}/confirm - Confirm completion
POST   /maintenance/requests/{id}/review  - Submit review
```

---

## 🛣️ Navigation Flow

### User Journeys

**As a Service Requester:**
```
Home → Maintenance Hub 
    → Create Request 
    → View Offers 
    → Accept Best Offer 
    → Monitor Progress 
    → Confirm Completion 
    → Leave Review
```

**As a Service Provider:**
```
Home → Maintenance Hub 
    → Create Service Offer 
    → Browse Requests 
    → Submit Bids 
    → Accept Job 
    → Manage Progress 
    → Complete Work
```

---

## 💡 Pro Tips

1. **Always check token before API calls**
   ```javascript
   if (!token) {
     toast.error("Please login first");
     return;
   }
   ```

2. **Handle both response.data and direct response**
   ```javascript
   const data = response?.data || response || [];
   ```

3. **Use toast for user feedback**
   ```javascript
   import toast from 'react-hot-toast';
   toast.success("Success!");
   toast.error("Error occurred");
   ```

4. **Add loading states for better UX**
   ```javascript
   const [loading, setLoading] = useState(true);
   // Show spinner while loading
   // Hide when done
   ```

5. **Always wrap async operations in try-catch**
   ```javascript
   try {
     // API call
   } catch (error) {
     console.error(error);
     toast.error(error.message);
   }
   ```

---

## 🚀 Next Steps

### To complete the Maintenance Hub:

1. **Create Maintenance Request Detail Page** 
   - Already routed: `/maintenance/requests/:requestId`
   - Component: `MaintenanceRequestDetailPage.jsx` exists

2. **Create Service Provider Dashboard**
   - Already routed: `/provider-dashboard`
   - Component: `ServiceProviderDashboard.jsx` exists

3. **Add Search & Filter**
   - Use: `maintenanceAPI.searchRequests(filters, token)`
   - Filter by category, budget, location, status

4. **Add Payment Integration**
   - Implement escrow system
   - Payment release on completion confirmation

5. **Add Dispute Resolution**
   - Use: `maintenanceAPI.openDispute(requestId, reason, token)`
   - Admin dashboard for dispute resolution

6. **Add Real-time Notifications**
   - Use Socket.io for offer updates
   - Use: `notificationAPI.getUnreadCount(token)`

---

## 📞 Support

### Common Issues & Solutions

**Q: Pages show "401 Unauthorized"**
A: You need to log in first. Token is required for all protected endpoints.

**Q: Backend returning "404 Not Found"**
A: Check endpoint path - should be `/maintenance/requests` not `/maintenance-requests`

**Q: My requests/offers list is empty**
A: Create a request/offer first via the frontend or test API

**Q: Changes not reflecting immediately**
A: Call `loadRequests()` or `loadOffers()` after creating/updating

**Q: Token expires during session**
A: Implement token refresh in AuthContext or prompt user to re-login

---

## 📝 Documentation Files

- **MAINTENANCE_API_DOCS.md** - Complete API documentation
- **src/App.jsx** - Route definitions
- **src/services/api.js** - API wrapper functions
- **src/hooks/useAuth.jsx** - Authentication hook
- **src/context/AuthContext.jsx** - Auth state management

---

**Last Updated:** 2025-11-30
**Status:** ✅ Ready for Testing


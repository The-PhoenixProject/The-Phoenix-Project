# 🎯 Maintenance & Services Hub - Complete Implementation Guide

## 📋 Quick Start

### Step 1: Understand the System
The Phoenix Maintenance & Services Hub is a **two-sided marketplace** where:
- **Customers** post maintenance/repair jobs and select service providers
- **Service Providers** list their services and bid on requests
- **Payments** are held in escrow until work is confirmed
- **Disputes** can be escalated if issues occur

### Step 2: Start Your Backend
```bash
cd backend
npm run dev
# Should be running on http://localhost:3000/api
```

### Step 3: Test a Flow
1. **Login** to the frontend
2. Go to **Maintenance Hub** (`/maintenance`)
3. Create a **Request** - e.g., "Fix Leaky Faucet"
4. See it appear in `/my-maintenance-requests`
5. (As provider) Go to `/explore-services`
6. Submit an **Offer** on the request
7. (As requester) **Accept the offer**
8. Watch status change to "Matched"

---

## 🔑 Key Files & Their Roles

### API Integration (`src/services/api.js`)
```javascript
export const maintenanceAPI = {
  // Requests (customer side)
  getAllRequests(token)         → Browse all open requests
  getRequestById(requestId, token)
  getMyRequests(token)          → My requests
  createRequest(data, token)    → Post new request
  deleteRequest(requestId, token)

  // Offers (provider side)
  getAllOffers(token)           → Browse services
  createOffer(data, token)      → List new service
  deleteOffer(offerId, token)
  updateOffer(offerId, data, token)
  
  // Applications
  applyToRequest(requestId, offerData, token)
  acceptOffer(requestId, offerId, token)
  rejectOffer(requestId, offerId, token)
  
  // Work Management
  getMyJobs(token)              → My accepted jobs
  updateWorkStatus(requestId, status, token)
  confirmWorkCompletion(requestId, token)
  
  // Extras
  submitReview(requestId, rating, review, token)
  openDispute(requestId, reason, token)
  uploadWorkPhotos(requestId, formData, token)
  searchRequests(filters, token)
}
```

### Pages & Routes

| Page | Route | Purpose | Component |
|------|-------|---------|-----------|
| Maintenance Hub | `/maintenance` | Main dashboard | App.jsx (MaintenanceHomePage) |
| My Requests | `/my-maintenance-requests` | View own requests | MyMaintenanceRequestsPage |
| My Services | `/my-services` | Manage offerings | MyServicesPage |
| Explore Services | `/explore-services` | Browse providers | ExploreServicesPage |
| Request Detail | `/maintenance/requests/:id` | Full request view | MaintenanceRequestDetailPage |
| Provider Dashboard | `/provider-dashboard` | Provider stats | ServiceProviderDashboard |

---

## 🔧 Common Tasks

### How to: Get All Service Offers
```javascript
import { maintenanceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function OffersComponent() {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    if (!token) return;
    
    maintenanceAPI.getAllOffers(token)
      .then(response => {
        const data = response?.data || response || [];
        setOffers(Array.isArray(data) ? data : []);
      })
      .catch(error => console.error(error));
  }, [token]);

  return offers.map(offer => <div key={offer._id}>{offer.serviceName}</div>);
}
```

### How to: Submit an Offer on a Request
```javascript
const handleSubmitOffer = async (requestId, offerData) => {
  try {
    const response = await maintenanceAPI.applyToRequest(
      requestId,
      {
        price: "$75",
        message: "I can complete this work today..."
      },
      token
    );
    toast.success("Offer submitted!");
  } catch (error) {
    toast.error(error.message);
  }
};
```

### How to: Accept an Offer (Requester)
```javascript
const handleAcceptOffer = async (requestId, offerId) => {
  try {
    const response = await maintenanceAPI.acceptOffer(
      requestId,
      offerId,
      token
    );
    toast.success("Offer accepted! Payment held in escrow.");
  } catch (error) {
    toast.error(error.message);
  }
};
```

### How to: Track Work Progress
```javascript
// Provider marks work as complete
await maintenanceAPI.updateWorkStatus(
  requestId,
  "Awaiting Confirmation",  // Status: "In Progress" → "Awaiting Confirmation" → "Completed"
  providerToken
);

// Requester confirms
await maintenanceAPI.confirmWorkCompletion(requestId, requesterToken);
```

---

## 📱 User Journeys

### 🟢 Customer Journey
```
1. LOGIN
   └─ Get authentication token

2. CREATE REQUEST
   ├─ Go to /maintenance
   ├─ Click "Create New Request"
   ├─ Fill form: itemName, category, budget, location
   └─ Request status: "New"

3. BROWSE OFFERS
   └─ Check /my-maintenance-requests to see incoming offers

4. ACCEPT BEST OFFER
   └─ Click "Accept Offer" 
       └─ Status: "New" → "Matched"
       └─ Payment held in escrow

5. MONITOR PROGRESS
   └─ Status progresses:
       "Matched" → "In Progress" → "Awaiting Confirmation"

6. CONFIRM COMPLETION
   └─ Review work
   └─ Click "Confirm Completion"
       └─ Payment released to provider

7. LEAVE REVIEW
   └─ Rate provider (1-5 stars)
   └─ Write feedback
```

### 🔵 Service Provider Journey
```
1. LOGIN
   └─ Get authentication token

2. CREATE SERVICE OFFER
   ├─ Go to /maintenance
   ├─ Click "Add New Offer"
   ├─ Fill: serviceName, category, basePrice, description
   └─ Your offer is now listed

3. BROWSE REQUESTS
   └─ Go to /explore-services
   └─ See all open maintenance requests

4. SUBMIT BIDS
   ├─ Click "Submit Offer" on requests you can do
   ├─ Set price: "$75"
   ├─ Add message: "I can complete in 2 hours"
   └─ Offer status: "pending"

5. WAIT FOR ACCEPTANCE
   └─ Provider notified when offer accepted
       └─ Status: "pending" → "accepted"

6. MANAGE JOB
   └─ Go to /provider-dashboard
   └─ View accepted job

7. START & COMPLETE WORK
   ├─ Click "Start Work"
   │   └─ Status: "Matched" → "In Progress"
   ├─ Upload work photos (optional)
   ├─ Click "Mark as Complete"
   │   └─ Status: "In Progress" → "Awaiting Confirmation"
   └─ Wait for customer confirmation

8. RECEIVE PAYMENT
   └─ Customer confirms work
   └─ Payment released to you
   └─ Status: "Awaiting Confirmation" → "Completed"

9. GET REVIEWED
   └─ Customer leaves review & rating
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete Flow (Same User)
**Best for:** Quick testing of entire system
```
1. Create Request as "Customer"
2. Create Service Offer as "Provider"
3. Accept offer
4. Update status → Complete
5. Confirm completion
6. Submit review
Result: Full workflow tested ✅
```

### Scenario 2: Multiple Offers
**Best for:** Testing offer selection
```
1. Create 1 Request
2. (3 different providers) Submit 3 offers
3. As customer, review all offers
4. Accept best offer
5. Reject others
Result: Offer system tested ✅
```

### Scenario 3: Dispute Handling
**Best for:** Testing escalation
```
1. Complete a request
2. Customer opens dispute with reason
3. Admin reviews and resolves
4. Payment handled per resolution
Result: Dispute system tested ✅
```

---

## ⚠️ Common Issues & Fixes

### Issue: "401 Unauthorized" on every request

**Cause:** Token missing or invalid

**Fix:**
```javascript
// Check token exists
console.log('Token:', localStorage.getItem('authToken'));

// If empty, user not logged in
// Solution: Go to login page first

// If present, might be expired
// Solution: Logout and login again
```

### Issue: "Cannot read property 'map' of undefined"

**Cause:** Response data structure unexpected

**Fix:**
```javascript
// Use defensive coding:
const offersData = response?.data || response || [];
const offers = Array.isArray(offersData) ? offersData : [];
```

### Issue: Offers/Requests not appearing

**Cause:** Calling wrong API endpoint or no data created

**Fix:**
```javascript
// Verify correct endpoint:
// ✅ Correct: /maintenance/offers
// ❌ Wrong:   /myOffers or /offers

// Create test data:
// 1. Create via UI form
// 2. Or POST directly to API via Postman
```

### Issue: Form submission doesn't work

**Cause:** Missing token or validation error

**Fix:**
```javascript
// Always check token first:
if (!token) {
  toast.error("Please login first");
  return;
}

// Add form validation:
if (!formData.price || !formData.message) {
  toast.error("Please fill all required fields");
  return;
}

// Then submit:
await maintenanceAPI.applyToRequest(requestId, formData, token);
```

---

## 📊 Response Format Examples

### Successful Request
```json
{
  "success": true,
  "data": {
    "_id": "req123",
    "itemName": "Fix Washing Machine",
    "status": "New",
    "budget": "$100-150",
    "offers": []
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid token",
  "error": "UNAUTHORIZED"
}
```

### Defensive Response Handling
```javascript
try {
  const response = await maintenanceAPI.getAllRequests(token);
  
  // Handle both formats
  const data = response?.data || response;
  
  // Ensure it's an array
  const requests = Array.isArray(data) ? data : [data];
  
  setRequests(requests);
} catch (error) {
  // error.message from apiCall
  toast.error(error.message);
}
```

---

## 🎨 UI/UX Elements

### Status Badges
```javascript
<span className={`status-${request.status.toLowerCase()}`}>
  {request.status}
</span>

// CSS:
.status-new { background: #e3f2fd; color: #1976d2; }
.status-matched { background: #f3e5f5; color: #7b1fa2; }
.status-in-progress { background: #e8f5e9; color: #388e3c; }
.status-completed { background: #c8e6c9; color: #2e7d32; }
```

### Toast Notifications
```javascript
import toast from 'react-hot-toast';

// Success
toast.success("Offer accepted!");

// Error
toast.error("Failed to update status");

// Loading
toast.loading("Processing...");
```

### Loading States
```javascript
{loading ? (
  <div className="loading">Loading...</div>
) : requests.length > 0 ? (
  requests.map(req => <RequestCard key={req._id} {...req} />)
) : (
  <p>No requests found</p>
)}
```

---

## 🔒 Security Best Practices

### 1. Always Validate Token
```javascript
const { token } = useAuth();
if (!token) {
  // redirect to login or show error
  return;
}
```

### 2. Check User Permissions
```javascript
// Only requester can accept offers
if (currentUser._id !== request.user._id) {
  toast.error("Permission denied");
  return;
}

// Only provider can start work
if (currentUser._id !== offer.provider._id) {
  toast.error("Permission denied");
  return;
}
```

### 3. Sanitize User Input
```javascript
// On backend (already done), but validate on frontend
if (formData.price < 0 || formData.price > 10000) {
  toast.error("Invalid price range");
  return;
}
```

### 4. Handle Token Expiration
```javascript
// When 401 received:
catch (error) {
  if (error.message === "Invalid token") {
    // Token expired
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
}
```

---

## 🚀 Performance Tips

1. **Lazy Load Images**
   ```javascript
   <img src={url} alt="title" loading="lazy" />
   ```

2. **Memoize Expensive Computations**
   ```javascript
   const filteredOffers = useMemo(
     () => offers.filter(offer => offer.status === 'active'),
     [offers]
   );
   ```

3. **Debounce Search**
   ```javascript
   const [searchTerm, setSearchTerm] = useState('');
   const debouncedSearch = useCallback(
     debounce((term) => search(term), 300),
     []
   );
   ```

4. **Use Pagination**
   ```javascript
   // Load 20 items at a time, not all
   GET /maintenance/requests?page=1&limit=20
   ```

---

## 📚 Related Documentation

- **MAINTENANCE_API_DOCS.md** - Complete API reference
- **SETUP_TROUBLESHOOTING.md** - Setup & debugging guide
- **src/App.jsx** - Route definitions
- **src/services/api.js** - API implementations

---

## ✅ Verification Checklist

Before considering a feature complete:

- [ ] API endpoint exists and returns data
- [ ] Frontend retrieves data with token
- [ ] Data displayed in UI correctly
- [ ] Form validation works
- [ ] Success/error messages shown
- [ ] Loading states visible
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Works after page refresh
- [ ] Works after logout/login

---

**Last Updated:** November 30, 2025  
**Ready For:** MVP Testing & Review


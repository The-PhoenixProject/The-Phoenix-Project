# Phoenix - Maintenance & Services Hub API Documentation

## 📋 Overview

The Maintenance & Services Hub is a two-sided marketplace where:
- **Requesters** post maintenance/repair jobs and select service providers
- **Service Providers** list their services and bid on requests
- **Payments** are held in escrow until work is confirmed
- **Disputes** can be resolved by admin if issues arise

---

## 🏗️ Core Structure

### Main Entities
1. **Maintenance Requests** - Posts by customers seeking services
2. **Service Offers** - Bids from service providers on requests
3. **Jobs** - Accepted offers in active progress
4. **Disputes** - Escalations for payment/service issues
5. **Reviews** - Post-completion feedback

---

## 📡 API Endpoints

### 🔷 1. Maintenance Requests

#### Get All Requests (Browse Marketplace)
```
GET /maintenance/requests
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [
    {
      "_id": "req123",
      "itemName": "Fix Washing Machine",
      "category": "Appliances",
      "description": "Machine not spinning...",
      "budget": "$100-150",
      "status": "New",
      "user": { "_id": "user1", "fullName": "John", "avatar": "..." },
      "offers": [],
      "createdAt": "2025-11-30T..."
    }
  ]
}
```

#### Get Single Request Details
```
GET /maintenance/requests/{requestId}
Response:
{
  "success": true,
  "data": {
    "_id": "req123",
    "itemName": "Fix Washing Machine",
    ...full request data...,
    "offers": [
      {
        "_id": "offer1",
        "provider": { "_id": "prov1", "fullName": "Bob", "rating": 4.8 },
        "price": "$120",
        "message": "I can fix this in 1 hour...",
        "status": "pending",
        "createdAt": "..."
      }
    ]
  }
}
```

#### Create New Request
```
POST /maintenance/requests
Headers: Authorization: Bearer {token}, Content-Type: application/json
Body:
{
  "itemName": "Fix Washing Machine",
  "category": "Appliances",
  "description": "Full description of the issue",
  "budget": "$100-150",
  "location": "123 Main St, City",
  "preferredContactTime": "Evenings",
  "image": "base64 or URL"
}
Response:
{
  "success": true,
  "data": { ...created request... }
}
```

#### Delete Own Request
```
DELETE /maintenance/requests/{requestId}
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Request deleted successfully"
}
```

#### Get My Requests (As Requester)
```
GET /maintenance/my-requests
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [ ...list of user's requests... ]
}
```

---

### 🔷 2. Service Offers & Applications

#### Submit Offer on Request
```
POST /maintenance/requests/{requestId}/apply
Headers: Authorization: Bearer {token}
Body:
{
  "price": "$120",
  "message": "I can complete this work in 2 hours. I have 5+ years experience..."
}
Response:
{
  "success": true,
  "data": { ...created offer... }
}
```

#### Accept Offer (Requester Action)
```
POST /maintenance/requests/{requestId}/offers/{offerId}/accept
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Offer accepted! Payment held in escrow.",
  "data": { ...updated offer... }
}
```

#### Reject Offer
```
POST /maintenance/requests/{requestId}/offers/{offerId}/reject
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Offer rejected"
}
```

#### Get All Service Offers (Provider Listings)
```
GET /maintenance/offers
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [ ...list of all service offers... ]
}
```

#### Create Service Offer (List Your Service)
```
POST /maintenance/offers
Headers: Authorization: Bearer {token}
Body:
{
  "serviceName": "Professional Plumbing",
  "category": "Plumbing",
  "description": "Professional plumbing services...",
  "basePrice": "$75/hour",
  "rating": 4.8,
  "experience": "10+ years"
}
Response:
{
  "success": true,
  "data": { ...created service offer... }
}
```

#### Update Service Offer
```
PUT /maintenance/offers/{offerId}
Headers: Authorization: Bearer {token}
Body: { ...fields to update... }
Response: { ...updated offer... }
```

#### Delete Service Offer
```
DELETE /maintenance/offers/{offerId}
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Service offer deleted"
}
```

#### Get Single Service Offer
```
GET /maintenance/offers/{offerId}
Headers: Authorization: Bearer {token}
Response: { ...service offer details... }
```

---

### 🔷 3. Work Status Management

#### Update Work Status
```
PATCH /maintenance/requests/{requestId}/status
Headers: Authorization: Bearer {token}
Body:
{
  "status": "In Progress"  // Options: "In Progress", "Awaiting Confirmation", "Completed"
}
Response: { ...updated request with new status... }
```

**Status Flow:**
- `New` → Request posted
- `Matched` → Offer accepted
- `In Progress` → Provider started work
- `Awaiting Confirmation` → Provider marked complete
- `Completed` → Requester confirmed
- `Disputed` → Payment issue raised

#### Confirm Work Completion (Requester Action)
```
POST /maintenance/requests/{requestId}/confirm
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "message": "Work confirmed! Payment released to service provider.",
  "data": { ...updated request... }
}
```

#### Get My Jobs (As Service Provider)
```
GET /maintenance/my-jobs
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [ ...list of accepted jobs... ]
}
```

---

### 🔷 4. Disputes

#### Open Dispute
```
POST /maintenance/requests/{requestId}/dispute
Headers: Authorization: Bearer {token}
Body:
{
  "reason": "Work quality not satisfactory. Provider did not complete the job as agreed."
}
Response:
{
  "success": true,
  "message": "Dispute opened. Admin will review within 48 hours.",
  "data": { ...dispute details... }
}
```

#### Resolve Dispute (Admin Only)
```
POST /maintenance/requests/{requestId}/dispute/resolve
Headers: Authorization: Bearer {token}
Body:
{
  "resolution": "Refund",  // "Refund", "Payment", "Partial"
  "refundAmount": "$60"
}
Response:
{
  "success": true,
  "message": "Dispute resolved",
  "data": { ...dispute resolution... }
}
```

---

### 🔷 5. Reviews & Ratings

#### Submit Review (After Work Completion)
```
POST /maintenance/requests/{requestId}/review
Headers: Authorization: Bearer {token}
Body:
{
  "rating": 5,  // 1-5 stars
  "review": "Excellent work! Very professional and completed on time."
}
Response:
{
  "success": true,
  "message": "Review submitted",
  "data": { ...review details... }
}
```

---

### 🔷 6. Media & Statistics

#### Upload Work Photos
```
POST /maintenance/requests/{requestId}/photos
Headers: Authorization: Bearer {token}, Content-Type: multipart/form-data
Body: FormData with files (before/after photos)
Response:
{
  "success": true,
  "data": { "photos": [...uploaded photo URLs...] }
}
```

#### Get Request Statistics (Requester Dashboard)
```
GET /maintenance/requests/stats
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": {
    "totalRequests": 15,
    "activeRequests": 3,
    "completedRequests": 10,
    "disputedRequests": 2
  }
}
```

#### Get Provider Statistics (Provider Dashboard)
```
GET /maintenance/provider/stats
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": {
    "totalJobs": 50,
    "completedJobs": 48,
    "averageRating": 4.8,
    "totalEarnings": "$4500"
  }
}
```

#### Search Requests with Filters
```
GET /maintenance/requests/search?category=Plumbing&budget_min=50&budget_max=200&status=New
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [ ...filtered requests... ]
}
```

---

## 🧪 Testing Guide

### Prerequisites
1. **Backend running** on `http://localhost:3000/api`
2. **Logged in user** with valid `authToken`
3. **Postman** or similar API testing tool

### Test Workflow

#### Step 1: Create Request (As Requester)
```bash
POST http://localhost:3000/api/maintenance/requests
Authorization: Bearer {your_token}
Content-Type: application/json

{
  "itemName": "Fix Leaky Faucet",
  "category": "Plumbing",
  "description": "Kitchen sink has been leaking for 3 days",
  "budget": "$50-100",
  "location": "Downtown, City",
  "preferredContactTime": "Saturday afternoon"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "req_abc123",
    "itemName": "Fix Leaky Faucet",
    "status": "New"
  }
}
```

#### Step 2: Browse Requests (As Service Provider)
```bash
GET http://localhost:3000/api/maintenance/requests
Authorization: Bearer {service_provider_token}
```

#### Step 3: Submit Offer
```bash
POST http://localhost:3000/api/maintenance/requests/req_abc123/apply
Authorization: Bearer {service_provider_token}
Content-Type: application/json

{
  "price": "$75",
  "message": "I'm a licensed plumber with 8 years experience. Can complete this same day."
}
```

#### Step 4: Accept Offer (Back as Requester)
```bash
POST http://localhost:3000/api/maintenance/requests/req_abc123/offers/offer_xyz/accept
Authorization: Bearer {requester_token}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Offer accepted! Payment held in escrow.",
  "data": { "status": "Matched" }
}
```

#### Step 5: Start Work (As Provider)
```bash
PATCH http://localhost:3000/api/maintenance/requests/req_abc123/status
Authorization: Bearer {service_provider_token}
Content-Type: application/json

{
  "status": "In Progress"
}
```

#### Step 6: Mark Complete (As Provider)
```bash
PATCH http://localhost:3000/api/maintenance/requests/req_abc123/status
Authorization: Bearer {service_provider_token}
Content-Type: application/json

{
  "status": "Awaiting Confirmation"
}
```

#### Step 7: Confirm Completion (As Requester)
```bash
POST http://localhost:3000/api/maintenance/requests/req_abc123/confirm
Authorization: Bearer {requester_token}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Work confirmed! Payment released to service provider."
}
```

#### Step 8: Submit Review (As Requester)
```bash
POST http://localhost:3000/api/maintenance/requests/req_abc123/review
Authorization: Bearer {requester_token}
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent service! Fixed the issue immediately."
}
```

---

## 🔑 Key Implementation Points

### Authentication
- All protected endpoints require `Authorization: Bearer {token}` header
- Token obtained from login/signup response
- Token stored in `localStorage.authToken` (frontend)

### Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Server Error` - Backend error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

### Response Format
All successful responses follow:
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

---

## 🛠️ Frontend Integration

### Using maintenanceAPI in Components

```javascript
import { maintenanceAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { token } = useAuth();
  
  // Get all requests
  const getRequests = async () => {
    try {
      const response = await maintenanceAPI.getAllRequests(token);
      console.log(response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  
  // Create request
  const createRequest = async (data) => {
    try {
      const response = await maintenanceAPI.createRequest(data, token);
      console.log('Request created:', response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
  
  // Submit offer
  const submitOffer = async (requestId, offerData) => {
    try {
      const response = await maintenanceAPI.applyToRequest(
        requestId,
        offerData,
        token
      );
      console.log('Offer submitted:', response.data);
    } catch (error) {
      console.error('Error:', error.message);
    }
  };
}
```

---

## 📊 Workflow Diagrams

### Requester Workflow
```
1. Login → 2. Create Request → 3. View Offers → 4. Accept Offer
→ 5. Monitor Progress → 6. Confirm Completion → 7. Leave Review
```

### Service Provider Workflow
```
1. Login → 2. List Services → 3. Browse Requests → 4. Submit Offers
→ 5. Wait for Acceptance → 6. Start Work → 7. Mark Complete
→ 8. Receive Payment
```

---

## 🚀 Quick Start Checklist

- [ ] Backend API running and accessible
- [ ] Valid authentication token obtained
- [ ] Frontend components updated to use `maintenanceAPI`
- [ ] All pages wrapped with `<ProtectedRoute>`
- [ ] Token being passed to all API calls
- [ ] Error handling implemented in components
- [ ] UI updated to display request/offer data
- [ ] Toast notifications for success/error messages
- [ ] Loading states for async operations

---

## 📞 Support & Debugging

### Common Issues

**401 Unauthorized**
- Check token validity: `console.log(localStorage.getItem('authToken'))`
- Verify token is passed in Authorization header
- Re-login if token expired

**Connection Refused**
- Ensure backend server running: `http://localhost:3000/api`
- Check VITE_API_URL environment variable
- Verify network connectivity

**404 Not Found**
- Verify requestId/offerId exists
- Check endpoint path spelling
- Ensure resources belong to current user

**Invalid Token**
- Token may have expired
- User needs to log out and log back in
- Check token stored correctly in localStorage

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Prices can be stored as strings or numbers
- Payment is held in escrow until work confirmed
- Reviews are immutable after submission
- Disputes must be reviewed by admin before resolution


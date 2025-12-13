# Troubleshooting 405 Method Not Allowed Error

## Quick Fix Steps

### Step 1: Verify Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Check if `VITE_API_URL` exists and has the correct value:
   - ✅ **Correct**: `https://the-phoenix-project-back-end-production.up.railway.app/api`
   - ❌ **Wrong**: Missing, has extra spaces, or wrong URL

### Step 2: Check What URL is Being Called

1. Open your deployed Vercel app
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Try to login
5. Look for error messages - they should show the actual URL being called
6. Check **Network** tab → Find the failed request → Check the **Request URL**

**Expected URL**: `https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login`

### Step 3: Test Backend Directly

Test if your backend accepts POST requests:

**Option A: Using Browser**
1. Open: `https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login`
2. You should see an error (expected - it needs POST with body)
3. If you see 404, the endpoint doesn't exist
4. If you see 405, the method isn't allowed

**Option B: Using curl (in terminal)**
```bash
curl -X POST https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Expected response**: Should return 400 (bad request) or 401 (unauthorized), NOT 405

### Step 4: Check if Backend Uses `/api` Prefix

Your backend might not use `/api` prefix. Try this:

1. In Vercel, update `VITE_API_URL` to:
   ```
   https://the-phoenix-project-back-end-production.up.railway.app
   ```
   (Remove `/api` from the end)

2. Redeploy your Vercel app

3. Test login again

**Note**: The code will automatically append `/api` if it's missing, but if your backend doesn't use it at all, you need to set it without `/api`.

### Step 5: Check CORS Configuration

A 405 error can sometimes appear if CORS preflight (OPTIONS request) fails:

1. Check Railway backend logs for CORS errors
2. Make sure your backend CORS configuration includes your Vercel domain:
   ```javascript
   // In your backend code
   app.use(cors({
     origin: [
       'https://your-vercel-app.vercel.app',
       'https://your-custom-domain.com',
       'http://localhost:5173'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
   }));
   ```

### Step 6: Redeploy After Changes

**IMPORTANT**: After changing environment variables in Vercel, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete
5. Test again

## Common Issues

### Issue: Environment variable not being read

**Symptoms**: Console shows `http://localhost:3000/api` instead of Railway URL

**Fix**: 
- Verify environment variable is set in Vercel
- Make sure it's set for the correct environment (Production/Preview/Development)
- Redeploy after setting

### Issue: Double `/api` in URL

**Symptoms**: URL shows `/api/api/auth/login`

**Fix**: 
- Set `VITE_API_URL` to: `https://the-phoenix-project-back-end-production.up.railway.app/api`
- Don't include `/api` twice

### Issue: Backend doesn't use `/api` prefix

**Symptoms**: 404 errors, backend routes are at `/auth/login` not `/api/auth/login`

**Fix**: 
- Set `VITE_API_URL` to: `https://the-phoenix-project-back-end-production.up.railway.app`
- (Without `/api` at the end)

## Debug Console Commands

Open browser console on your deployed app and run:

```javascript
// Check environment variable
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Check API base URL (from api.js)
// This will show in the console when you try to login
// Look for: "🔧 API Configuration:" in the console
```

## The Issue You're Seeing

Based on your error: `the-phoenix-project-…ay.app/auth/login:1`

**The problem**: The URL is missing `/api` prefix. It should be `/api/auth/login`.

**The fix**: Make sure your `VITE_API_URL` in Vercel is set to:
```
https://the-phoenix-project-back-end-production.up.railway.app/api
```

**NOT**:
```
https://the-phoenix-project-back-end-production.up.railway.app
```

The code will automatically append `/api` if it's missing, but it's better to include it explicitly.

## Still Not Working?

1. **Check Railway Backend Logs:**
   - Go to Railway Dashboard → Your Project → Deployments → View Logs
   - Look for errors when you try to login

2. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → Deployments → View Function Logs
   - Look for any errors

3. **Verify Backend is Running:**
   - Visit: `https://the-phoenix-project-back-end-production.up.railway.app`
   - Should show your backend (or an error page, not 404)

4. **Test with Postman/Insomnia:**
   - Create a POST request to: `https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body: `{"email":"test@test.com","password":"test"}`
   - If this works, the issue is with the frontend configuration


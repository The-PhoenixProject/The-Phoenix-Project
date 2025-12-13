# Fix 405 Error - Missing /api Prefix

## The Problem

You're seeing this error:
```
the-phoenix-project-back-end-production.up.railway.app/auth/login:1
Failed to load resource: the server responded with a status of 405
```

**The URL is missing `/api` prefix!** It should be:
```
https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login
```

## The Solution

### Step 1: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find or create `VITE_API_URL`
5. Set the value to:
   ```
   https://the-phoenix-project-back-end-production.up.railway.app/api
   ```
   ⚠️ **IMPORTANT**: Must include `/api` at the end!

6. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

7. Click **Save**

### Step 2: Redeploy

**CRITICAL**: After setting/changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### Step 3: Verify

1. Open your deployed Vercel app
2. Open Browser Console (F12)
3. Look for this message:
   ```
   🔧 API Configuration: {
     envUrl: "https://the-phoenix-project-back-end-production.up.railway.app/api",
     apiBaseUrl: "https://the-phoenix-project-back-end-production.up.railway.app/api",
     ...
   }
   ```

4. If you see a warning like:
   ```
   ⚠️ WARNING: API_BASE_URL does not end with /api
   ```
   Then the environment variable is NOT set correctly.

## Common Mistakes

❌ **Wrong**: `https://the-phoenix-project-back-end-production.up.railway.app`
✅ **Correct**: `https://the-phoenix-project-back-end-production.up.railway.app/api`

❌ **Wrong**: `the-phoenix-project-back-end-production.up.railway.app/api` (missing https://)
✅ **Correct**: `https://the-phoenix-project-back-end-production.up.railway.app/api`

❌ **Wrong**: Setting it but not redeploying
✅ **Correct**: Always redeploy after changing environment variables

## Still Not Working?

1. **Check the console** - Look for the `🔧 API Configuration` message
2. **Check Network tab** - See the actual URL being called
3. **Verify in Vercel** - Make sure the variable is saved and enabled for all environments
4. **Redeploy** - This is the most common issue - environment variables only take effect after redeployment

## Quick Test

After redeploying, the console should show:
- ✅ `apiBaseUrl` ends with `/api`
- ✅ No warning messages
- ✅ Login requests go to `/api/auth/login` (not `/auth/login`)


# Deploying to Vercel with Railway Backend

This guide will help you connect your Vercel-deployed frontend to your Railway-deployed backend.

## 🚀 Quick Setup

**Your Railway Backend URL:** `the-phoenix-project-back-end-production.up.railway.app`

**Set this in Vercel:**
- **Variable Name**: `VITE_API_URL`
- **Variable Value**: `https://the-phoenix-project-back-end-production.up.railway.app/api`

👉 **Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables → Add New

## Prerequisites

- ✅ Backend deployed on Railway
- ✅ Frontend repository ready for Vercel deployment
- ✅ Railway backend URL: `the-phoenix-project-back-end-production.up.railway.app`

## Step 1: Get Your Railway Backend URL

1. Go to your Railway dashboard
2. Select your backend project
3. Find your deployment URL (it should look like `https://your-app-name.railway.app`)
4. **Important**: Determine your backend URL structure
   - **If your backend uses `/api` prefix** (routes like `/api/auth/login`):
     - Use: `https://your-app-name.railway.app/api`
   - **If your backend doesn't use `/api` prefix** (routes like `/auth/login`):
     - Use: `https://your-app-name.railway.app`
   
   **Note**: The code will automatically handle the `/api` prefix for HTTP requests. Socket.IO connections will use the base URL you provide.

## Step 2: Set Environment Variable in Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://the-phoenix-project-back-end-production.up.railway.app/api`
     - ⚠️ **Important**: Make sure to include `https://` and `/api` at the end
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add VITE_API_URL

# When prompted, enter your Railway backend URL
# Example: https://your-app-name.railway.app/api
```

## Step 3: Redeploy Your Application

After setting the environment variable, you need to redeploy:

1. **Via Dashboard**: Go to your project → **Deployments** → Click the three dots on the latest deployment → **Redeploy**
2. **Via CLI**: 
   ```bash
   vercel --prod
   ```
3. **Via Git**: Push a new commit to trigger a new deployment

## Step 4: Verify the Connection

1. After deployment, open your Vercel app URL
2. Open browser DevTools (F12) → Console tab
3. Try logging in or making an API call
4. Check the Network tab to see if requests are going to your Railway backend
5. Look for any CORS errors in the console

## Troubleshooting

### CORS Errors

If you see CORS errors, you need to configure your Railway backend to allow requests from your Vercel domain:

1. In your backend code, add your Vercel domain to CORS allowed origins:
   ```javascript
   // Example for Express.js
   app.use(cors({
     origin: [
       'https://your-vercel-app.vercel.app',
       'https://your-custom-domain.com',
       'http://localhost:5173' // for local development
     ],
     credentials: true
   }));
   ```

2. Redeploy your Railway backend after making CORS changes

### 404 Errors on API Calls

- Verify your Railway backend is running and accessible
- Check the Network tab to see the exact URL being called
- Ensure `VITE_API_URL` matches your backend's URL structure:
  - If your backend routes start with `/api`, include `/api` in the URL
  - If your backend routes don't have a prefix, use the base URL without `/api`

### Socket.IO Connection Issues

- Socket.IO uses the same `VITE_API_URL` for connections
- If Socket.IO is served from a different path on your backend, you may need to update the Socket.IO connection code in `Chat.jsx` and `NotificationsPage.jsx`
- Check your backend's Socket.IO configuration to ensure it's accessible from the frontend domain

### 405 Method Not Allowed Error

If you're getting a **405 error** when trying to login or make API calls:

1. **Check the environment variable is set correctly:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `VITE_API_URL` is set to: `https://the-phoenix-project-back-end-production.up.railway.app/api`
   - Make sure there are no extra spaces or quotes

2. **Verify the URL in browser console:**
   - Open your deployed Vercel app
   - Open DevTools (F12) → Console tab
   - Try to login and check the error message
   - Look for the actual URL being called - it should be: `https://the-phoenix-project-back-end-production.up.railway.app/api/auth/login`

3. **Check if backend uses `/api` prefix:**
   - If your backend routes are at `/auth/login` (without `/api`), try setting:
     - `VITE_API_URL` = `https://the-phoenix-project-back-end-production.up.railway.app`
   - The code will automatically append `/api` if needed, but if your backend doesn't use it, remove `/api` from the URL

4. **CORS Configuration:**
   - Make sure your Railway backend allows requests from your Vercel domain
   - Check Railway logs for CORS errors
   - Add your Vercel domain to allowed origins in backend CORS settings

5. **Redeploy after changes:**
   - After changing environment variables, you MUST redeploy
   - Go to Deployments → Click three dots → Redeploy

### Environment Variable Not Working

- Make sure you redeployed after adding the environment variable
- Check that the variable name is exactly `VITE_API_URL` (case-sensitive)
- Verify the value doesn't have trailing slashes (except for `/api` if needed)
- In Vercel dashboard, check that the environment variable is set for the correct environments

## Testing Locally with Railway Backend

To test your local frontend against your Railway backend:

1. Create a `.env.local` file in your project root:
   ```
   VITE_API_URL=https://the-phoenix-project-back-end-production.up.railway.app/api
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Your local frontend will now connect to your Railway backend

## Security Notes

- ✅ Never commit `.env.local` or `.env` files to git
- ✅ The `.env.example` file is safe to commit (it doesn't contain real values)
- ✅ Environment variables in Vercel are encrypted and secure
- ✅ Make sure your Railway backend has proper authentication and rate limiting

## Quick Reference

| Environment | VITE_API_URL Value |
|------------|-------------------|
| Local Dev | `http://localhost:3000/api` |
| Railway Production | `https://the-phoenix-project-back-end-production.up.railway.app/api` |

## Need Help?

- Check Railway logs: Railway Dashboard → Your Project → Deployments → View Logs
- Check Vercel logs: Vercel Dashboard → Your Project → Deployments → View Function Logs
- Verify backend is running: Visit `https://the-phoenix-project-back-end-production.up.railway.app/api/health` (if you have a health endpoint)


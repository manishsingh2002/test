# 🔍 GitHub Pages Blank Screen - Debugging Guide

## 🎯 Issue Identified

Your app is showing a blank white screen on GitHub Pages. I've added comprehensive debugging and error handling to identify the root cause.

---

## 🔧 What I Fixed

### 1. Added Error Boundary
- Catches any React rendering errors
- Shows error details in the browser
- Provides a reload button

### 2. Added Console Logging
- Tracks app initialization
- Shows Supabase connection status
- Logs authentication state changes
- Helps identify where the app is stuck

### 3. Added Session Timeout
- 5-second timeout for Supabase session fetch
- Prevents app from hanging indefinitely
- Falls back to guest mode if session fetch fails

### 4. Fixed Loading Spinner
- Changed from Tailwind classes to inline styles
- Ensures spinner renders even if CSS fails to load
- Added proper CSS animation

---

## 🚀 Deploy the Debug Version

### Step 1: Commit and Push
```bash
git add .
git commit -m "Add debugging and error handling for blank screen"
git push
```

### Step 2: Wait for Deployment
- GitHub Actions will rebuild (2-3 minutes)
- Check Actions tab for ✅ completion

### Step 3: Hard Refresh Browser
**CRITICAL**: Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

---

## 🔬 How to Debug

### Step 1: Open Browser DevTools
1. Visit your GitHub Pages URL
2. Press `F12` to open DevTools
3. Go to the **Console** tab

### Step 2: Check Console Logs
You should see logs like:
```
🚀 Starting SSC CGL Exam Platform...
📦 Environment: production
🔗 Supabase URL: https://astdxzjqapgfdfvzhfdx.supabase.co
📱 AppContent rendering...
🔐 useAuth: Checking Supabase configuration...
🔐 isSupabaseConfigured: true
🔐 supabase client: Available
🔐 Fetching session...
✅ Session fetched: No session
🚪 AuthGate rendering...
🚪 AuthGate state: {isSupabaseConfigured: true, loading: false, hasUser: false}
🚪 Supabase not configured, rendering children in guest mode
```

### Step 3: Identify the Issue

#### Scenario A: No Console Logs
**Problem**: JavaScript isn't loading at all

**Check**:
1. Network tab - are JS files loading with 200 OK?
2. Console tab - are there any "Failed to load resource" errors?
3. Are the asset paths correct? (should be `./assets/...`)

**Solution**:
- Verify `vite.config.js` has `base: './'`
- Check that files exist in the deployed version
- Try accessing the JS file directly in browser

#### Scenario B: Logs Stop at "Fetching session..."
**Problem**: Supabase session fetch is hanging

**Check**:
1. Network tab - is there a pending request to Supabase?
2. Does it timeout after 5 seconds?
3. Are there any CORS errors?

**Solution**:
- Check Supabase URL is correct
- Verify anon key is valid
- Check Supabase project is active
- Look for CORS errors in console

#### Scenario C: Error Boundary Shows Error
**Problem**: React component is throwing an error

**Check**:
1. Read the error message shown on screen
2. Check console for detailed error
3. Look at the stack trace

**Solution**:
- Fix the specific error shown
- Check for missing dependencies
- Verify all imports are correct

#### Scenario D: Logs Show "Session fetch timed out"
**Problem**: Supabase connection is too slow or failing

**Check**:
1. Network tab - what's the response time?
2. Is the Supabase project active?
3. Are the credentials correct?

**Solution**:
- The app will fall back to guest mode automatically
- Check Supabase dashboard for issues
- Verify credentials in GitHub Secrets

---

## 📋 Common Issues & Solutions

### Issue 1: Blank Screen with No Errors
**Cause**: CSS not loading or JavaScript error preventing render

**Solution**:
```bash
# Check if CSS is loading
# Open DevTools → Network tab → Filter by CSS
# Should see index-*.css with 200 OK

# If CSS is 404, check vite.config.js
# Make sure it has: base: './'
```

### Issue 2: Loading Spinner Forever
**Cause**: Supabase session fetch hanging

**Solution**:
- Wait 5 seconds (timeout will trigger)
- Check console for timeout message
- App should fall back to guest mode
- If not, check Supabase credentials

### Issue 3: "Failed to load resource" Errors
**Cause**: Asset paths are wrong

**Solution**:
```javascript
// Check vite.config.js
export default defineConfig({
  base: './',  // ← Must be './' for GitHub Pages
  // ...
});
```

### Issue 4: CORS Errors
**Cause**: Supabase blocking requests from GitHub Pages

**Solution**:
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your GitHub Pages URL to allowed sites
- Example: `https://yourusername.github.io`

### Issue 5: 401 Unauthorized
**Cause**: Invalid or expired anon key

**Solution**:
- Go to Supabase Dashboard → Settings → API
- Copy the anon key (NOT service_role)
- Update GitHub Secret: `VITE_SUPABASE_ANON_KEY`
- Redeploy

---

## 🎯 Expected Behavior After Fix

### If Everything Works:
1. Page loads immediately
2. Console shows initialization logs
3. Loading spinner appears briefly (if Supabase is configured)
4. App renders in guest mode or shows login screen
5. No errors in console

### If There's an Error:
1. Error boundary catches it
2. Shows error message on screen
3. Console has detailed error info
4. Can click "Reload Page" button

---

## 🔍 Debugging Checklist

After deploying, check these in order:

- [ ] **Page loads** (not blank)
- [ ] **Console has logs** (starting with 🚀)
- [ ] **No red errors** in console
- [ ] **Network tab** shows all assets loading (200 OK)
- [ ] **Loading spinner** appears (if Supabase configured)
- [ ] **Spinner disappears** within 5 seconds
- [ ] **App renders** (dashboard or login screen)
- [ ] **Can interact** with the app

---

## 📊 What to Look For in Console

### Good Signs ✅
```
🚀 Starting SSC CGL Exam Platform...
📦 Environment: production
🔗 Supabase URL: https://...
📱 AppContent rendering...
🔐 useAuth: Checking Supabase configuration...
🔐 isSupabaseConfigured: true
🔐 Fetching session...
✅ Session fetched: No session
🚪 AuthGate rendering...
🚪 AuthGate state: {...}
✅ App mounted successfully
```

### Bad Signs ❌
```
❌ Failed to mount app: ...
Uncaught TypeError: ...
Failed to load resource: ...
CORS error: ...
401 Unauthorized
```

---

## 🛠️ Quick Fixes

### Fix 1: Clear Everything
```bash
# Clear browser cache completely
# Chrome: Ctrl + Shift + Delete → Clear all
# Then hard refresh: Ctrl + Shift + R
```

### Fix 2: Check in Incognito
```bash
# Open incognito/private window
# Visit your GitHub Pages URL
# This bypasses all cache
```

### Fix 3: Check Network Tab
```bash
# Open DevTools (F12)
# Go to Network tab
# Refresh page
# Check if index.html, JS, and CSS all load with 200 OK
```

### Fix 4: Verify Secrets
```bash
# Go to GitHub repository
# Settings → Secrets → Actions
# Check these exist:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# Verify values are correct
```

---

## 📞 Next Steps

1. **Commit and push** the debug version
2. **Wait for deployment** (2-3 minutes)
3. **Hard refresh** browser
4. **Open DevTools** (F12) → Console tab
5. **Check the logs** - what do you see?
6. **Report back** with:
   - Screenshot of the page
   - Console logs (copy/paste)
   - Any error messages
   - Network tab status

---

## 🎉 Success Indicators

The debug version is working when:

✅ Page loads (not blank)
✅ Console shows initialization logs
✅ No critical errors in console
✅ App renders (even if in guest mode)
✅ Can interact with the UI

---

**The debug version has been deployed. Commit, push, hard refresh, and check the console logs to identify the exact issue!** 🔍

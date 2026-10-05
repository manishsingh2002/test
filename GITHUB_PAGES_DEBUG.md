# 🔍 Blank Screen Issue - Complete Debugging Setup

## 🎯 What I've Done

I've added comprehensive debugging and error handling to identify why your app shows a blank screen on GitHub Pages.

---

## ✅ Changes Made

### 1. Enhanced Error Handling
- **Error Boundary** in `main.tsx` - Catches React errors and displays them
- **Console Logging** throughout the app - Tracks initialization flow
- **Session Timeout** - 5-second timeout prevents hanging
- **Inline Styles** - Loading spinner uses inline CSS (works even if Tailwind fails)

### 2. Debug Logging Added
```javascript
🚀 Starting SSC CGL Exam Platform...
📦 Environment: production
🔗 Supabase URL: https://...
📱 AppContent rendering...
🔐 useAuth: Checking Supabase configuration...
🔐 Fetching session...
✅ Session fetched: ...
🚪 AuthGate rendering...
```

### 3. Test Page Created
- **`/test.html`** - Simple HTML page to verify GitHub Pages is working
- Tests HTML, CSS, JavaScript, LocalStorage, and Fetch API
- Helps isolate if issue is with GitHub Pages or the React app

### 4. Documentation
- **DEBUG_GUIDE.md** - Comprehensive debugging instructions
- **GITHUB_PAGES_DEBUG.md** - This file

---

## 🚀 Deploy These Changes

### Step 1: Commit and Push
```bash
git add .
git commit -m "Add comprehensive debugging for blank screen issue"
git push
```

### Step 2: Wait for Deployment
- GitHub Actions will rebuild (2-3 minutes)
- Check Actions tab for ✅ completion

### Step 3: Test the Test Page First
Visit: `https://YOUR_USERNAME.github.io/YOUR_REPO/test.html`

This will verify:
- ✅ GitHub Pages is working
- ✅ HTML/CSS/JS are loading
- ✅ No CORS or network issues

### Step 4: Test Main App with Debugging
Visit: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

**CRITICAL**: Hard refresh with `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

---

## 🔬 How to Debug

### Step 1: Open Browser DevTools
1. Press `F12` to open DevTools
2. Go to **Console** tab
3. Look for the debug logs

### Step 2: Check Console Logs

#### If You See Logs Like This (Good):
```
🚀 Starting SSC CGL Exam Platform...
📦 Environment: production
🔗 Supabase URL: https://astdxzjqapgfdfvzhfdx.supabase.co
📱 AppContent rendering...
🔐 useAuth: Checking Supabase configuration...
🔐 isSupabaseConfigured: true
🔐 Fetching session...
✅ Session fetched: No session
🚪 AuthGate rendering...
✅ App mounted successfully
```
**Status**: App is loading correctly! If still blank, check for CSS issues.

#### If Logs Stop at "Fetching session..." (Bad):
```
🔐 Fetching session...
(no more logs)
```
**Problem**: Supabase session fetch is hanging

**Solution**:
- Wait 5 seconds (timeout will trigger)
- Check Supabase URL and anon key in GitHub Secrets
- Verify Supabase project is active

#### If You See Error (Bad):
```
❌ Failed to mount app: TypeError: ...
```
**Problem**: React component is throwing an error

**Solution**:
- Read the error message
- Check the stack trace
- Fix the specific error

#### If No Logs at All (Very Bad):
**Problem**: JavaScript isn't loading

**Solution**:
- Check Network tab - are JS files loading with 200 OK?
- Verify `vite.config.js` has `base: './'`
- Check asset paths in built HTML

### Step 3: Check Network Tab
1. DevTools → Network tab
2. Refresh page
3. Check these files load with **200 OK**:
   - `index.html`
   - `assets/index-*.js`
   - `assets/index-*.css`

If any show **404**, the paths are wrong.

### Step 4: Check for Errors
Look for red error messages in Console:
- `Failed to load resource` → Asset path issue
- `Uncaught TypeError` → JavaScript error
- `401 Unauthorized` → Supabase key issue
- `CORS error` → Supabase configuration issue

---

## 📋 Diagnostic Checklist

After deploying, check these in order:

### Test Page (`/test.html`)
- [ ] Page loads correctly
- [ ] CSS styles are applied
- [ ] JavaScript buttons work
- [ ] LocalStorage test passes
- [ ] Fetch API test passes

### Main App (`/`)
- [ ] Page loads (not blank)
- [ ] Console shows debug logs
- [ ] No critical errors in console
- [ ] Network tab shows all assets (200 OK)
- [ ] Loading spinner appears (if Supabase configured)
- [ ] Spinner disappears within 5 seconds
- [ ] App renders (dashboard or login screen)

---

## 🎯 Common Scenarios

### Scenario 1: Test Page Works, Main App Blank
**Diagnosis**: GitHub Pages is fine, React app has issues

**Check**:
1. Console logs - where does it stop?
2. Network tab - are JS/CSS files loading?
3. Console errors - any red messages?

**Likely Causes**:
- Supabase session fetch hanging
- React component error
- CSS not loading properly

### Scenario 2: Test Page Also Blank
**Diagnosis**: GitHub Pages setup issue

**Check**:
1. Repository is **Public** (required for free GitHub Pages)
2. GitHub Pages is enabled (Settings → Pages)
3. Source is set to **GitHub Actions**
4. Build completed successfully (Actions tab)

**Likely Causes**:
- Repository is private
- GitHub Pages not enabled
- Build failed

### Scenario 3: Loading Spinner Forever
**Diagnosis**: Supabase session fetch hanging

**Check**:
1. Console logs - does it show "Fetching session..."?
2. Network tab - is there a pending request to Supabase?
3. After 5 seconds - does timeout trigger?

**Likely Causes**:
- Supabase URL is wrong
- Anon key is invalid
- Supabase project is inactive
- CORS blocking requests

**Solution**:
- App will fall back to guest mode after 5 seconds
- Check Supabase credentials in GitHub Secrets
- Verify Supabase project is active

### Scenario 4: Error Boundary Shows Error
**Diagnosis**: React component throwing error

**Check**:
1. Read the error message on screen
2. Check console for detailed error
3. Look at stack trace

**Likely Causes**:
- Missing dependency
- Import error
- Undefined variable

**Solution**:
- Fix the specific error shown
- Check all imports are correct
- Verify dependencies are installed

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

### Fix 3: Verify Secrets
```bash
# Go to GitHub repository
# Settings → Secrets → Actions
# Check these exist and are correct:
# - VITE_SUPABASE_URL: https://astdxzjqapgfdfvzhfdx.supabase.co
# - VITE_SUPABASE_ANON_KEY: eyJhbGci...
```

### Fix 4: Check Supabase
```bash
# Go to Supabase Dashboard
# Verify project is active
# Check Settings → API for credentials
# Ensure Email provider is enabled
```

---

## 📊 What to Report Back

After testing, please provide:

1. **Test Page Status**: Does `/test.html` load correctly?
2. **Console Logs**: Copy/paste all console logs from main app
3. **Network Status**: Are all assets loading with 200 OK?
4. **Errors**: Any red error messages in console?
5. **Screenshots**: Of the page and console

This will help identify the exact issue!

---

## 🎉 Success Indicators

The debugging is working when:

✅ Test page loads correctly
✅ Console shows debug logs
✅ Can identify where the app is stuck
✅ Error messages are clear (if any)
✅ Can determine the root cause

---

## 📞 Next Steps

1. **Commit and push** these changes
2. **Wait for deployment** (2-3 minutes)
3. **Test `/test.html`** first
4. **Test main app** with DevTools open
5. **Check console logs** - what do you see?
6. **Report back** with findings

---

## 🔗 Useful Links

- [DEBUG_GUIDE.md](./DEBUG_GUIDE.md) - Detailed debugging instructions
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Vite GitHub Pages Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

---

**The debugging setup is complete! Commit, push, test, and report back with what you find!** 🔍

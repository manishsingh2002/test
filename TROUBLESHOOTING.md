# 🔧 Troubleshooting Guide - Blank White Screen

## Issue: GitHub Pages Shows Blank White Screen

If your deployed site shows a blank white screen, follow these steps to fix it.

---

## ✅ Fixed Issues

### 1. Removed Problematic Scripts
- ❌ Removed SPA routing script from `<head>` (was interfering with initial load)
- ❌ Removed theme detection script (was causing rendering issues)
- ✅ Moved SPA routing handler to end of `<body>` (loads after app)

### 2. Simplified index.html
- Clean, minimal HTML structure
- Relative asset paths (`./assets/...`)
- No blocking scripts in head

### 3. Updated 404.html
- Simpler redirect logic
- Works correctly with GitHub Pages

---

## 🚀 Deploy the Fix

### Step 1: Commit and Push

```bash
git add .
git commit -m "Fix blank screen issue - remove problematic scripts"
git push
```

### Step 2: Wait for Deployment
- GitHub Actions will automatically rebuild
- Takes 2-3 minutes
- Check Actions tab for ✅

### Step 3: Hard Refresh
After deployment, **hard refresh** your browser:
- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

Or clear browser cache completely.

---

## 🔍 If Still Blank - Check These

### 1. Verify Asset Paths

Open browser DevTools (F12) → Console tab

Look for errors like:
```
Failed to load resource: net::ERR_FAILED
```

If you see 404 errors for CSS/JS files, the base path is wrong.

**Fix**: Check `vite.config.js` has `base: './'`

### 2. Check JavaScript Errors

In Console tab, look for:
```
Uncaught TypeError: ...
Uncaught ReferenceError: ...
```

**Common causes**:
- Supabase connection failing
- Missing environment variables
- JavaScript syntax errors

### 3. Verify Supabase Connection

In Console tab, look for:
```
POST https://astdxzjqapgfdfvzhfdx.supabase.co/... 401 (Unauthorized)
```

**Fix**: Check GitHub Secrets:
- `VITE_SUPABASE_URL` is correct
- `VITE_SUPABASE_ANON_KEY` is correct (anon key, NOT service role)

### 4. Check Network Tab

In DevTools → Network tab:
- Refresh the page
- Check if `index.html` loads (200 OK)
- Check if `assets/index-*.js` loads (200 OK)
- Check if `assets/index-*.css` loads (200 OK)

If any show 404, the paths are wrong.

---

## 🛠️ Manual Fixes

### Fix 1: Clear Browser Cache

```bash
# In Chrome/Edge
Ctrl + Shift + Delete → Clear cached images and files

# Or hard refresh
Ctrl + Shift + R
```

### Fix 2: Check GitHub Pages Settings

1. Go to repository → Settings → Pages
2. Verify:
   - Source: **GitHub Actions**
   - Status: ✅ "Your site is live at..."

### Fix 3: Verify Build Output

Locally, check the `dist/` folder:

```bash
npm run build
ls dist/
```

Should see:
```
dist/
├── index.html
├── 404.html
└── assets/
    ├── index-*.js
    └── index-*.css
```

### Fix 4: Test Locally

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` - if it works locally but not on GitHub Pages, it's a path issue.

---

## 📋 Checklist

After deploying the fix, verify:

- [ ] GitHub Actions shows ✅ green checkmark
- [ ] Hard refreshed browser (Ctrl+Shift+R)
- [ ] Cleared browser cache
- [ ] Checked Console tab for errors
- [ ] Checked Network tab - all assets load (200 OK)
- [ ] Verified GitHub Secrets are set correctly
- [ ] Confirmed Supabase URL and anon key are correct

---

## 🎯 Common Causes & Solutions

### Cause 1: Absolute Paths
**Problem**: Assets use `/assets/...` instead of `./assets/...`

**Solution**: Ensure `vite.config.js` has:
```javascript
export default defineConfig({
  base: './',  // ← This is critical
  // ...
});
```

### Cause 2: Blocking Scripts
**Problem**: Scripts in `<head>` block rendering

**Solution**: Move scripts to end of `<body>` or use `defer`

### Cause 3: Missing Environment Variables
**Problem**: Supabase connection fails

**Solution**: Add secrets to GitHub:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Cause 4: SPA Routing Issues
**Problem**: 404.html redirect loop

**Solution**: Use simplified 404.html (already fixed)

### Cause 5: Browser Cache
**Problem**: Old version cached

**Solution**: Hard refresh or clear cache

---

## 🔬 Debug Mode

Add this to see what's happening:

```javascript
// In src/main.tsx, add at the top:
console.log('App starting...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
```

Then check Console tab in browser DevTools.

---

## 📞 Still Not Working?

### Step 1: Check Actions Logs
1. Go to Actions tab
2. Click on the latest workflow run
3. Look for errors in the build/deploy steps

### Step 2: Test in Incognito Mode
Open incognito/private window and visit the URL. This bypasses cache.

### Step 3: Check GitHub Pages URL
Make sure you're visiting the correct URL:
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

Not:
```
https://YOUR_USERNAME.github.io/  ← Wrong (missing repo name)
```

### Step 4: Verify Repository is Public
GitHub Pages only works with **public** repositories (for free accounts).

---

## ✅ Expected Behavior

After the fix, you should see:

1. **Immediate**: Page loads (no blank screen)
2. **Within 1 second**: UI starts rendering
3. **Within 2 seconds**: Full app is visible
4. **Console**: No critical errors (warnings are OK)
5. **Network**: All assets load with 200 OK

---

## 🎉 Success Indicators

The fix is working when:

✅ Page loads immediately (no blank screen)
✅ UI is visible and interactive
✅ No console errors (or only warnings)
✅ All assets load successfully
✅ Supabase connection works
✅ Can sign up and use the app

---

## 📝 Summary

**What was fixed:**
- Removed blocking scripts from `<head>`
- Simplified index.html structure
- Moved SPA routing to end of body
- Updated 404.html for better compatibility

**What to do now:**
1. Commit and push the changes
2. Wait for GitHub Actions to deploy
3. Hard refresh browser
4. Verify the site loads correctly

**If still not working:**
- Check browser console for errors
- Verify GitHub Secrets
- Test locally first
- Clear browser cache completely

---

The blank screen issue should now be resolved! 🎉

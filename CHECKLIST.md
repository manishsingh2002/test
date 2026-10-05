# ✅ Complete Setup Checklist

Use this checklist to ensure everything is properly configured before deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Supabase Configuration

- [ ] Supabase project created
- [ ] SQL schema executed (`supabase/schema.sql`)
- [ ] All tables created (papers, attempts, bookmarks, mistakes, profiles)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Email authentication provider enabled
- [ ] Anon key copied and stored securely

**Verification:**
```bash
# Test Supabase connection
npm run dev
# Try signing up a new user
# Import a test paper
```

---

### 2. Local Environment

- [ ] `.env` file created with correct values
- [ ] `.env` contains:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] `.env` is in `.gitignore`
- [ ] All dependencies installed (`npm install`)
- [ ] Local development server runs without errors
- [ ] All features tested locally

**Verification:**
```bash
npm install
npm run dev
# Test all features:
# - Sign up / Login
# - Import paper
# - Take exam
# - View results
# - Check analytics
```

---

### 3. Git Repository

- [ ] Git initialized (`git init`)
- [ ] `.gitignore` configured properly
- [ ] All files committed
- [ ] No sensitive data in commits
- [ ] Repository created on GitHub
- [ ] Remote added (`git remote add origin ...`)

**Verification:**
```bash
git status  # Should show clean working tree
git log     # Should show your commits
```

---

### 4. GitHub Configuration

- [ ] Repository is **Public** (required for free GitHub Pages)
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] Source set to **GitHub Actions**
- [ ] GitHub Secrets added:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Secrets contain correct values (anon key, NOT service role)

**Verification:**
- Go to Settings → Secrets and variables → Actions
- Verify both secrets exist

---

### 5. Code Configuration

- [ ] `vite.config.js` has `base: './'`
- [ ] `public/404.html` exists (for SPA routing)
- [ ] `index.html` has SPA routing script
- [ ] `.github/workflows/deploy.yml` exists
- [ ] Workflow uses `${{ secrets.VITE_SUPABASE_URL }}`
- [ ] Workflow uses `${{ secrets.VITE_SUPABASE_ANON_KEY }}`

**Verification:**
```bash
# Check vite config
cat vite.config.js | grep "base:"

# Check 404.html exists
ls public/404.html

# Check workflow exists
ls .github/workflows/deploy.yml
```

---

### 6. Security Review

- [ ] Service role key NOT in any file
- [ ] Service role key NOT in GitHub Secrets
- [ ] Only anon key is used in frontend
- [ ] RLS policies protect all user data
- [ ] No hardcoded credentials in code
- [ ] `.env` is gitignored
- [ ] `SECURITY.md` documents security practices

**Verification:**
```bash
# Search for service role key (should find nothing)
grep -r "service_role" . --exclude-dir=node_modules --exclude-dir=.git

# Search for hardcoded URLs (should only find example files)
grep -r "supabase.co" . --exclude-dir=node_modules --exclude-dir=.git
```

---

### 7. Documentation

- [ ] `README.md` is complete and accurate
- [ ] `SETUP.md` explains Supabase setup
- [ ] `DEPLOYMENT.md` explains GitHub Pages deployment
- [ ] `SECURITY.md` documents security practices
- [ ] `SECURITY_ALERT.md` warns about exposed keys
- [ ] All documentation is clear and helpful

---

## 🚀 Deployment Checklist

### Push to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Ready for deployment"

# Push to main branch
git push origin main
```

### Verify Deployment

- [ ] GitHub Actions workflow triggered
- [ ] Build job completed successfully
- [ ] Deploy job completed successfully
- [ ] No errors in Actions logs
- [ ] GitHub Pages shows "Your site is live at..."

**Verification:**
1. Go to Actions tab
2. Click on the latest workflow run
3. Verify both jobs (build and deploy) show ✅
4. Go to Settings → Pages
5. Verify the live URL is shown

---

### Test Live Site

- [ ] Site loads without errors
- [ ] CSS and JavaScript load correctly
- [ ] Supabase connection works
- [ ] Can sign up for new account
- [ ] Can log in
- [ ] Can import a paper
- [ ] Can take an exam
- [ ] Can view results
- [ ] Analytics work
- [ ] All features functional

**Test URL:**
```
https://YOUR_USERNAME.github.io/YOUR_REPO/
```

---

## 🔧 Post-Deployment Checklist

### Monitor Deployment

- [ ] Check Actions tab regularly for failed runs
- [ ] Monitor site for any issues
- [ ] Test after each update

### Update Process

When making changes:

```bash
# 1. Make changes
# 2. Test locally
npm run dev

# 3. Commit and push
git add .
git commit -m "Describe changes"
git push

# 4. Wait for deployment (2-3 minutes)
# 5. Test live site
```

---

## 📊 Final Verification

### Functionality Test

Run through this complete user journey:

1. **First Visit**
   - [ ] Site loads
   - [ ] Demo paper appears
   - [ ] Can see exam library

2. **User Registration**
   - [ ] Can sign up
   - [ ] Receives confirmation email (if enabled)
   - [ ] Can log in

3. **Import Paper**
   - [ ] Can access import page
   - [ ] Can paste JSON
   - [ ] Validation works
   - [ ] Can import successfully
   - [ ] Paper appears in library

4. **Take Exam**
   - [ ] Can start exam
   - [ ] Timer works
   - [ ] Can navigate questions
   - [ ] Can mark for review
   - [ ] Can submit
   - [ ] Auto-submit on timer expiry

5. **View Results**
   - [ ] Results page loads
   - [ ] Score is calculated correctly
   - [ ] Subject performance shown
   - [ ] Topic performance shown
   - [ ] Question analysis works
   - [ ] Learning suggestions shown

6. **Analytics**
   - [ ] Dashboard shows stats
   - [ ] Charts render
   - [ ] Data is accurate
   - [ ] Updates after new attempts

7. **Practice Modes**
   - [ ] Can access practice
   - [ ] Different modes work
   - [ ] Mistakes are tracked
   - [ ] Bookmarks work

---

## 🎉 Success Criteria

Your deployment is **successful** when:

✅ GitHub Actions shows green checkmark
✅ Site is accessible via GitHub Pages URL
✅ All features work correctly
✅ Supabase connection is stable
✅ No console errors
✅ Responsive design works on mobile
✅ Performance is acceptable

---

## 📞 Troubleshooting Resources

If something goes wrong:

1. **Check Actions Logs**: See what failed
2. **Review DEPLOYMENT.md**: Common issues and solutions
3. **Check Browser Console**: Look for JavaScript errors
4. **Verify Secrets**: Ensure they're set correctly
5. **Test Locally**: Confirm it works before deployment

---

## 📝 Notes

- **First deployment** takes 2-3 minutes
- **Subsequent deployments** are faster
- **Clear browser cache** if you see old version
- **Hard refresh** (Ctrl+Shift+R) after updates
- **Check Actions tab** for deployment status

---

## ✅ Final Sign-Off

Before considering deployment complete:

- [ ] All pre-deployment checks passed
- [ ] Code pushed to GitHub
- [ ] GitHub Actions deployment successful
- [ ] Live site tested and working
- [ ] All features verified
- [ ] Documentation reviewed
- [ ] Security checklist completed

---

**Deployment Status:** ⏳ Pending

**Last Updated:** [Date]

**Deployed By:** [Your Name]

**Live URL:** https://YOUR_USERNAME.github.io/YOUR_REPO/

---

Once all items are checked, your SSC CGL Exam Platform is fully deployed and ready for users! 🎉

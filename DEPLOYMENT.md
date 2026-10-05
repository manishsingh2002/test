# 🚀 GitHub Pages Deployment Guide

Complete step-by-step guide to deploy your SSC CGL Exam Platform to GitHub Pages.

---

## 📋 Prerequisites

- [x] GitHub account
- [x] Git installed on your computer
- [x] Node.js 18+ installed
- [x] Supabase project set up (see SETUP.md)
- [x] All tests passing locally

---

## 🎯 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon → **New repository**
3. Fill in:
   - **Repository name**: `ssc-cgl-exam-platform` (or your choice)
   - **Description**: `SSC CGL Exam Preparation Platform with AI-powered question generation`
   - **Public** (required for free GitHub Pages)
   - ❌ Do NOT initialize with README
4. Click **Create repository**

---

### Step 2: Configure GitHub Pages

1. In your new repo, go to **Settings** tab
2. In the left sidebar, click **Pages**
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
4. Leave the page open (we'll come back to verify later)

---

### Step 3: Add GitHub Secrets

You need to add your Supabase credentials as GitHub Secrets so the build process can access them.

1. In your repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add the first secret:
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://astdxzjqapgfdfvzhfdx.supabase.co`
   - Click **Add secret**
4. Click **New repository secret** again
5. Add the second secret:
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: Your anon key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - Click **Add secret**

⚠️ **Important**: 
- Use the **anon key**, NOT the service role key
- Never add the service role key to GitHub Secrets

---

### Step 4: Initialize Git Repository

Open your terminal in the project directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: SSC CGL Exam Platform"

# Add GitHub remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/ssc-cgl-exam-platform.git

# Push to GitHub
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

### Step 5: Trigger Deployment

The GitHub Actions workflow will automatically run when you push to the `main` branch.

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. You should see "Deploy to GitHub Pages" workflow running
4. Wait for it to complete (usually 2-3 minutes)

---

### Step 6: Verify Deployment

1. Go back to **Settings** → **Pages**
2. You should see:
   - ✅ "Your site is live at https://YOUR_USERNAME.github.io/ssc-cgl-exam-platform/"
3. Click the URL to visit your deployed site

---

## 🔧 Troubleshooting

### Issue: Build Fails

**Symptoms**: GitHub Actions shows red X

**Solutions**:
1. Check the Actions tab for error logs
2. Common issues:
   - Missing secrets → Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
   - Node version → Workflow uses Node 20
   - Dependencies → Run `npm install` locally first to verify

### Issue: Page Shows 404

**Symptoms**: Site is deployed but shows blank page or 404

**Solutions**:
1. Verify `vite.config.js` has `base: './'`
2. Check that 404.html exists in `public/` folder
3. Hard refresh browser (Ctrl+Shift+R)

### Issue: Assets Not Loading

**Symptoms**: Page loads but CSS/JS files return 404

**Solutions**:
1. Check browser console for 404 errors
2. Verify the base path in `vite.config.js` is `'./'`
3. Rebuild and redeploy:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push
   ```

### Issue: Supabase Connection Fails

**Symptoms**: App loads but can't connect to Supabase

**Solutions**:
1. Verify secrets are set correctly in GitHub
2. Check that Supabase URL is correct
3. Verify anon key is valid (not expired)
4. Check Supabase dashboard for any issues

---

## 🔄 Updating Your Site

Whenever you make changes:

```bash
# Make your changes
git add .
git commit -m "Describe your changes"
git push
```

GitHub Actions will automatically rebuild and redeploy.

---

## 🌐 Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Follow GitHub's instructions to configure DNS
4. Enable **Enforce HTTPS**

Example: `exam.yourdomain.com`

---

## 📊 Monitoring Deployments

1. Go to **Actions** tab
2. Click on any workflow run to see:
   - Build logs
   - Deployment status
   - Execution time
3. Check **Deployments** tab for deployment history

---

## 🔐 Security Checklist

Before deploying, verify:

- [x] `.env` is in `.gitignore`
- [x] Only anon key is used (not service role)
- [x] GitHub Secrets contain Supabase credentials
- [x] RLS is enabled in Supabase
- [x] No sensitive data in code
- [x] `SECURITY.md` documents security practices

---

## 🎉 Success Indicators

Your deployment is successful when:

✅ GitHub Actions shows green checkmark
✅ Pages settings shows "Your site is live at..."
✅ You can visit the URL and see your app
✅ Supabase connection works
✅ You can sign up and take exams

---

## 📞 Need Help?

If you encounter issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the Actions logs for specific errors
3. Verify all prerequisites are met
4. Check the Troubleshooting section above

---

## 🚀 Quick Deployment Checklist

- [ ] Created GitHub repository
- [ ] Enabled GitHub Pages (source: GitHub Actions)
- [ ] Added VITE_SUPABASE_URL secret
- [ ] Added VITE_SUPABASE_ANON_KEY secret
- [ ] Pushed code to main branch
- [ ] Verified deployment in Actions tab
- [ ] Tested the live site
- [ ] Confirmed Supabase connection works

---

**Your site will be available at:**
`https://YOUR_USERNAME.github.io/ssc-cgl-exam-platform/`

Replace `YOUR_USERNAME` and `ssc-cgl-exam-platform` with your actual GitHub username and repository name.

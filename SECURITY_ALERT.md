# 🚨 Security Alert - Action Required

## ⚠️ CRITICAL: Service Role Key Exposed

You shared your **service role key** in the chat. This is a security risk.

---

## 🎯 Quick Answer to Your Question

**"Is it safe to show the anon key and Supabase URL in GitHub?"**

### ✅ YES - Anon Key & URL are Safe
- **Supabase URL**: Completely public, safe to share
- **Anon Key**: Designed for frontend use, safe with RLS enabled
- **Your app uses these correctly** ✅

### ❌ NO - Service Role Key is NEVER Safe
- **Service Role Key**: Full admin access, bypasses all security
- **You shared this** - Must revoke immediately
- **Never commit to GitHub or share publicly**

---

## 🚨 Immediate Actions (Do This NOW)

### 1. Revoke the Compromised Service Role Key

1. Go to: https://supabase.com/dashboard/
2. Select your project: `astdxzjqapgfdfvzhfdx`
3. Navigate to: **Settings** → **API**
4. Find the **service_role** key
5. Click **"Reset"** or **"Regenerate"**
6. Copy the new key (if needed for server-side use)

### 2. Update Your `.env` File (If Using Service Role Key)

If you're using the service role key anywhere (you shouldn't be in frontend):

```bash
# Update .env with new service role key
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key
```

### 3. Verify `.env` is Gitignored

Check your `.gitignore` includes:
```
.env
.env.local
.env.*.local
```

---

## 🔑 Understanding the Keys

| Key | Safe for GitHub? | Safe for Frontend? | Purpose |
|-----|------------------|-------------------|---------|
| **Project URL** | ✅ Yes | ✅ Yes | Public project endpoint |
| **Anon Key** | ✅ Yes (with RLS) | ✅ Yes | Client-side operations |
| **Service Role Key** | ❌ NEVER | ❌ NEVER | Admin access (server-side only) |

---

## ✅ Your Current Security Status

### What's Secure
- ✅ Frontend only uses anon key (safe)
- ✅ RLS policies protect user data
- ✅ No service role key in frontend code
- ✅ Users can only access their own data

### What Needs Fixing
- ❌ Service role key was shared (revoke it)
- ⚠️ Check if `.env` was committed to Git

---

## 📋 Before Pushing to GitHub

### Checklist

- [ ] Revoked the exposed service role key
- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has placeholder values (not real keys)
- [ ] No service role key in any committed file
- [ ] RLS is enabled on all tables
- [ ] Tested that users can only see their own data

### Safe to Commit
```
✅ src/ (all source code)
✅ supabase/schema.sql
✅ README.md, SETUP.md, SECURITY.md
✅ .env.example (with placeholders)
✅ vite.config.js, package.json
```

### NEVER Commit
```
❌ .env (with real credentials)
❌ .env.local
❌ node_modules/
❌ dist/ (build output)
❌ Any file with service_role key
```

---

## 🔐 How to Use GitHub Secrets (Recommended)

Instead of committing `.env`, use GitHub Secrets:

### 1. Add Secrets to GitHub

Go to your repository:
- **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret**
- Add:
  - Name: `VITE_SUPABASE_URL`
  - Value: `https://astdxzjqapgfdfvzhfdx.supabase.co`
- Add:
  - Name: `VITE_SUPABASE_ANON_KEY`
  - Value: `eyJhbGci...` (your anon key)

### 2. Update GitHub Actions Workflow

Your `.github/workflows/deploy.yml` already uses secrets:

```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

---

## 🛡️ Verify Your Security

### Test RLS is Working

1. Create a test user in your app
2. Import a paper as that user
3. Log out and create another user
4. Try to access the first user's paper
5. **Should fail** (RLS is working) ✅

### Check Supabase Dashboard

1. Go to: **Authentication** → **Policies**
2. Verify all tables have policies:
   - `papers` - "Users can view own papers"
   - `attempts` - "Users can view own attempts"
   - `bookmarks` - "Users can view own bookmarks"
   - `mistakes` - "Users can view own mistakes"
   - `profiles` - "Users can view own profile"

---

## 📚 Documentation

- **SECURITY.md** - Detailed security guide
- **SETUP.md** - Setup instructions
- **README.md** - Project overview

---

## 🎯 Summary

**Your app is secure** because:
- ✅ Only uses anon key in frontend
- ✅ RLS protects all user data
- ✅ No service role key exposed

**What you must do:**
1. 🚨 Revoke the exposed service role key NOW
2. ✅ Ensure `.env` is gitignored
3. ✅ Use GitHub Secrets for CI/CD
4. ✅ Never commit `.env` or service role key

**Safe to share on GitHub:**
- ✅ Supabase URL
- ✅ Anon key (with RLS enabled)

**Never share:**
- ❌ Service role key
- ❌ `.env` file with real credentials

---

## 🆘 Need Help?

If you're unsure:
1. Read **SECURITY.md** for detailed guide
2. Check Supabase Dashboard → Authentication → Policies
3. Test that users can only access their own data
4. Revoke and regenerate the service role key

**The anon key is safe. The service role key is not. Revoke it now.**

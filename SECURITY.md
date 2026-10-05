# 🔒 Security Guide

## ⚠️ IMPORTANT: Immediate Action Required

You shared your **Service Role Key** in the chat. This is a critical security issue.

### 🚨 What You Must Do NOW

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/
2. **Navigate to**: Settings → API
3. **Find**: "service_role" key (the one starting with `eyJ...`)
4. **Click**: "Reset" or "Regenerate" to revoke the old key
5. **Update**: Your `.env` file with the new key (if you're using it server-side)

**Why?** The service role key bypasses all security and gives full admin access to your database.

---

## 🔑 Understanding Supabase Keys

### ✅ Public Keys (Safe to Expose)

#### 1. Project URL
```
https://astdxzjqapgfdfvzhfdx.supabase.co
```
- **Safe to commit to GitHub**: YES
- **Safe to expose in frontend**: YES
- **What it does**: Points to your Supabase project

#### 2. Anon Key (public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
```
- **Safe to commit to GitHub**: YES (with proper RLS)
- **Safe to expose in frontend**: YES
- **What it does**: Limited access key for client-side operations
- **Security**: Respects Row Level Security (RLS) policies

### ❌ Secret Keys (NEVER Expose)

#### 3. Service Role Key (secret)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
```
- **Safe to commit to GitHub**: ❌ NEVER
- **Safe to expose in frontend**: ❌ NEVER
- **What it does**: Full admin access, bypasses ALL security
- **Danger**: Can read/write/delete everything, access all user data

---

## 🛡️ Your Current Setup Security Status

### ✅ What's Secure

1. **Frontend Code**: Only uses anon key (safe)
2. **Database**: RLS policies protect user data
3. **Authentication**: Proper user isolation
4. **No Service Role Key**: Not exposed in frontend

### ⚠️ What Needs Attention

1. **Service Role Key**: You shared it - REVOKE IT NOW
2. **Environment Variables**: Ensure `.env` is in `.gitignore`
3. **GitHub Repository**: Check if `.env` was already committed

---

## 📋 Best Practices for GitHub

### 1. Never Commit `.env` Files

Your `.gitignore` should include:
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Keep example file
!.env.example
```

### 2. Use `.env.example` for Documentation

Create `.env.example` with placeholder values:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. GitHub Actions Secrets

For CI/CD, use GitHub Secrets instead of hardcoding:

**In GitHub Repository:**
- Settings → Secrets and variables → Actions
- Add: `VITE_SUPABASE_URL`
- Add: `VITE_SUPABASE_ANON_KEY`

**In `.github/workflows/deploy.yml`:**
```yaml
env:
  VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### 4. What's Safe to Commit

```
✅ SAFE TO COMMIT:
- src/ (all source code)
- supabase/schema.sql (database structure)
- README.md, SETUP.md, SECURITY.md
- .env.example (with placeholder values)
- vite.config.js, tsconfig.json
- package.json

❌ NEVER COMMIT:
- .env (with real credentials)
- .env.local
- node_modules/
- dist/ (build output)
- Any file with service_role key
```

---

## 🔐 Row Level Security (RLS)

Your app is secure because RLS is enabled on all tables.

### What RLS Does

- Users can only access their own data
- Prevents unauthorized data access
- Works with anon key safely

### Verify RLS is Enabled

1. Go to Supabase Dashboard → Authentication → Policies
2. Check that all tables have policies:
   - `papers` - Users can only see their own papers
   - `attempts` - Users can only see their own attempts
   - `bookmarks` - Users can only see their own bookmarks
   - `mistakes` - Users can only see their own mistakes
   - `profiles` - Users can only see their own profile

### RLS Policies in Your Schema

Your `supabase/schema.sql` includes:

```sql
-- Enable RLS on all tables
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Example policy: Users can only view their own papers
CREATE POLICY "Users can view own papers"
ON papers FOR SELECT
USING (auth.uid() = user_id);
```

---

## 🚨 If You Accidentally Committed `.env`

### Step 1: Remove from Git History

```bash
# Remove .env from git tracking
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from tracking"

# Push to GitHub
git push
```

### Step 2: Rotate Your Keys

Even after removing from Git, the key is still in Git history.

1. Go to Supabase Dashboard → Settings → API
2. Reset your anon key
3. Update `.env` with new key
4. Update GitHub Actions secrets

### Step 3: Check Git History

```bash
# Search for exposed keys in history
git log -p | grep "VITE_SUPABASE"
```

---

## ✅ Security Checklist

Before pushing to GitHub:

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` has placeholder values (not real keys)
- [ ] Service role key is NOT in any committed file
- [ ] RLS is enabled on all tables
- [ ] No hardcoded secrets in source code
- [ ] GitHub Actions uses secrets (not hardcoded values)

---

## 🎯 Quick Answer to Your Question

**"Is it safe to show the anon key and Supabase URL in GitHub?"**

### ✅ YES, IF:
- You're using the **anon key** (not service role key)
- RLS is enabled on all tables
- Users can only access their own data
- No sensitive data is exposed without protection

### ❌ NO, IF:
- You're using the **service role key**
- RLS is not enabled
- Tables are publicly accessible
- Sensitive data is exposed

---

## 📞 Need Help?

If you're unsure about your security setup:

1. **Check Supabase Dashboard** → Authentication → Policies
2. **Verify RLS** is enabled on all tables
3. **Test access** by creating a new user and checking they can only see their own data
4. **Review the schema** in `supabase/schema.sql`

---

## 🔗 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Keys Explained](https://supabase.com/docs/guides/api#api-keys)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Remember**: The anon key is designed to be public, but the service role key is like a master password. Never expose it!

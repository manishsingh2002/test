# 🔧 Fix: workspace_members Table Error

## ❌ Error Message
```
Error: Failed to run sql query: ERROR: 42P01: relation "workspace_members" does not exist
```

## 🔍 Root Cause

The `workspace_members` table is **NOT used** in the SSC CGL Exam Platform. This error occurs when you try to run a SQL script that references this table, but it doesn't exist in your database.

## ✅ Solution

### Option 1: Use the Correct Schema (Recommended)

The SSC CGL Exam Platform uses these tables:
- ✅ `profiles` - User profiles
- ✅ `papers` - Question papers (with visibility field)
- ✅ `attempts` - Exam attempts
- ✅ `attempt_questions` - Individual question responses
- ✅ `bookmarks` - Saved questions
- ✅ `mistakes` - Incorrect answers for review

**Run the correct schema:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy the entire content of `supabase/schema.sql`
3. Paste and run it
4. All tables will be created correctly

### Option 2: Remove workspace_members References

If you have a custom SQL script that references `workspace_members`, remove those lines:

**Before (broken):**
```sql
-- This will fail if workspace_members doesn't exist
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES ('workspace-1', 'user-1', 'admin');
```

**After (fixed):**
```sql
-- Remove workspace_members references entirely
-- The SSC CGL platform doesn't use workspaces
```

### Option 3: Create workspace_members Table (If Needed)

If you actually need this table for some reason, create it first:

```sql
-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

-- Enable RLS
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own workspace memberships" 
  ON workspace_members FOR SELECT 
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own workspace memberships" 
  ON workspace_members FOR INSERT 
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own workspace memberships" 
  ON workspace_members FOR DELETE 
  USING (user_id = auth.uid()::text);
```

---

## 📋 Correct Database Setup Steps

### Step 1: Run the Main Schema

```sql
-- File: supabase/schema.sql
-- This creates all required tables for SSC CGL Exam Platform

-- Run this entire file in Supabase SQL Editor
```

### Step 2: Run the Visibility Migration (If Needed)

If you already have the `papers` table, run this to add the visibility column:

```sql
-- File: supabase/migrations/add_visibility_column.sql

ALTER TABLE papers 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'public'));

CREATE INDEX IF NOT EXISTS idx_papers_visibility ON papers(visibility);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own papers" ON papers;

CREATE POLICY "Users can view own papers" ON papers 
  FOR SELECT USING (user_id = auth.uid()::text);

CREATE POLICY "Anyone can view public papers" ON papers 
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can insert own papers" ON papers 
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "Users can update own papers" ON papers 
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete own papers" ON papers 
  FOR DELETE USING (user_id = auth.uid()::text);
```

---

## 🎯 What Tables Does the App Actually Use?

### Required Tables

| Table | Purpose | Used By |
|-------|---------|---------|
| `profiles` | User profiles | Authentication |
| `papers` | Question papers | Dashboard, Import |
| `attempts` | Exam attempts | Results, Analytics |
| `attempt_questions` | Question responses | Results review |
| `bookmarks` | Saved questions | Bookmarks tab |
| `mistakes` | Incorrect answers | Mistakes tab |

### NOT Used

| Table | Status |
|-------|--------|
| `workspace_members` | ❌ Not used |
| `workspaces` | ❌ Not used |
| `teams` | ❌ Not used |
| `organizations` | ❌ Not used |

---

## 🔍 How to Find the Problematic Script

If you're not sure which script is referencing `workspace_members`:

### Step 1: Check Your SQL Files

```bash
# Search for workspace_members in all SQL files
grep -r "workspace_members" supabase/
```

### Step 2: Check Supabase SQL Editor

If you recently ran a SQL script in Supabase SQL Editor, that's likely the culprit.

### Step 3: Check Migration Files

```bash
# List all migration files
ls -la supabase/migrations/

# Check each migration for workspace_members
grep -l "workspace_members" supabase/migrations/*.sql
```

---

## ✅ Quick Fix

### If you just want to get the app working:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the entire content of `supabase/schema.sql`
3. **Click Run**
4. **Done!** All required tables will be created

### If you want to add visibility support:

1. Run `supabase/schema.sql` first
2. Then run `supabase/migrations/add_visibility_column.sql`
3. Done!

---

## 📊 Database Schema Overview

```
┌─────────────────┐
│    profiles     │ ← User profiles
├─────────────────┤
│ id (UUID)       │
│ display_name    │
│ avatar_url      │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│     papers      │ ← Question papers
├─────────────────┤
│ id              │
│ user_id         │ ← Owner
│ title           │
│ visibility      │ ← 'private' or 'public'
│ raw_json        │ ← Full paper data
│ ...             │
└─────────────────┘

┌─────────────────┐
│    attempts     │ ← Exam attempts
├─────────────────┤
│ id              │
│ user_id         │ ← Who took the exam
│ paper_id        │ ← Which paper
│ score           │
│ accuracy        │
│ ...             │
└─────────────────┘

┌─────────────────────┐
│ attempt_questions   │ ← Individual answers
├─────────────────────┤
│ id                  │
│ attempt_id          │
│ question_id         │
│ selected_answer     │
│ is_correct          │
│ ...                 │
└─────────────────────┘

┌─────────────────┐
│    bookmarks    │ ← Saved questions
├─────────────────┤
│ id              │
│ user_id         │
│ paper_id        │
│ question_id     │
│ category        │
└─────────────────┘

┌─────────────────┐
│    mistakes     │ ← Wrong answers
├─────────────────┤
│ id              │
│ user_id         │
│ paper_id        │
│ question_id     │
│ incorrect_count │
│ resolved        │
└─────────────────┘
```

---

## 🚀 Complete Setup Checklist

- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Run `supabase/schema.sql` (creates all tables)
- [ ] Run `supabase/migrations/add_visibility_column.sql` (adds visibility)
- [ ] Verify all 6 tables exist:
  - [ ] profiles
  - [ ] papers
  - [ ] attempts
  - [ ] attempt_questions
  - [ ] bookmarks
  - [ ] mistakes
- [ ] Verify RLS is enabled on all tables
- [ ] Test the app

---

## 🎉 Summary

**Problem:** SQL script references `workspace_members` table which doesn't exist

**Solution:** 
- ✅ Use the correct schema (`supabase/schema.sql`)
- ✅ Remove `workspace_members` references from custom scripts
- ✅ Or create the table if you actually need it

**Result:** App will work correctly with all required tables

---

**The SSC CGL Exam Platform does NOT use `workspace_members`. Use the correct schema and everything will work!** 🚀

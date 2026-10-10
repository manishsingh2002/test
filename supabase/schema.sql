-- ============================================================
-- SSC CGL Exam Platform — Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAPERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS papers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  exam TEXT NOT NULL DEFAULT 'SSC CGL',
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_marks INTEGER NOT NULL DEFAULT 0,
  negative_marking REAL DEFAULT 0,
  question_count INTEGER NOT NULL DEFAULT 0,
  subjects TEXT[] DEFAULT '{}',
  raw_json JSONB NOT NULL DEFAULT '{}',
  is_demo BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_papers_user_id ON papers(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_exam ON papers(exam);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_papers_visibility ON papers(visibility);

-- ============================================================
-- ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  paper_id TEXT NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  paper_title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score REAL NOT NULL DEFAULT 0,
  total_marks REAL NOT NULL DEFAULT 0,
  accuracy REAL NOT NULL DEFAULT 0,
  attempted_count INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  unanswered_count INTEGER NOT NULL DEFAULT 0,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  is_complete BOOLEAN DEFAULT FALSE,
  mode TEXT DEFAULT 'exam' CHECK (mode IN ('exam', 'practice'))
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_paper_id ON attempts(paper_id);
CREATE INDEX IF NOT EXISTS idx_attempts_started_at ON attempts(started_at DESC);

-- ============================================================
-- ATTEMPT QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attempt_questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_index INTEGER NOT NULL DEFAULT 0,
  selected_answer INTEGER,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  marked_for_review BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_attempt_questions_attempt_id ON attempt_questions(attempt_id);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  paper_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  question_text TEXT DEFAULT '',
  category TEXT DEFAULT 'important' CHECK (category IN ('important', 'difficult', 'revise_later', 'shortcut', 'formula', 'doubt')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, paper_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- ============================================================
-- MISTAKES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS mistakes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  paper_id TEXT NOT NULL,
  paper_title TEXT DEFAULT '',
  question_id TEXT NOT NULL,
  question_text TEXT DEFAULT '',
  subject TEXT DEFAULT '',
  topic TEXT DEFAULT '',
  selected_answer INTEGER,
  correct_answer INTEGER NOT NULL,
  options TEXT[] DEFAULT '{}',
  solution TEXT,
  shortcut TEXT,
  hint TEXT,
  learning_suggestion TEXT,
  incorrect_count INTEGER DEFAULT 1,
  last_attempted_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_mistakes_user_id ON mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_resolved ON mistakes(resolved) WHERE resolved = FALSE;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Papers: Users can see their own papers + all public papers
-- Own papers (private or public)
CREATE POLICY "Users can view own papers" ON papers FOR SELECT USING (user_id = auth.uid()::text);
-- Public papers visible to everyone (including anonymous users)
CREATE POLICY "Anyone can view public papers" ON papers FOR SELECT USING (visibility = 'public');
-- Users can insert their own papers
CREATE POLICY "Users can insert own papers" ON papers FOR INSERT WITH CHECK (user_id = auth.uid()::text);
-- Users can only update their own papers
CREATE POLICY "Users can update own papers" ON papers FOR UPDATE USING (user_id = auth.uid()::text);
-- Users can only delete their own papers
CREATE POLICY "Users can delete own papers" ON papers FOR DELETE USING (user_id = auth.uid()::text);

-- Attempts: Users can only see their own attempts
CREATE POLICY "Users can view own attempts" ON attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own attempts" ON attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own attempts" ON attempts FOR UPDATE USING (user_id = auth.uid()::text);

-- Attempt Questions: Access through attempts
CREATE POLICY "Users can view own attempt questions" ON attempt_questions FOR SELECT USING (
  attempt_id IN (SELECT id FROM attempts WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can insert own attempt questions" ON attempt_questions FOR INSERT WITH CHECK (
  attempt_id IN (SELECT id FROM attempts WHERE user_id = auth.uid()::text)
);

-- Bookmarks: Users can only manage their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (user_id = auth.uid()::text);

-- Mistakes: Users can only manage their own mistakes
CREATE POLICY "Users can view own mistakes" ON mistakes FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can insert own mistakes" ON mistakes FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update own mistakes" ON mistakes FOR UPDATE USING (user_id = auth.uid()::text);

-- Profiles: Users can only manage their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (id = auth.uid()::text);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (id = auth.uid()::text);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Migration: Add visibility column to papers table
-- Run this if you already have the papers table created

-- Add visibility column with default 'private'
ALTER TABLE papers 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));

-- Create index for visibility filtering
CREATE INDEX IF NOT EXISTS idx_papers_visibility ON papers(visibility);

-- Update RLS policies to allow public papers to be visible to everyone
-- First, drop the old policy if it exists
DROP POLICY IF EXISTS "Users can view own papers" ON papers;

-- Create new policies
-- Users can see their own papers (private or public)
CREATE POLICY "Users can view own papers" ON papers FOR SELECT USING (user_id = auth.uid()::text);

-- Everyone can see public papers (including anonymous users)
CREATE POLICY "Anyone can view public papers" ON papers FOR SELECT USING (visibility = 'public');

-- Users can insert their own papers
CREATE POLICY "Users can insert own papers" ON papers FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own papers
CREATE POLICY "Users can update own papers" ON papers FOR UPDATE USING (user_id = auth.uid()::text);

-- Users can delete their own papers
CREATE POLICY "Users can delete own papers" ON papers FOR DELETE USING (user_id = auth.uid()::text);

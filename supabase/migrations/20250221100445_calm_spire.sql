/*
  # Match System Updates

  1. New Columns
    - Add score_type column to matches table
    - Add match_type column to matches table
    - Add highlights_url column to matches table

  2. Security
    - Drop existing policies
    - Create new policies for matches table
    - Add indexes for new columns
*/

-- Add new columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS score_type text CHECK (score_type IN ('points', 'kills', 'combined')) DEFAULT 'combined',
ADD COLUMN IF NOT EXISTS match_type text CHECK (match_type IN ('qualifier', 'group', 'semifinal', 'final')) DEFAULT 'group',
ADD COLUMN IF NOT EXISTS highlights_url text;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view matches" ON matches;
  DROP POLICY IF EXISTS "Admins can manage matches" ON matches;
END $$;

-- Create new policies
CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage matches"
  ON matches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create index for new columns
CREATE INDEX IF NOT EXISTS idx_matches_match_type ON matches(match_type);
CREATE INDEX IF NOT EXISTS idx_matches_score_type ON matches(score_type);
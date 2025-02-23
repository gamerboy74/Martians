/*
  # Create leaderboard table

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references registrations)
      - `survival_points` (integer)
      - `kill_points` (integer)
      - `total_points` (integer)
      - `matches_played` (integer)
      - `wins` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leaderboard` table
    - Add policies for authenticated users
*/

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES registrations(id) ON DELETE CASCADE,
  survival_points integer DEFAULT 0,
  kill_points integer DEFAULT 0,
  total_points integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for leaderboard"
  ON leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage leaderboard"
  ON leaderboard FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_team_id ON leaderboard(team_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_points ON leaderboard(total_points DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
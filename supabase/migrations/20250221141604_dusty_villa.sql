/*
  # Fix Matches RLS Policies

  1. Changes
    - Drop existing matches policies
    - Create new policies for matches table with proper access control
    - Allow authenticated users to view matches
    - Allow authenticated users to manage matches
    
  2. Security
    - Enable RLS on matches table
    - Add policies for read and write access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;
DROP POLICY IF EXISTS "Admins can manage matches" ON matches;
DROP POLICY IF EXISTS "Enable read access for all users" ON matches;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON matches FOR DELETE
  TO authenticated
  USING (true);
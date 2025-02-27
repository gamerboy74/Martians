/*
  # Add Tournament RLS Policies

  1. Changes
    - Add policies to allow authenticated users to create tournaments
    - Add policies to allow tournament creators to manage their own tournaments
    - Maintain existing admin policies

  2. Security
    - Ensures tournament creators can only modify their own tournaments
    - Maintains read access for all authenticated users
    - Preserves admin access to all tournaments
*/

-- Add creator_id column to tournaments table
ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing tournament policies
DROP POLICY IF EXISTS "Anyone can read tournaments" ON tournaments;
DROP POLICY IF EXISTS "Admins can manage tournaments" ON tournaments;

-- Create new tournament policies
CREATE POLICY "Enable read access for authenticated users"
  ON tournaments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable tournament creation for authenticated users"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Enable update for tournament creators"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Enable delete for tournament creators"
  ON tournaments FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Enable all access for admins"
  ON tournaments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create index for creator_id
CREATE INDEX IF NOT EXISTS idx_tournaments_creator_id ON tournaments(creator_id);
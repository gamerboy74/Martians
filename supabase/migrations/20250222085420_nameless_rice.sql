/*
  # Update Tournament Policies

  1. Changes
    - Drop existing restrictive tournament policies
    - Create new permissive policies for authenticated users
    - Allow authenticated users to perform all operations on tournaments

  2. Security
    - Maintains read access for all users
    - Requires authentication for write operations
    - Removes creator/admin restrictions
*/

-- Drop existing tournament policies
DROP POLICY IF EXISTS "Public read access for tournaments" ON tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Creators and admins can update tournaments" ON tournaments;
DROP POLICY IF EXISTS "Creators and admins can delete tournaments" ON tournaments;

-- Create new tournament policies
CREATE POLICY "Enable read access for all users"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON tournaments FOR DELETE
  TO authenticated
  USING (true);
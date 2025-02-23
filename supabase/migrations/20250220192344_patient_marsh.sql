/*
  # Update Registration Policies

  1. Changes
    - Drop existing registration policies
    - Add new policies for public registration access
    - Enable registration creation for authenticated users
    - Allow admins full access to registrations
    
  2. Security
    - Maintains RLS
    - Updates policies to allow registration creation
    - Preserves admin access
*/

-- Drop existing registration policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can read own registrations" ON registrations;
  DROP POLICY IF EXISTS "Users can create registrations" ON registrations;
  DROP POLICY IF EXISTS "Admins can manage registrations" ON registrations;
END $$;

-- Create new registration policies
CREATE POLICY "Public read access for registrations"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all registrations"
  ON registrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
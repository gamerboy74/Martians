/*
  # Fix Registration RLS Policies

  1. Changes
    - Drop existing restrictive policies
    - Add new policies to allow:
      - Public read access for approved registrations
      - Authenticated users to create registrations
      - Registration creators to update their own registrations
      - Admins to manage all registrations
  
  2. Security
    - Enable RLS
    - Add appropriate policies for CRUD operations
*/

-- Drop existing registration policies
DROP POLICY IF EXISTS "Public read access for registrations" ON registrations;
DROP POLICY IF EXISTS "Authenticated users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Admins can manage all registrations" ON registrations;

-- Create new registration policies
CREATE POLICY "Public read access for approved registrations"
  ON registrations FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can read own registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create registrations"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure user_id matches authenticated user
    auth.uid() IS NOT NULL AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own registrations"
  ON registrations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

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

-- Create function to automatically set user_id
CREATE OR REPLACE FUNCTION set_registration_user_id()
RETURNS trigger AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set user_id automatically
DROP TRIGGER IF EXISTS set_registration_user_id_trigger ON registrations;
CREATE TRIGGER set_registration_user_id_trigger
  BEFORE INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_registration_user_id();
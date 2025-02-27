-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable insert for all users" ON registrations;
DROP POLICY IF EXISTS "Enable update for admins" ON registrations;
DROP POLICY IF EXISTS "Enable delete for admins" ON registrations;

-- Create new policies
CREATE POLICY "Enable read access for all users"
  ON registrations FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON registrations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for admins"
  ON registrations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
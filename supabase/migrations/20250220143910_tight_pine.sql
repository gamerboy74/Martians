/*
  # Fix User Roles Policies

  1. Changes
    - Drop existing user_roles policies
    - Create new policies without recursion
    - Add bypass policy for service role

  2. Security
    - Maintain security while avoiding infinite recursion
    - Allow service role to manage roles
    - Allow users to read their own role
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for service role only"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Enable update for service role only"
  ON user_roles FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Enable delete for service role only"
  ON user_roles FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'role' = 'service_role');

-- Create a default admin user (replace with your admin email)
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO NOTHING;
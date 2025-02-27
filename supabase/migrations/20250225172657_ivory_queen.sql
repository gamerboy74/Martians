-- Create maintenance_settings table
CREATE TABLE IF NOT EXISTS maintenance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE maintenance_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON maintenance_settings FOR SELECT
  USING (true);

CREATE POLICY "Enable update for admins"
  ON maintenance_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Insert initial record
INSERT INTO maintenance_settings (is_enabled) VALUES (false);

-- Create trigger for updated_at and updated_by
CREATE OR REPLACE FUNCTION update_maintenance_settings_metadata()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_maintenance_settings_metadata
  BEFORE UPDATE ON maintenance_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_settings_metadata();
-- Create featured_games table
CREATE TABLE IF NOT EXISTS featured_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  tournaments_count integer DEFAULT 0,
  players_count text DEFAULT '0',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE featured_games ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for featured_games"
  ON featured_games FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage featured_games"
  ON featured_games FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_featured_games_sort_order ON featured_games(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_featured_games_updated_at
  BEFORE UPDATE ON featured_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
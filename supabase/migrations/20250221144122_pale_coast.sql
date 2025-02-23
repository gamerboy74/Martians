-- Drop existing policies
DROP POLICY IF EXISTS "Public read access for featured_games" ON featured_games;
DROP POLICY IF EXISTS "Admins can manage featured_games" ON featured_games;

-- Create simplified policies
CREATE POLICY "Enable read access for all users"
  ON featured_games FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON featured_games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON featured_games FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
  ON featured_games FOR DELETE
  TO authenticated
  USING (true);

-- Add some sample data
INSERT INTO featured_games (title, category, image_url, tournaments_count, players_count, sort_order)
VALUES 
  ('FIRE SOULS', 'ACTION RPG', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop', 5, '10K+', 0),
  ('CYBER REALM', 'CYBERPUNK', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop', 3, '8K+', 1),
  ('NEON WARRIORS', 'FIGHTING', 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=800&h=600&fit=crop', 4, '15K+', 2);
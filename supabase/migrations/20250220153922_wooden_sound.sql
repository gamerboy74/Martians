/*
  # Update tournament policies and triggers

  1. Changes
    - Drop existing tournament policies
    - Create new tournament policies for public read access
    - Add trigger for setting creator_id on new tournaments

  2. Security
    - Public read access for all tournaments
    - Create access for authenticated users
    - Update/Delete access for creators and admins only
    - Automatic creator_id setting via trigger
*/

DO $$ BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tournaments;
  DROP POLICY IF EXISTS "Enable tournament creation for authenticated users" ON tournaments;
  DROP POLICY IF EXISTS "Enable update for tournament creators" ON tournaments;
  DROP POLICY IF EXISTS "Enable delete for tournament creators" ON tournaments;
  DROP POLICY IF EXISTS "Enable all access for admins" ON tournaments;
  DROP POLICY IF EXISTS "Public read access for tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Creators and admins can update tournaments" ON tournaments;
  DROP POLICY IF EXISTS "Creators and admins can delete tournaments" ON tournaments;
END $$;

-- Create new tournament policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tournaments' 
    AND policyname = 'Public read access for tournaments'
  ) THEN
    CREATE POLICY "Public read access for tournaments"
      ON tournaments FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tournaments' 
    AND policyname = 'Authenticated users can create tournaments'
  ) THEN
    CREATE POLICY "Authenticated users can create tournaments"
      ON tournaments FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tournaments' 
    AND policyname = 'Creators and admins can update tournaments'
  ) THEN
    CREATE POLICY "Creators and admins can update tournaments"
      ON tournaments FOR UPDATE
      TO authenticated
      USING (
        auth.uid() = creator_id OR
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tournaments' 
    AND policyname = 'Creators and admins can delete tournaments'
  ) THEN
    CREATE POLICY "Creators and admins can delete tournaments"
      ON tournaments FOR DELETE
      TO authenticated
      USING (
        auth.uid() = creator_id OR
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_id = auth.uid()
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create function to handle tournament creation if it doesn't exist
CREATE OR REPLACE FUNCTION handle_new_tournament()
RETURNS trigger AS $$
BEGIN
  NEW.creator_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS set_tournament_creator ON tournaments;
CREATE TRIGGER set_tournament_creator
  BEFORE INSERT ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_tournament();
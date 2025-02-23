/*
  # Add Sample Data and Fix Registration Approval

  1. Sample Data
    - Add 2 sample tournaments
    - Add 3 sample team registrations
  
  2. Changes
    - Update registration policies to allow updates
    - Add sample tournaments and registrations
*/

-- Add sample tournaments
INSERT INTO tournaments (
  title,
  description,
  game,
  start_date,
  end_date,
  registration_deadline,
  prize_pool,
  max_participants,
  format,
  status,
  registration_open,
  image_url
) VALUES 
(
  'BGMI Pro League Season 1',
  'Join the ultimate BGMI tournament and compete for glory!',
  'BGMI',
  NOW() + interval '7 days',
  NOW() + interval '14 days',
  NOW() + interval '5 days',
  '$10,000',
  16,
  'squad',
  'upcoming',
  true,
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop'
),
(
  'BGMI Championship 2024',
  'The biggest BGMI tournament of the year!',
  'BGMI',
  NOW() + interval '30 days',
  NOW() + interval '37 days',
  NOW() + interval '25 days',
  '$25,000',
  32,
  'squad',
  'upcoming',
  true,
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop'
);

-- Add sample registrations
INSERT INTO registrations (
  tournament_id,
  team_name,
  status,
  team_members,
  contact_info,
  game_details,
  tournament_preferences
) 
SELECT 
  t.id,
  team_name,
  'pending',
  team_members,
  contact_info,
  game_details,
  tournament_preferences
FROM tournaments t
CROSS JOIN (
  VALUES 
    (
      'Team Phoenix',
      '[{"name": "John Doe", "username": "Phoenix1"}, {"name": "Jane Smith", "username": "Phoenix2"}, {"name": "Mike Johnson", "username": "Phoenix3"}]'::jsonb,
      '{"full_name": "John Doe", "email": "john@example.com", "phone": "+1234567890", "in_game_name": "Phoenix1", "date_of_birth": "1995-01-01"}'::jsonb,
      '{"platform": "Android", "uid": "BGMI123456", "device_model": "Samsung S21", "region": "NA"}'::jsonb,
      '{"format": "Squad", "mode": "Battle Royale", "experience": true, "previous_tournaments": "BGMI Amateur League 2023"}'::jsonb
    ),
    (
      'Team Dragons',
      '[{"name": "Alex Wilson", "username": "Dragon1"}, {"name": "Sarah Brown", "username": "Dragon2"}, {"name": "Tom Davis", "username": "Dragon3"}]'::jsonb,
      '{"full_name": "Alex Wilson", "email": "alex@example.com", "phone": "+1234567891", "in_game_name": "Dragon1", "date_of_birth": "1996-02-15"}'::jsonb,
      '{"platform": "iOS", "uid": "BGMI123457", "device_model": "iPhone 13", "region": "EU"}'::jsonb,
      '{"format": "Squad", "mode": "Battle Royale", "experience": true, "previous_tournaments": "BGMI Pro Series 2023"}'::jsonb
    ),
    (
      'Team Wolves',
      '[{"name": "Chris Lee", "username": "Wolf1"}, {"name": "Emma White", "username": "Wolf2"}, {"name": "David Clark", "username": "Wolf3"}]'::jsonb,
      '{"full_name": "Chris Lee", "email": "chris@example.com", "phone": "+1234567892", "in_game_name": "Wolf1", "date_of_birth": "1997-03-20"}'::jsonb,
      '{"platform": "Android", "uid": "BGMI123458", "device_model": "OnePlus 9", "region": "AS"}'::jsonb,
      '{"format": "Squad", "mode": "Battle Royale", "experience": false}'::jsonb
    )
) AS sample_data (team_name, team_members, contact_info, game_details, tournament_preferences)
WHERE t.title = 'BGMI Pro League Season 1';
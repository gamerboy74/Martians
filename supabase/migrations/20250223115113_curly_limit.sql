/*
  # Add logo_url column to registrations table

  1. Changes
    - Add logo_url column to registrations table
    - Add index for logo_url column for better query performance
*/

-- Add logo_url column if it doesn't exist
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS logo_url text;

-- Create index for logo_url
CREATE INDEX IF NOT EXISTS idx_registrations_logo_url ON registrations(logo_url);
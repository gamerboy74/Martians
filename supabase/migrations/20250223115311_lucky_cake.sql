/*
  # Remove email notification functions and triggers

  1. Changes
    - Drop email notification functions and triggers that depend on net schema
    - Clean up related database objects
*/

-- Drop triggers first
DROP TRIGGER IF EXISTS on_registration_insert ON registrations;
DROP TRIGGER IF EXISTS on_registration_update ON registrations;

-- Drop functions
DROP FUNCTION IF EXISTS handle_registration_notification();
DROP FUNCTION IF EXISTS send_registration_email(text, text, text, text);
-- Create email templates
CREATE OR REPLACE FUNCTION send_registration_email(
  p_email text,
  p_team_name text,
  p_tournament_title text,
  p_status text
) RETURNS void AS $$
DECLARE
  v_subject text;
  v_content text;
BEGIN
  -- Set email subject and content based on status
  CASE p_status
    WHEN 'pending' THEN
      v_subject := 'Tournament Registration Received - ' || p_team_name;
      v_content := format(
        'Dear %s,\n\n' ||
        'Thank you for registering for the tournament: %s\n\n' ||
        'Your registration is currently under review. We will notify you once it has been processed.\n\n' ||
        'Best regards,\nTournament Admin Team',
        p_team_name, p_tournament_title
      );
    WHEN 'approved' THEN
      v_subject := 'Tournament Registration Approved - ' || p_team_name;
      v_content := format(
        'Dear %s,\n\n' ||
        'Congratulations! Your registration for the tournament: %s has been approved.\n\n' ||
        'You can now access all tournament details and schedules through your dashboard.\n\n' ||
        'Best regards,\nTournament Admin Team',
        p_team_name, p_tournament_title
      );
    WHEN 'rejected' THEN
      v_subject := 'Tournament Registration Status - ' || p_team_name;
      v_content := format(
        'Dear %s,\n\n' ||
        'We regret to inform you that your registration for the tournament: %s could not be approved at this time.\n\n' ||
        'Please feel free to register for our future tournaments.\n\n' ||
        'Best regards,\nTournament Admin Team',
        p_team_name, p_tournament_title
      );
  END CASE;

  -- Send email using Supabase's built-in email functionality
  PERFORM net.http_post(
    url := 'https://api.supabase.com/v1/email/send',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', current_setting('request.headers')::json->>'apikey'
    ),
    body := jsonb_build_object(
      'to', p_email,
      'subject', v_subject,
      'content', v_content
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for registration notifications
CREATE OR REPLACE FUNCTION handle_registration_notification()
RETURNS trigger AS $$
DECLARE
  v_email text;
  v_tournament_title text;
BEGIN
  -- Get email from contact_info
  v_email := (NEW.contact_info->>'email')::text;
  
  -- Get tournament title
  SELECT title INTO v_tournament_title
  FROM tournaments
  WHERE id = NEW.tournament_id;

  -- Send appropriate email based on status
  PERFORM send_registration_email(
    v_email,
    NEW.team_name,
    v_tournament_title,
    NEW.status
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for registration notifications
DROP TRIGGER IF EXISTS on_registration_insert ON registrations;
CREATE TRIGGER on_registration_insert
  AFTER INSERT ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION handle_registration_notification();

DROP TRIGGER IF EXISTS on_registration_update ON registrations;
CREATE TRIGGER on_registration_update
  AFTER UPDATE OF status ON registrations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_registration_notification();
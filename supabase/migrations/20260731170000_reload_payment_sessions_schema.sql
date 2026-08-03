-- Ensure PostgREST schema cache includes payment_sessions for Edge Function inserts.
notify pgrst, 'reload schema';

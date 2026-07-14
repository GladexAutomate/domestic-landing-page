-- Paste this in: Supabase Dashboard → SQL Editor → New query → Run
-- This schedules the sync-fusioo function to run every 30 minutes.
-- Only needs to be run ONCE.

select cron.schedule(
  'sync-fusioo-every-30min',
  '*/30 * * * *',
  $$
    select net.http_post(
      url     := 'https://snploarndnyuxapqpegi.supabase.co/functions/v1/sync-fusioo',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNucGxvYXJuZG55dXhhcHFwZWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjM2NjYsImV4cCI6MjA5OTIzOTY2Nn0.WwxbaAUXkscntqSQrA4MNNaAhRO5S788ydwfvj0JoPo"}'::jsonb,
      body    := '{}'::jsonb
    ) as request_id;
  $$
);

-- To verify it's scheduled:
-- select * from cron.job;

-- To remove the schedule later if needed:
-- select cron.unschedule('sync-fusioo-every-30min');

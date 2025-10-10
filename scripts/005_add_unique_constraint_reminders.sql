-- Add unique constraint to prevent duplicate reminders
CREATE UNIQUE INDEX IF NOT EXISTS unique_reminder 
ON public.care_reminders(user_id, plant_id, reminder_date, reminder_type);

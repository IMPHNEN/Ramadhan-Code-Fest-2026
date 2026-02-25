-- supabase/migrations/20250818110000_create_alerts_table.sql

-- Create a custom type for the alert level
CREATE TYPE public.alert_level AS ENUM (
    'Rendah',
    'Sedang',
    'Tinggi'
);

-- Create the table for real-time alerts
CREATE TABLE public.alerts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    level public.alert_level NOT NULL,
    location text NOT NULL,
    reason text NOT NULL,
    details text,
    affected_areas text[],
    estimated_population integer,
    severity smallint CHECK (severity >= 1 AND severity <= 10),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments for clarity
COMMENT ON TABLE public.alerts IS 'Stores real-time disaster alerts.';
COMMENT ON COLUMN public.alerts.level IS 'The severity level of the alert.';

-- Enable Row Level Security
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create a policy for public read access
CREATE POLICY "Enable read access for all users" ON public.alerts
    FOR SELECT
    USING (true);

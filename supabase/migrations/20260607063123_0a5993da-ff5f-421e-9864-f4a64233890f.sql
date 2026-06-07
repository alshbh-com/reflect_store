
CREATE TABLE IF NOT EXISTS public.meta_settings (
  id text PRIMARY KEY DEFAULT 'main',
  pixel_id text,
  test_event_code text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.meta_settings TO anon, authenticated;
GRANT ALL ON public.meta_settings TO service_role;
ALTER TABLE public.meta_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meta_settings public read" ON public.meta_settings FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.meta_event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  event_id text NOT NULL,
  status text NOT NULL,
  http_status int,
  message text,
  source_url text,
  custom_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS meta_event_logs_created_at_idx ON public.meta_event_logs (created_at DESC);
GRANT SELECT ON public.meta_event_logs TO anon, authenticated;
GRANT ALL ON public.meta_event_logs TO service_role;
ALTER TABLE public.meta_event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meta_event_logs public read" ON public.meta_event_logs FOR SELECT USING (true);

INSERT INTO public.meta_settings (id, pixel_id) VALUES ('main', '1709412439635775')
ON CONFLICT (id) DO UPDATE SET pixel_id = EXCLUDED.pixel_id, updated_at = now();

-- Create analytics_events table for web tracking
-- Tracks page views and session duration with privacy-first design

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event metadata
  event_type VARCHAR(50) NOT NULL DEFAULT 'page_view',
  page_path TEXT NOT NULL,

  -- Session tracking (persists per tab via sessionStorage)
  session_id VARCHAR(255) NOT NULL,
  session_started_at TIMESTAMPTZ,

  -- User context (nullable for anonymous users)
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_role VARCHAR(10), -- 'coach' | 'client' | 'anonymous'

  -- Request metadata (no IP addresses collected for privacy)
  referrer TEXT,
  user_agent TEXT,

  -- Timing data (milliseconds)
  page_load_time INTEGER,
  time_on_page INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON public.analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);

-- Enable Row Level Security
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only coaches can read analytics
CREATE POLICY "Coaches can view all analytics"
  ON public.analytics_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'coach'
    )
  );

-- Policy: Service role can insert analytics events
CREATE POLICY "Service can insert analytics"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

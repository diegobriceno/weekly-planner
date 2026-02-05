-- ============================================
-- Weekly Planner - Supabase Schema
-- ============================================

-- Enum type for categories
CREATE TYPE event_category AS ENUM (
  'work',
  'projects',
  'personal',
  'home',
  'finances',
  'other'
);

-- Enum type for recurrence kind
CREATE TYPE recurrence_kind AS ENUM (
  'day_of_month',
  'day_of_week'
);

-- ============================================
-- Table: events (one-off events)
-- ============================================
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category event_category NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying events by date range
CREATE INDEX idx_events_date ON events (date);

-- Index for querying events by category
CREATE INDEX idx_events_category ON events (category);

-- ============================================
-- Table: recurring_events
-- ============================================
CREATE TABLE recurring_events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category event_category NOT NULL,
  start_time TIME,
  end_time TIME,
  start_date DATE NOT NULL,
  end_date DATE,
  recurrence_kind recurrence_kind NOT NULL,
  -- For day_of_month: single day (1-31)
  -- For day_of_week: stored as array of integers (0=Sun, 6=Sat)
  recurrence_day INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying active recurring events
CREATE INDEX idx_recurring_events_dates ON recurring_events (start_date, end_date);

-- ============================================
-- Trigger: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_events_updated_at
  BEFORE UPDATE ON recurring_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on both tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_events ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
-- (Adjust based on your auth requirements)

-- Events table policies
CREATE POLICY "Allow anonymous read access on events"
  ON events FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on events"
  ON events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on events"
  ON events FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on events"
  ON events FOR DELETE
  TO anon
  USING (true);

-- Recurring events table policies
CREATE POLICY "Allow anonymous read access on recurring_events"
  ON recurring_events FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert on recurring_events"
  ON recurring_events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update on recurring_events"
  ON recurring_events FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on recurring_events"
  ON recurring_events FOR DELETE
  TO anon
  USING (true);

-- ============================================
-- Optional: Policies for authenticated users only
-- Uncomment these and remove anon policies above
-- if you want to require authentication
-- ============================================

/*
-- Events table policies (authenticated)
CREATE POLICY "Allow authenticated read access on events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Recurring events table policies (authenticated)
CREATE POLICY "Allow authenticated read access on recurring_events"
  ON recurring_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert on recurring_events"
  ON recurring_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on recurring_events"
  ON recurring_events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete on recurring_events"
  ON recurring_events FOR DELETE
  TO authenticated
  USING (true);
*/

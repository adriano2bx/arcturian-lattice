
CREATE TABLE IF NOT EXISTS dataset_sync_state (
  source TEXT PRIMARY KEY,
  staging_source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  next_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER,
  expected_records INTEGER,
  staged_records INTEGER NOT NULL DEFAULT 0,
  started_at TEXT,
  last_run_at TEXT,
  completed_at TEXT,
  next_refresh_at TEXT,
  last_error TEXT,
  source_url TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dataset_sync_state_status
  ON dataset_sync_state(status, next_refresh_at);

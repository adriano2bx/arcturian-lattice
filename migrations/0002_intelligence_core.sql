CREATE TABLE IF NOT EXISTS web_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  target_url TEXT NOT NULL,
  target_domain TEXT NOT NULL,
  anchor TEXT,
  rel TEXT,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  UNIQUE(source_url, target_url)
);
CREATE INDEX IF NOT EXISTS idx_web_links_target_domain ON web_links(target_domain);
CREATE INDEX IF NOT EXISTS idx_web_links_source_domain ON web_links(source_domain);

CREATE TABLE IF NOT EXISTS monitors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  interval_minutes INTEGER NOT NULL DEFAULT 1440,
  enabled INTEGER NOT NULL DEFAULT 1,
  last_run_at TEXT,
  next_run_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_monitors_due ON monitors(enabled,next_run_at);

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  monitor_id TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  FOREIGN KEY(monitor_id) REFERENCES monitors(id)
);
CREATE INDEX IF NOT EXISTS idx_snapshots_monitor ON snapshots(monitor_id,observed_at DESC);

CREATE TABLE IF NOT EXISTS intelligence_events (
  id TEXT PRIMARY KEY,
  monitor_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  summary TEXT,
  previous_hash TEXT,
  current_hash TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY(monitor_id) REFERENCES monitors(id)
);
CREATE INDEX IF NOT EXISTS idx_events_monitor ON intelligence_events(monitor_id,created_at DESC);

CREATE TABLE IF NOT EXISTS traffic_models (
  segment TEXT PRIMARY KEY,
  coefficients_json TEXT NOT NULL,
  trained_at TEXT,
  sample_size INTEGER NOT NULL DEFAULT 0,
  metrics_json TEXT
);

CREATE TABLE IF NOT EXISTS public_dataset_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  name TEXT,
  cnpj TEXT,
  category TEXT,
  payload_json TEXT NOT NULL,
  source_updated_at TEXT,
  source_url TEXT,
  UNIQUE(source, entity_id)
);
CREATE INDEX IF NOT EXISTS idx_public_dataset_source_cnpj ON public_dataset_records(source,cnpj);
CREATE INDEX IF NOT EXISTS idx_public_dataset_source_name ON public_dataset_records(source,name);

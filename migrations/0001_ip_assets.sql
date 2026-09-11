CREATE TABLE IF NOT EXISTS ip_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_type TEXT NOT NULL,
  process_number TEXT NOT NULL,
  title TEXT,
  status TEXT,
  holder_name TEXT,
  holder_cnpj TEXT,
  filing_date TEXT,
  grant_date TEXT,
  expiry_date TEXT,
  nice_classes_json TEXT,
  source_updated_at TEXT,
  source_url TEXT,
  UNIQUE(asset_type, process_number, holder_cnpj)
);

CREATE INDEX IF NOT EXISTS idx_ip_assets_holder_cnpj ON ip_assets(holder_cnpj);
CREATE INDEX IF NOT EXISTS idx_ip_assets_holder_name ON ip_assets(holder_name);
CREATE INDEX IF NOT EXISTS idx_ip_assets_process_number ON ip_assets(process_number);
CREATE INDEX IF NOT EXISTS idx_ip_assets_type ON ip_assets(asset_type);

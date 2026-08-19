-- ==========================================================
-- CHICKEN FARM PRO - CLOUDFLARE D1 RELATIONAL DATABASE SCHEMA
-- ==========================================================

-- 1. Farms
CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  farm_name TEXT NOT NULL DEFAULT 'GreenField Poultry Farm',
  location TEXT NOT NULL DEFAULT 'Hyderabad, India',
  owner_name TEXT NOT NULL DEFAULT 'John & Pranay',
  phone TEXT NOT NULL DEFAULT '9502828293',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Users (Multi-Device Auth & Access Control)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Admin',
  pin TEXT NOT NULL DEFAULT '1234',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- 3. Batches (Flock Management)
CREATE TABLE IF NOT EXISTS batches (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  batch_number TEXT NOT NULL,
  batch_name TEXT NOT NULL,
  breed_type TEXT NOT NULL DEFAULT 'Cobb 500 (Broiler)',
  start_date TEXT NOT NULL DEFAULT (datetime('now')),
  expected_end_date TEXT NOT NULL,
  actual_end_date TEXT,
  duration_days INTEGER NOT NULL DEFAULT 45,
  total_chicks INTEGER NOT NULL DEFAULT 5000,
  alive_chicks INTEGER NOT NULL DEFAULT 5000,
  dead_chicks INTEGER NOT NULL DEFAULT 0,
  mortality_percentage REAL NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'growing', -- 'growing', 'completed', 'sold'
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_batches_farm ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_number ON batches(batch_number);

-- 4. Daily Records (Mortality, Feed Consumption, Weight Logging)
CREATE TABLE IF NOT EXISTS daily_records (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  batch_id TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT (datetime('now')),
  alive_chicks INTEGER NOT NULL,
  dead_chicks INTEGER NOT NULL DEFAULT 0,
  feed_consumed REAL NOT NULL DEFAULT 0.0,
  average_weight REAL NOT NULL DEFAULT 0.0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_daily_records_batch ON daily_records(batch_id);

-- 5. Expenses (Feed, Medicine, Labour, Electricity, Maintenance)
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  batch_id TEXT,
  category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Labour', 'Electricity', 'Maintenance', 'General'
  amount REAL NOT NULL,
  date TEXT NOT NULL DEFAULT (date('now')),
  description TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_expenses_farm ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_batch ON expenses(batch_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- 6. Sales & Revenue
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  batch_id TEXT,
  chickens_sold INTEGER NOT NULL,
  average_weight REAL NOT NULL,
  price_per_kg REAL NOT NULL,
  total_revenue REAL NOT NULL,
  buyer TEXT NOT NULL DEFAULT 'Wholesale Buyer',
  notes TEXT,
  sale_date TEXT NOT NULL DEFAULT (date('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_sales_farm ON sales(farm_id);
CREATE INDEX IF NOT EXISTS idx_sales_batch ON sales(batch_id);

-- 7. Billing Calculations
CREATE TABLE IF NOT EXISTS billing (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  batch_id TEXT,
  flock_name TEXT NOT NULL,
  total_chicks INTEGER NOT NULL,
  alive_chicks INTEGER NOT NULL,
  total_weight_kg REAL NOT NULL,
  average_weight_kg REAL NOT NULL,
  price_per_kg REAL NOT NULL,
  gross_revenue REAL NOT NULL,
  deductions REAL NOT NULL DEFAULT 0.0,
  total_amount REAL NOT NULL,
  notes TEXT,
  date TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_billing_farm ON billing(farm_id);

-- 8. Inventory (Feed Bags, Vaccines, Equipment)
CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  item_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Equipment', 'Disinfectant'
  quantity REAL NOT NULL DEFAULT 0.0,
  unit TEXT NOT NULL DEFAULT 'bags', -- 'bags', 'liters', 'bottles', 'kg', 'units'
  reorder_level REAL NOT NULL DEFAULT 10.0,
  cost_per_unit REAL NOT NULL DEFAULT 0.0,
  supplier TEXT,
  last_restocked TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_inventory_farm ON inventory(farm_id);

-- 9. Employees
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Farm Supervisor',
  phone TEXT NOT NULL,
  daily_wage REAL NOT NULL DEFAULT 600.0,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- 11. Farm Settings
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'default-settings',
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  farm_name TEXT NOT NULL DEFAULT 'GreenField Poultry Farm',
  currency TEXT NOT NULL DEFAULT '₹',
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'dark',
  logo_url TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- 12. AI Actions Log (ChickAI Voice & Automation Action Auditing)
CREATE TABLE IF NOT EXISTS ai_actions (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL DEFAULT 'farm_main',
  action_type TEXT NOT NULL,
  action_payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
);

-- ==========================================================
-- INITIAL DATA SEED FOR DEFAULT FARM
-- ==========================================================
INSERT OR IGNORE INTO farms (id, farm_name, location, owner_name, phone) 
VALUES ('farm_main', 'GreenField Poultry Farm', 'Hyderabad, India', 'John & Pranay', '9502828293');

INSERT OR IGNORE INTO users (id, farm_id, name, phone, role, pin)
VALUES 
  ('user_john', 'farm_main', 'John (Farm Lead)', '9502828293', 'Admin', '1234'),
  ('user_pranay', 'farm_main', 'Pranay (Co-Founder)', '9849852085', 'Admin', '1234');

INSERT OR IGNORE INTO settings (id, farm_id, farm_name, currency, language, theme)
VALUES ('default-settings', 'farm_main', 'GreenField Poultry Farm', '₹', 'en', 'dark');

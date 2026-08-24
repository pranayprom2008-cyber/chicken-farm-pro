-- ==========================================================
-- CHICKEN FARM PRO - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- ==========================================================
-- Secure, multi-tenant poultry farm management database with RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Tied to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'Admin',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id TEXT PRIMARY KEY DEFAULT ('farm_' || uuid_generate_v4()),
    farm_name TEXT NOT NULL DEFAULT 'GreenField Bio-Secure Poultry Farm',
    location TEXT DEFAULT 'Hyderabad, Telangana, India',
    owner_name TEXT DEFAULT 'Venkata Farms',
    phone TEXT DEFAULT '9502828293',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farm Members Table (Tenant isolation & RLS mapping)
CREATE TABLE IF NOT EXISTS farm_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin', -- 'owner', 'admin', 'manager', 'viewer'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, user_id)
);

-- 4. Batches Table
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL UNIQUE,
    batch_name TEXT DEFAULT '',
    breed_type TEXT DEFAULT 'Cobb 500 (Broiler)',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_end_date TIMESTAMPTZ NOT NULL,
    actual_end_date TIMESTAMPTZ,
    duration_days INTEGER DEFAULT 45,
    total_chicks INTEGER NOT NULL DEFAULT 5000,
    alive_chicks INTEGER NOT NULL DEFAULT 5000,
    dead_chicks INTEGER NOT NULL DEFAULT 0,
    mortality_percentage NUMERIC(5, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'growing', -- 'growing', 'completed', 'sold'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Daily Batch Records
CREATE TABLE IF NOT EXISTS daily_records (
    id TEXT PRIMARY KEY DEFAULT ('rec_' || uuid_generate_v4()),
    batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    alive_chicks INTEGER NOT NULL,
    dead_chicks INTEGER DEFAULT 0,
    feed_consumed NUMERIC(10, 2) DEFAULT 0.00, -- kg
    average_weight NUMERIC(10, 3) DEFAULT 0.000, -- kg
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Miscellaneous', 'Other'
    amount NUMERIC(12, 2) NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Sales Records
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY DEFAULT ('sale_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    chickens_sold INTEGER NOT NULL,
    average_weight NUMERIC(10, 2) NOT NULL,
    price_per_kg NUMERIC(10, 2) NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL,
    buyer TEXT,
    notes TEXT,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Billing Calculations
CREATE TABLE IF NOT EXISTS billing (
    id TEXT PRIMARY KEY,
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'chick_purchase',
    chick_rate NUMERIC(10, 2),
    number_of_chicks INTEGER,
    feed_bags INTEGER,
    fcr_score NUMERIC(5, 2),
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY DEFAULT ('inv_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Equipment', 'Disinfectant'
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'kg', -- 'kg', 'bags', 'vials', 'liters', 'units'
    unit_price NUMERIC(10, 2) DEFAULT 0,
    reorder_level NUMERIC(10, 2) DEFAULT 10,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY DEFAULT ('emp_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'Farm Worker',
    salary NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT ('task_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'critical'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AI Conversations & Actions
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY DEFAULT ('conv_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    title TEXT DEFAULT 'ChickAI Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || uuid_generate_v4()),
    conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL, -- 'user', 'ai'
    text TEXT NOT NULL,
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_actions (
    id TEXT PRIMARY KEY DEFAULT ('act_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'CREATE_EXPENSE', 'RECORD_MORTALITY', 'LOG_FEED', 'CREATE_BATCH'
    details TEXT NOT NULL,
    status TEXT DEFAULT 'executed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Farm Settings Table
CREATE TABLE IF NOT EXISTS farm_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_setting',
    farm_id TEXT NOT NULL UNIQUE REFERENCES farms(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    currency TEXT DEFAULT '₹',
    language TEXT DEFAULT 'en',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_batches_farm ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_expenses_farm ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_daily_records_batch ON daily_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_sales_farm ON sales(farm_id);
CREATE INDEX IF NOT EXISTS idx_billing_farm ON billing(farm_id);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_settings ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check if auth user is a member of the farm
CREATE OR REPLACE FUNCTION is_farm_member(target_farm_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Allow service role and direct farm members
    RETURN (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM farm_members
            WHERE farm_id = target_farm_id AND user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for Farms
CREATE POLICY "Users can view farms they belong to"
    ON farms FOR SELECT
    USING (is_farm_member(id) OR auth.role() = 'service_role');

CREATE POLICY "Users can update farms they belong to"
    ON farms FOR UPDATE
    USING (is_farm_member(id) OR auth.role() = 'service_role');

-- RLS Policies for Batches
CREATE POLICY "Users can manage batches of their farm"
    ON batches FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- RLS Policies for Expenses
CREATE POLICY "Users can manage expenses of their farm"
    ON expenses FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- RLS Policies for Billing
CREATE POLICY "Users can manage billing of their farm"
    ON billing FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- RLS Policies for Sales
CREATE POLICY "Users can manage sales of their farm"
    ON sales FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- RLS Policies for Notifications
CREATE POLICY "Users can view notifications of their farm"
    ON notifications FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- RLS Policies for Settings
CREATE POLICY "Users can manage settings of their farm"
    ON farm_settings FOR ALL
    USING (is_farm_member(farm_id) OR auth.role() = 'service_role');

-- Enable Supabase Realtime for instant cross-device synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE batches;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE billing;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

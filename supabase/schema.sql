-- ==========================================================
-- CHICKEN FARM PRO - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- MULTI-TENANT ARCHITECTURE WITH GOOGLE AUTH & RLS POLICIES
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Tied directly to auth.users.id)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    phone TEXT,
    role TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms Table (Individually owned farms)
CREATE TABLE IF NOT EXISTS farms (
    id TEXT PRIMARY KEY DEFAULT ('farm_' || uuid_generate_v4()),
    farm_name TEXT NOT NULL DEFAULT 'My Poultry Farm',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT DEFAULT 'Hyderabad, Telangana, India',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Farm Members Table (Tenant isolation & Multi-User Collaboration)
CREATE TABLE IF NOT EXISTS farm_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'worker', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, user_id)
);

-- 4. Batches Table (Commercial grow-out flocks)
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY DEFAULT ('batch_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    batch_name TEXT DEFAULT '',
    breed_type TEXT DEFAULT 'Cobb 500 (Broiler)',
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_end_date TIMESTAMPTZ NOT NULL,
    actual_end_date TIMESTAMPTZ,
    duration_days INTEGER DEFAULT 45 CHECK (duration_days > 0),
    total_chicks INTEGER NOT NULL DEFAULT 5000 CHECK (total_chicks >= 0),
    alive_chicks INTEGER NOT NULL DEFAULT 5000 CHECK (alive_chicks >= 0),
    dead_chicks INTEGER NOT NULL DEFAULT 0 CHECK (dead_chicks >= 0),
    mortality_percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (mortality_percentage >= 0 AND mortality_percentage <= 100),
    status TEXT DEFAULT 'growing' CHECK (status IN ('growing', 'completed', 'sold')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(farm_id, batch_number)
);

-- 5. Daily Batch Biometric Records (Mortality, Feed, Weight)
CREATE TABLE IF NOT EXISTS daily_records (
    id TEXT PRIMARY KEY DEFAULT ('rec_' || uuid_generate_v4()),
    batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    alive_chicks INTEGER NOT NULL CHECK (alive_chicks >= 0),
    dead_chicks INTEGER DEFAULT 0 CHECK (dead_chicks >= 0),
    feed_consumed NUMERIC(10, 2) DEFAULT 0.00 CHECK (feed_consumed >= 0), -- in kg
    average_weight NUMERIC(10, 3) DEFAULT 0.000 CHECK (average_weight >= 0), -- in kg
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Expenses Table (Individual Verified Financial Records)
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY DEFAULT ('exp_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Electricity', 'Labour', 'Maintenance', 'Other'
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    vendor TEXT,
    payment_method TEXT DEFAULT 'Cash',
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. Sales Records (Commercial Harvest Revenue)
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY DEFAULT ('sale_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    chickens_sold INTEGER NOT NULL CHECK (chickens_sold >= 0),
    average_weight NUMERIC(10, 2) NOT NULL CHECK (average_weight >= 0),
    price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    total_revenue NUMERIC(12, 2) NOT NULL CHECK (total_revenue >= 0),
    buyer TEXT,
    notes TEXT,
    sale_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 8. Billing Calculations (Chick Placement & FCR Calculations)
CREATE TABLE IF NOT EXISTS billing (
    id TEXT PRIMARY KEY DEFAULT ('bill_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id TEXT REFERENCES batches(id) ON DELETE SET NULL,
    type TEXT NOT NULL DEFAULT 'chick_purchase',
    chick_rate NUMERIC(10, 2) CHECK (chick_rate >= 0),
    number_of_chicks INTEGER CHECK (number_of_chicks >= 0),
    feed_bags INTEGER CHECK (feed_bags >= 0),
    fcr_score NUMERIC(5, 2),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    notes TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY DEFAULT ('inv_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Feed', 'Medicine', 'Equipment', 'Disinfectant'
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'kg',
    unit_price NUMERIC(10, 2) DEFAULT 0 CHECK (unit_price >= 0),
    reorder_level NUMERIC(10, 2) DEFAULT 10,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY DEFAULT ('task_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT ('notif_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'critical')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Conversations & Actions
CREATE TABLE IF NOT EXISTS ai_conversations (
    id TEXT PRIMARY KEY DEFAULT ('conv_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    title TEXT DEFAULT 'ChickAI Session',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id TEXT PRIMARY KEY DEFAULT ('msg_' || uuid_generate_v4()),
    conversation_id TEXT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    action_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_actions (
    id TEXT PRIMARY KEY DEFAULT ('act_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    details TEXT NOT NULL,
    status TEXT DEFAULT 'executed',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Farm Settings Table
CREATE TABLE IF NOT EXISTS farm_settings (
    id TEXT PRIMARY KEY DEFAULT ('set_' || uuid_generate_v4()),
    farm_id TEXT NOT NULL UNIQUE REFERENCES farms(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    currency TEXT DEFAULT '₹',
    language TEXT DEFAULT 'en',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & ISOLATION
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_farm_members_user ON farm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_farm ON farm_members(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_farm ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_expenses_farm ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_sales_farm ON sales(farm_id);
CREATE INDEX IF NOT EXISTS idx_billing_farm ON billing(farm_id);
CREATE INDEX IF NOT EXISTS idx_daily_records_batch ON daily_records(batch_id);

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
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_settings ENABLE ROW LEVEL SECURITY;

-- Helper Function: Validates if the authenticated user is an authorized member of the specified farm
CREATE OR REPLACE FUNCTION is_farm_member(target_farm_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM farm_members
            WHERE farm_id = target_farm_id AND user_id = auth.uid()
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid() OR auth.role() = 'service_role');

-- Farms Policies
CREATE POLICY "Users can view farms they belong to"
    ON farms FOR SELECT
    USING (is_farm_member(id));

CREATE POLICY "Users can create farms"
    ON farms FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Farm owners can update their farm"
    ON farms FOR UPDATE
    USING (owner_id = auth.uid() OR auth.role() = 'service_role');

-- Farm Members Policies
CREATE POLICY "Members can view membership"
    ON farm_members FOR SELECT
    USING (user_id = auth.uid() OR is_farm_member(farm_id));

CREATE POLICY "Farm owners can manage members"
    ON farm_members FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid()
        )
    );

-- Business Tables RLS (Batches, Expenses, Sales, Billing, Inventory, Tasks, Notifications)
CREATE POLICY "Users can view batches of their farm"
    ON batches FOR SELECT
    USING (is_farm_member(farm_id) AND deleted_at IS NULL);

CREATE POLICY "Users can insert batches in their farm"
    ON batches FOR INSERT
    WITH CHECK (is_farm_member(farm_id));

CREATE POLICY "Users can update batches in their farm"
    ON batches FOR UPDATE
    USING (is_farm_member(farm_id));

CREATE POLICY "Users can delete batches in their farm"
    ON batches FOR DELETE
    USING (is_farm_member(farm_id));

-- Expenses RLS
CREATE POLICY "Users can view expenses of their farm"
    ON expenses FOR SELECT
    USING (is_farm_member(farm_id) AND deleted_at IS NULL);

CREATE POLICY "Users can insert expenses in their farm"
    ON expenses FOR INSERT
    WITH CHECK (is_farm_member(farm_id));

CREATE POLICY "Users can update expenses in their farm"
    ON expenses FOR UPDATE
    USING (is_farm_member(farm_id));

CREATE POLICY "Users can delete expenses in their farm"
    ON expenses FOR DELETE
    USING (is_farm_member(farm_id));

-- Sales RLS
CREATE POLICY "Users can view sales of their farm"
    ON sales FOR SELECT
    USING (is_farm_member(farm_id) AND deleted_at IS NULL);

CREATE POLICY "Users can insert sales in their farm"
    ON sales FOR INSERT
    WITH CHECK (is_farm_member(farm_id));

CREATE POLICY "Users can update sales in their farm"
    ON sales FOR UPDATE
    USING (is_farm_member(farm_id));

-- Billing RLS
CREATE POLICY "Users can manage billing of their farm"
    ON billing FOR ALL
    USING (is_farm_member(farm_id));

-- Inventory, Tasks, Notifications RLS
CREATE POLICY "Users can manage inventory of their farm"
    ON inventory FOR ALL
    USING (is_farm_member(farm_id));

CREATE POLICY "Users can manage tasks of their farm"
    ON tasks FOR ALL
    USING (is_farm_member(farm_id));

CREATE POLICY "Users can manage notifications of their farm"
    ON notifications FOR ALL
    USING (is_farm_member(farm_id));

-- AI Conversations & Actions RLS
CREATE POLICY "Users can manage their AI conversations"
    ON ai_conversations FOR ALL
    USING (user_id = auth.uid() OR is_farm_member(farm_id));

CREATE POLICY "Users can view messages of their conversations"
    ON ai_messages FOR ALL
    USING (EXISTS (
        SELECT 1 FROM ai_conversations WHERE id = conversation_id AND (user_id = auth.uid() OR is_farm_member(farm_id))
    ));

CREATE POLICY "Users can manage their farm AI actions"
    ON ai_actions FOR ALL
    USING (is_farm_member(farm_id));

-- ==========================================================
-- AUTOMATIC NEW USER PROVISIONING TRIGGER
-- Automatically creates a Profile and dedicated Farm when a user signs up via Google Auth
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_farm_id TEXT;
    user_name TEXT;
BEGIN
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Poultry Farmer');
    
    -- 1. Create Profile
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        user_name,
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Create Default Farm for this new user
    new_farm_id := 'farm_' || replace(NEW.id::text, '-', '');
    INSERT INTO public.farms (id, farm_name, owner_id)
    VALUES (new_farm_id, user_name || '''s Farm', NEW.id)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Assign as Owner in Farm Members
    INSERT INTO public.farm_members (farm_id, user_id, role)
    VALUES (new_farm_id, NEW.id, 'owner')
    ON CONFLICT (farm_id, user_id) DO NOTHING;

    -- 4. Create Farm Settings
    INSERT INTO public.farm_settings (farm_id, theme, currency, language)
    VALUES (new_farm_id, 'dark', '₹', 'en')
    ON CONFLICT (farm_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Supabase Realtime for instant multi-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE batches;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE sales;
ALTER PUBLICATION supabase_realtime ADD TABLE billing;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

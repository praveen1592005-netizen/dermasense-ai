-- DermaSense AI PostgreSQL Schema for Supabase

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- if location/map features are needed for doctors

-- ==========================================
-- PROFILES (Linked to Supabase Auth)
-- ==========================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    phone TEXT,
    address JSONB,
    avatar_url TEXT,
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    aadhaar_reference_id TEXT,
    membership_status TEXT DEFAULT 'free',
    skin_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- ANALYSES
-- ==========================================
CREATE TABLE analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    image_storage_path TEXT NOT NULL,
    analysis_type TEXT NOT NULL, -- 'disease', 'type'
    model_version TEXT,
    condition TEXT,
    confidence NUMERIC(5,2),
    risk_level TEXT,
    recommendations JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own analyses" ON analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SYMPTOMS
-- ==========================================
CREATE TABLE symptoms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    symptom_list JSONB NOT NULL,
    duration TEXT,
    body_location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own symptoms" ON symptoms FOR SELECT USING (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = symptoms.analysis_id AND analyses.user_id = auth.uid())
);
CREATE POLICY "Users can insert own symptoms" ON symptoms FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = symptoms.analysis_id AND analyses.user_id = auth.uid())
);

-- ==========================================
-- REPORTS
-- ==========================================
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    report_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON reports FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- MEMBERSHIPS & COUPONS
-- ==========================================
CREATE TABLE memberships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    payment_reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own memberships" ON memberships FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER,
    max_discount NUMERIC(10, 2),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);

CREATE TABLE coupon_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own coupon usage" ON coupon_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own coupon usage" ON coupon_usage FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ==========================================
-- ADD MISSING FIELDS SAFELY
-- ==========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT;

-- ==========================================
-- DISEASE PREDICTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS disease_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    confidence NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions" ON disease_predictions FOR SELECT USING (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = disease_predictions.analysis_id AND analyses.user_id = auth.uid())
);
CREATE POLICY "Users can insert own predictions" ON disease_predictions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = disease_predictions.analysis_id AND analyses.user_id = auth.uid())
);

-- ==========================================
-- PRODUCTS & COMPARISONS
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS product_comparisons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id_1 UUID REFERENCES products(id) ON DELETE CASCADE,
    product_id_2 UUID REFERENCES products(id) ON DELETE CASCADE,
    comparison_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own comparisons" ON product_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comparisons" ON product_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- CHAT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);



-- ==========================================
-- ADD MISSING FIELDS SAFELY
-- ==========================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT;

-- ==========================================
-- DISEASE PREDICTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS disease_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    confidence NUMERIC(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own predictions" ON disease_predictions FOR SELECT USING (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = disease_predictions.analysis_id AND analyses.user_id = auth.uid())
);
CREATE POLICY "Users can insert own predictions" ON disease_predictions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM analyses WHERE analyses.id = disease_predictions.analysis_id AND analyses.user_id = auth.uid())
);

-- ==========================================
-- PRODUCTS & COMPARISONS
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS product_comparisons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id_1 UUID REFERENCES products(id) ON DELETE CASCADE,
    product_id_2 UUID REFERENCES products(id) ON DELETE CASCADE,
    comparison_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE product_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own comparisons" ON product_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comparisons" ON product_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    reference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- CHAT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_analysis_id ON symptoms(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

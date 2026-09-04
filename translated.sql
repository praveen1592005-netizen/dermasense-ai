-- DermaSense AI PostgreSQL Schema for Supabase

-- Enable required extensions

 -- if location/map features are needed for doctors

-- ==========================================
-- PROFILES (Linked to Supabase Auth)
-- ==========================================
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    age INTEGER,
    phone TEXT,
    address TEXT,
    avatar_url TEXT,
    aadhaar_hash TEXT,
    aadhaar_verified BOOLEAN DEFAULT FALSE,
    aadhaar_reference_id TEXT,
    membership_status TEXT DEFAULT 'free',
    skin_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RLS: Users can only read/update their own profile




-- ==========================================
-- ANALYSES
-- ==========================================
CREATE TABLE analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    image_storage_path TEXT NOT NULL,
    analysis_type TEXT NOT NULL, -- 'disease', 'type'
    model_version TEXT,
    condition TEXT,
    confidence REAL(5,2),
    risk_level TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);





-- ==========================================
-- SYMPTOMS
-- ==========================================
CREATE TABLE symptoms (
    id TEXT PRIMARY KEY,
    analysis_id TEXT REFERENCES analyses(id) ON DELETE CASCADE,
    symptom_list TEXT NOT NULL,
    duration TEXT,
    body_location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);





-- ==========================================
-- REPORTS
-- ==========================================
CREATE TABLE reports (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id TEXT REFERENCES analyses(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);





-- ==========================================
-- DOCTORS
-- ==========================================
CREATE TABLE doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    qualifications TEXT,
    experience_years INTEGER,
    clinic_name TEXT,
    address TEXT,
    latitude REAL(10, 8),
    longitude REAL(11, 8),
    consultation_fee REAL(10, 2),
    rating REAL(3, 2),
    is_verified BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- APPOINTMENTS
-- ==========================================
CREATE TABLE appointments (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id TEXT REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATETIME NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    symptoms_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);






-- ==========================================
-- MEMBERSHIPS & COUPONS
-- ==========================================
CREATE TABLE memberships (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    payment_reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER,
    max_discount REAL(10, 2),
    valid_until DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE coupon_usage (
    id TEXT PRIMARY KEY,
    coupon_id TEXT REFERENCES coupons(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP
);





-- ==========================================
-- ADD MISSING FIELDS SAFELY
-- ==========================================


-- ==========================================
-- DISEASE PREDICTIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS disease_predictions (
    id TEXT PRIMARY KEY,
    analysis_id TEXT REFERENCES analyses(id) ON DELETE CASCADE,
    disease_name TEXT NOT NULL,
    confidence REAL(5,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- PRODUCTS & COMPARISONS
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL(10, 2),
    stock INTEGER DEFAULT 0,
    category TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS product_comparisons (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    product_id_1 TEXT REFERENCES products(id) ON DELETE CASCADE,
    product_id_2 TEXT REFERENCES products(id) ON DELETE CASCADE,
    comparison_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- PAYMENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    amount REAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending',
    reference TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- CHAT MESSAGES
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_id TEXT REFERENCES analyses(id) ON DELETE SET NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);




-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_symptoms_analysis_id ON symptoms(analysis_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);


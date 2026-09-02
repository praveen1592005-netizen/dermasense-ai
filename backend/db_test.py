import sqlite3
import re
import uuid

def execute_sqlite_test():
    print("Parsing PostgreSQL schema.sql and translating to SQLite format...")
    
    # Read original schema
    with open("backend/schema.sql", "r") as f:
        sql = f.read()
    
    # Very basic translation from Postgres -> SQLite for testing purposes ONLY
    # Remove RLS, extensions, default uuids
    sql = re.sub(r'CREATE EXTENSION.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    sql = re.sub(r'ALTER TABLE\s+\w+\s+ENABLE ROW LEVEL SECURITY;', '', sql, flags=re.IGNORECASE)
    sql = re.sub(r'CREATE POLICY.*?;', '', sql, flags=re.IGNORECASE | re.DOTALL)
    
    # Replace UUID functions with TEXT
    sql = sql.replace('UUID DEFAULT uuid_generate_v4()', 'TEXT')
    sql = sql.replace('UUID REFERENCES auth.users(id)', 'TEXT')
    sql = sql.replace('UUID REFERENCES', 'TEXT REFERENCES')
    sql = sql.replace('UUID', 'TEXT')
    sql = sql.replace('JSONB', 'TEXT')
    sql = sql.replace('TIMESTAMP WITH TIME ZONE DEFAULT NOW()', 'DATETIME DEFAULT CURRENT_TIMESTAMP')
    sql = sql.replace('TIMESTAMP WITH TIME ZONE', 'DATETIME')
    
    # For SQLite, TEXT[] is not valid natively. Use TEXT.
    sql = sql.replace('TEXT[]', 'TEXT')
    sql = sql.replace('NUMERIC', 'REAL')
    
    # SQLite does not support ALTER TABLE ADD COLUMN IF NOT EXISTS.
    sql = re.sub(r'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS aadhaar_hash TEXT;', '', sql, flags=re.IGNORECASE)
    
    # Inject aadhaar_hash into CREATE TABLE profiles for testing
    sql = sql.replace('avatar_url TEXT,', 'avatar_url TEXT,\n    aadhaar_hash TEXT,')
    
    # SQLite foreign keys need to be enabled
    conn = sqlite3.connect(":memory:")
    conn.execute("PRAGMA foreign_keys = ON")
    
    # Since auth.users doesn't exist, we must create a dummy one
    conn.execute('''
    CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY
    );
    ''')
    sql = sql.replace('auth.users(id)', 'auth_users(id)')
    
    with open('translated.sql', 'w') as f:
        f.write(sql)
        
    print("Executing translated schema...")
    try:
        conn.executescript(sql)
    except Exception as e:
        print(f"Error creating schema: {e}")
        return False
        
    print("Schema created successfully! Running CRUD tests...")
    
    user_id = str(uuid.uuid4())
    cursor = conn.cursor()
    
    results = {}
    
    # Test 1: Create user (Needs auth_users and profiles)
    try:
        cursor.execute("INSERT INTO auth_users (id) VALUES (?)", (user_id,))
        cursor.execute("INSERT INTO profiles (id, full_name, email, aadhaar_hash) VALUES (?, ?, ?, ?)", 
                       (user_id, "John Doe", "john@example.com", "hashed_aadhaar_123"))
        conn.commit()
        results['create_user'] = True
    except Exception as e:
        print(f"Create User failed: {e}")
        results['create_user'] = False
        
    # Test 2: Read user
    try:
        cursor.execute("SELECT full_name FROM profiles WHERE id = ?", (user_id,))
        name = cursor.fetchone()[0]
        results['read_user'] = (name == "John Doe")
    except Exception as e:
        print(f"Read User failed: {e}")
        results['read_user'] = False

    # Test 3: Update user
    try:
        cursor.execute("UPDATE profiles SET age = 30 WHERE id = ?", (user_id,))
        conn.commit()
        cursor.execute("SELECT age FROM profiles WHERE id = ?", (user_id,))
        age = cursor.fetchone()[0]
        results['update_user'] = (age == 30)
    except Exception as e:
        print(f"Update User failed: {e}")
        results['update_user'] = False

    # Test 4: Create analysis
    analysis_id = str(uuid.uuid4())
    try:
        cursor.execute('''INSERT INTO analyses (id, user_id, image_storage_path, analysis_type) 
                          VALUES (?, ?, ?, ?)''', (analysis_id, user_id, "/storage/img1.jpg", "disease"))
        conn.commit()
        results['create_analysis'] = True
    except Exception as e:
        print(f"Create Analysis failed: {e}")
        results['create_analysis'] = False
        
    # Test 5: Store prediction
    pred_id = str(uuid.uuid4())
    try:
        cursor.execute('''INSERT INTO disease_predictions (id, analysis_id, disease_name, confidence) 
                          VALUES (?, ?, ?, ?)''', (pred_id, analysis_id, "Melanoma", 0.95))
        conn.commit()
        results['store_prediction'] = True
    except Exception as e:
        print(f"Store Prediction failed: {e}")
        results['store_prediction'] = False

    # Test 6: Store report
    report_id = str(uuid.uuid4())
    try:
        cursor.execute('''INSERT INTO reports (id, user_id, analysis_id, storage_path) 
                          VALUES (?, ?, ?, ?)''', (report_id, user_id, analysis_id, "/reports/rep1.pdf"))
        conn.commit()
        results['store_report'] = True
    except Exception as e:
        print(f"Store Report failed: {e}")
        results['store_report'] = False

    # Test 7: Retrieve report
    try:
        cursor.execute("SELECT storage_path FROM reports WHERE id = ?", (report_id,))
        path = cursor.fetchone()[0]
        results['retrieve_report'] = (path == "/reports/rep1.pdf")
    except Exception as e:
        print(f"Retrieve Report failed: {e}")
        results['retrieve_report'] = False

    # Test 8: Delete user-owned data (ON DELETE CASCADE)
    try:
        cursor.execute("DELETE FROM profiles WHERE id = ?", (user_id,))
        conn.commit()
        
        # Check if analysis, prediction, and report were deleted
        cursor.execute("SELECT COUNT(*) FROM analyses WHERE id = ?", (analysis_id,))
        analysis_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM reports WHERE id = ?", (report_id,))
        report_count = cursor.fetchone()[0]
        
        # disease_predictions cascades from analyses which cascades from profiles
        cursor.execute("SELECT COUNT(*) FROM disease_predictions WHERE id = ?", (pred_id,))
        pred_count = cursor.fetchone()[0]
        
        if analysis_count == 0 and report_count == 0 and pred_count == 0:
            results['delete_user_data'] = True
        else:
            print(f"Cascade delete failed. Analyses: {analysis_count}, Reports: {report_count}, Preds: {pred_count}")
            results['delete_user_data'] = False
            
    except Exception as e:
        print(f"Delete User Data failed: {e}")
        results['delete_user_data'] = False

    print("\n--- TEST RESULTS ---")
    all_passed = True
    for test, result in results.items():
        status = "PASSED" if result else "FAILED"
        print(f"{test}: {status}")
        if not result:
            all_passed = False
            
    print(f"\nOVERALL STATUS: {'SUCCESS' if all_passed else 'FAILURE'}")

if __name__ == '__main__':
    execute_sqlite_test()

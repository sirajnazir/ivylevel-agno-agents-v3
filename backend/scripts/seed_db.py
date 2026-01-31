# Seed Supabase with Legacy Enriched Data (v9.2 Port)
import os
import json
import sys
from typing import List, Dict, Any

# Ensure root is in path
sys.path.insert(0, os.getcwd())

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Missing dependencies. Install: pip install supabase python-dotenv")
    sys.exit(1)

# Load env
load_dotenv()
load_dotenv("apikey.env") 

URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not URL or not KEY:
    # Check if we can proceed without DB (Mock mode) or fail
    print("⚠️  Warning: SUPABASE_URL/KEY not found. Ensure .env is configured.")
    # We might proceed if just testing logic, but for real seeding we need DB.
    # sys.exit(1) 

def get_supabase():
    try:
        if URL and KEY:
            print(f"Connecting to {URL}...")
            client = create_client(URL, KEY)
            # Connectivity check
            try:
                client.table("opportunities").select("count", count="exact").limit(1).execute()
            except Exception as e:
                # If table missing, we can't seed
                print(f"⚠️  'opportunities' table not accessible: {e}")
            return client
    except Exception as e:
        print(f"❌ DB Connection Error: {e}")
    return None

supabase = get_supabase()

def run_migration():
    """Executes the 005_opportunities.sql migration."""
    if not supabase: return
    
    msg = "Running Migration: 005_opportunities.sql..."
    print(msg)
    
    migration_path = "backend/database/migrations/005_opportunities.sql"
    if not os.path.exists(migration_path):
        print(f"❌ Migration file not found: {migration_path}")
        return

    try:
        with open(migration_path, 'r') as f:
            sql = f.read()
        
        # Supabase Python client doesn't support direct SQL execution easily
        # via 'rpc' usually. But for MVP we might need 'postgres' driver or 
        # assume user ran migration.
        # Alternatively, if 'rpc' function 'exec_sql' exists (common pattern).
        # We'll skip for now and assume manual migration OR 
        # inform user to run SQL in Dashboard.
        print("ℹ️  Note: Please ensure 'backend/database/migrations/005_opportunities.sql' is run in Supabase SQL Editor.")
        
    except Exception as e:
        print(f"Migration check failed: {e}")

def seed_opportunities(filepath: str, opp_type: str):
    """Reads enriched JSON and seeds to 'opportunities' table."""
    if not os.path.exists(filepath):
        print(f"⚠️  File not found: {filepath}")
        print(f"   Action: Please upload '{os.path.basename(filepath)}' to backend/seeds/enriched/")
        return

    if not supabase:
        print(f"❌ DB Connection failed. Cannot seed {filepath}.")
        return

    print(f"🚀 Seeding {opp_type}s from {filepath}...")
    
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        count = 0
        errors = 0
        
        for item in data:
            # Map legacy JSON structure to new DB schema
            row = {
                "name": item.get("name") or item.get("title", "Unknown"),
                "type": opp_type.lower(),
                "category": item.get("category", "General"),
                "description": item.get("description", ""),
                
                # Metadata
                "deadline": item.get("deadline", "Rolling"),
                "cost": str(item.get("cost", "Unknown")),
                "eligibility_grade": str(item.get("grade_level", "9-12")),
                
                # Enrichment
                "prestige_score": int(item.get("prestige", 5) or 5),
                "difficulty_level": item.get("difficulty", "Moderate"),
                "url": item.get("link", "")
            }
            
            try:
                # Insert
                supabase.table("opportunities").insert(row).execute()
                count += 1
            except Exception as e:
                # Usually name collision or connection error
                print(f"Error inserting {row['name']}: {e}")
                errors += 1
                
        print(f"✅ Synced {count} {opp_type}s. ({errors} errors)")
        
    except Exception as e:
        print(f"❌ Critical error processing file: {e}")

if __name__ == "__main__":
    print("🌱 Starting Seed Process (v9.2)...")
    seed_opportunities("backend/seeds/enriched/awards_enriched.json", "Award")
    seed_opportunities("backend/seeds/enriched/programs_enriched.json", "Program")
    print("🏁 Seed Process Complete.")

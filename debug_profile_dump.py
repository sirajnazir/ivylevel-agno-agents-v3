
import os
import sys
import json
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.getcwd())

# Load environment variables
load_dotenv()

from backend.tools.supabase_tools import get_supabase_client

def dump_huda_profile():
    print("🔍 Connecting to Supabase...")
    client = get_supabase_client()
    
    # Target ID from logs
    student_id = "4c4c94f9-a7df-4483-9dc6-7905dda36386"
    
    print(f"📥 Fetching profile for ID: {student_id}")
    try:
        response = client.table("profiles").select("*").eq("id", student_id).single().execute()
        data = response.data
        
        if not data:
            print("❌ No profile found!")
            return

        print("✅ Profile found available keys:")
        print(list(data.keys()))
        
        # Check specific fields of interest
        print("\n--- Key Fields ---")
        print(f"Name: {data.get('full_name')}")
        print(f"Target Schools (Column): {data.get('target_schools')}")
        print(f"Assessment (JSONB): {json.dumps(data.get('assessment', {}), indent=2)}")
        print(f"Identity (JSONB): {json.dumps(data.get('identity', {}), indent=2)}")
        
        # Dump full file
        with open("huda_profile_dump.json", "w") as f:
            json.dump(data, f, indent=4, default=str)
        print("\n💾 Full dump saved to huda_profile_dump.json")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    dump_huda_profile()

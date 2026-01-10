import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

def check_connection():
    uri = os.getenv('MONGO_URI')
    db_name = os.getenv('DATABASE_NAME', 'pathway')
    
    if not uri:
        print("❌ Error: MONGO_URI not found in .env file")
        return

    print(f"🔍 Attempting to connect to: {uri.split('@')[-1]} (Host hidden for safety)")
    
    try:
        # Standard connection
        client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
        client.server_info()
        print("✅ Success: Standard connection established!")
    except Exception as e:
        print(f"❌ Standard connection failed: {e}")
        
        if "Username and password must be escaped" in str(e):
            print("🔄 Attempting auto-escape logic...")
            try:
                if '@' in uri and '://' in uri:
                    prefix, rest = uri.split('://', 1)
                    auth, server = rest.rsplit('@', 1)
                    if ':' in auth:
                        user, pwd = auth.split(':', 1)
                        escaped_uri = f"{prefix}://{quote_plus(user)}:{quote_plus(pwd)}@{server}"
                        client = MongoClient(escaped_uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
                        client.server_info()
                        print("✅ Success: Connection established with auto-escaping!")
                    else:
                        print("❌ Failed: Could not parse username/password from URI")
                else:
                    print("❌ Failed: URI format incorrect for escaping")
            except Exception as e2:
                print(f"❌ Auto-escape connection failed: {e2}")
        else:
            print("💡 Tip: Check if you have whitelisted '0.0.0.0/0' in MongoDB Atlas Network Access.")

if __name__ == "__main__":
    check_connection()

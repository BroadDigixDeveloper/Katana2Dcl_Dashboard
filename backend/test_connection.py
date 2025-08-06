# backend/test_connection.py
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Connection details
connection_string = os.getenv('MONGODB_CONNECTION_STRING')
database_name = os.getenv('MONGODB_DATABASE_NAME', 'Order_information')

print(f"Connection string exists: {connection_string is not None}")
print(f"Database name: {database_name}")

if connection_string:
    print(f"Connection string preview: {connection_string[:50]}...")
    
    try:
        print("Attempting to connect...")
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        print("Testing connection...")
        client.admin.command('ping')
        print("✅ Connection successful!")
        
        db = client[database_name]
        collections = db.list_collection_names()
        print(f"Available collections: {collections}")
        
        # Test your specific collections
        katana_collection = db['Katana_to_dcl']
        count = katana_collection.count_documents({})
        print(f"Katana_to_dcl collection count: {count}")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print(f"Error type: {type(e).__name__}")
else:
    print("❌ No connection string found in environment variables")
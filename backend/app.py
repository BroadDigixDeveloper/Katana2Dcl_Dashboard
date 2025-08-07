# backend/api_server.py - DEBUG VERSION
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

# Configure detailed logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("[ENV] Loading environment variables...")

# Create Flask app
app = Flask(__name__)
CORS(app)

# MongoDB Configuration - DEBUG VERSION
MONGODB_CONNECTION_STRING = os.getenv('MONGODB_CONNECTION_STRING')
MONGODB_DATABASE_NAME = os.getenv('MONGODB_DATABASE_NAME', 'Order_information')
SALES_ORDERS_COLLECTION = os.getenv('MONGODB_COLLECTION_NAME', 'Katana_to_dcl')
TARGET_ORDERS_COLLECTION = os.getenv('TARGET_ORDERS_COLLECTION_NAME', 'Target_Orders')
STOCK_TRANSFERS_COLLECTION = os.getenv('STOCK_TRANSFERS_COLLECTION_NAME', 'Stock_Transfers')
PURCHASE_ORDERS_COLLECTION = 'purchase_orders'

# DEBUG: Print environment variables (hide password)
logger.info(f"[DEBUG] MONGODB_CONNECTION_STRING exists: {MONGODB_CONNECTION_STRING is not None}")
if MONGODB_CONNECTION_STRING:
    # Hide password for logging
    safe_connection_string = MONGODB_CONNECTION_STRING[:30] + "***" + MONGODB_CONNECTION_STRING[-20:]
    logger.info(f"[DEBUG] Connection string preview: {safe_connection_string}")
else:
    logger.error("[DEBUG] MONGODB_CONNECTION_STRING is None or empty!")

logger.info(f"[DEBUG] Database name: {MONGODB_DATABASE_NAME}")
logger.info(f"[DEBUG] Collections: {SALES_ORDERS_COLLECTION}, {PURCHASE_ORDERS_COLLECTION}, {STOCK_TRANSFERS_COLLECTION}, {TARGET_ORDERS_COLLECTION}")

# Initialize MongoDB connections with detailed error handling
mongo_client = None
db = None
sales_orders_collection = None
purchase_orders_collection = None
stock_transfers_collection = None
target_orders_collection = None

def initialize_mongodb():
    global mongo_client, db, sales_orders_collection, purchase_orders_collection, stock_transfers_collection, target_orders_collection
    
    try:
        if not MONGODB_CONNECTION_STRING:
            logger.error("[MONGODB ERROR] Connection string is missing")
            return False
        
        logger.info("[MONGODB] Attempting to connect...")
        
        # Try to connect with explicit timeout
        mongo_client = MongoClient(
            MONGODB_CONNECTION_STRING,
            serverSelectionTimeoutMS=5000,     # 5 second timeout for server selection
            connectTimeoutMS=10000,            # 10 second connection timeout
            socketTimeoutMS=30000,             # 30 second socket timeout
            maxPoolSize=10,                    # Maximum 10 connections in pool
            minPoolSize=1,                     # Minimum 1 connection in pool
            maxIdleTimeMS=30000,               # Close connections after 30 seconds idle
            waitQueueTimeoutMS=5000,           # Wait 5 seconds for connection from pool
            retryWrites=True,                  # Retry writes on network errors
            w='majority'                       # Write concern
        )
        # mongo_client = MongoClient(
        #     MONGODB_CONNECTION_STRING,
        #     serverSelectionTimeoutMS=5000,  # 5 second timeout
        #     connectTimeoutMS=10000,         # 10 second connection timeout
        #     socketTimeoutMS=10000           # 10 second socket timeout
        # )
        
        # Test connection
        logger.info("[MONGODB] Testing connection with ping...")
        mongo_client.admin.command('ping')
        logger.info("[MONGODB] Ping successful!")
        
        # Get database
        db = mongo_client[MONGODB_DATABASE_NAME]
        logger.info(f"[MONGODB] Connected to database: {MONGODB_DATABASE_NAME}")
        
        # Get collections
        sales_orders_collection = db[SALES_ORDERS_COLLECTION]
        purchase_orders_collection = db[PURCHASE_ORDERS_COLLECTION]
        stock_transfers_collection = db[STOCK_TRANSFERS_COLLECTION]
        target_orders_collection = db[TARGET_ORDERS_COLLECTION]
        
        # Test collections by counting documents
        logger.info("[MONGODB] Testing collections...")
        sales_count = sales_orders_collection.count_documents({})
        logger.info(f"[MONGODB] Sales orders count: {sales_count}")
        
        po_count = purchase_orders_collection.count_documents({})
        logger.info(f"[MONGODB] Purchase orders count: {po_count}")
        
        transfers_count = stock_transfers_collection.count_documents({})
        logger.info(f"[MONGODB] Stock transfers count: {transfers_count}")
        
        target_count = target_orders_collection.count_documents({})
        logger.info(f"[MONGODB] Target orders count: {target_count}")
        
        logger.info("[MONGODB] All collections initialized successfully!")
        return True
        
    except Exception as e:
        logger.error(f"[MONGODB ERROR] Connection failed: {e}")
        logger.error(f"[MONGODB ERROR] Error type: {type(e).__name__}")
        return False

# Initialize MongoDB on startup
mongodb_connected = initialize_mongodb()
logger.info(f"[STARTUP] MongoDB connected: {mongodb_connected}")

# backend/api_server.py - Add this after MongoDB connection
def create_mongodb_indexes():
    """Create indexes for better query performance"""
    try:
        logger.info("[MONGODB] Creating indexes for better performance...")
        
        # Sales Orders Collection Indexes
        sales_orders_collection.create_index([("created_at", -1)])  # For sorting and date filtering
        sales_orders_collection.create_index([("katana_order_number", 1)])  # For order number search
        sales_orders_collection.create_index([("status", 1)])  # For status filtering
        sales_orders_collection.create_index([("dcl_status", 1)])  # For DCL status filtering
        sales_orders_collection.create_index([("katana_order_id", 1)])  # For unique identification
        
        # Compound indexes for common filter combinations
        sales_orders_collection.create_index([("created_at", -1), ("status", 1)])
        sales_orders_collection.create_index([("created_at", -1), ("dcl_status", 1)])
        
        logger.info("[MONGODB] Indexes created successfully")
        return True
        
    except Exception as e:
        logger.error(f"[MONGODB ERROR] Failed to create indexes: {e}")
        return False

# Call this after MongoDB connection
if mongodb_connected:
    create_mongodb_indexes()

# ============= TEST ENDPOINT WITH DETAILED INFO =============
@app.route('/api/test', methods=['GET'])
def test_api():
    """Test API endpoint with detailed connection info"""
    return jsonify({
        "status": "success",
        "message": "Katana-DCL Dashboard API is running!",
        "mongodb_connected": mongodb_connected,
        "database": MONGODB_DATABASE_NAME,
        "collections": {
            "sales_orders": SALES_ORDERS_COLLECTION,
            "purchase_orders": PURCHASE_ORDERS_COLLECTION,
            "stock_transfers": STOCK_TRANSFERS_COLLECTION,
            "target_orders": TARGET_ORDERS_COLLECTION
        },
        "connection_string_provided": MONGODB_CONNECTION_STRING is not None,
        "timestamp": datetime.now().isoformat()
    })

# ============= DASHBOARD STATS WITH BETTER ERROR HANDLING =============
@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """Get overall dashboard statistics"""
    try:
        if not mongodb_connected or not mongo_client:
            logger.error("[API] Database not connected")
            return jsonify({
                "status": "error", 
                "message": "Database connection failed",
                "details": "MongoDB client not initialized"
            }), 500
        
        logger.info("[API] Fetching dashboard stats...")
        
        # Test connection before proceeding
        mongo_client.admin.command('ping')
        
        # Sales Orders Stats
        logger.info("[API] Counting sales orders...")
        total_sales_orders = sales_orders_collection.count_documents({})
        pending_sales_orders = sales_orders_collection.count_documents({"status": "pending"})
        completed_sales_orders = sales_orders_collection.count_documents({"status": "complete"})
        failed_sales_orders = sales_orders_collection.count_documents({"dcl_result.success": False})
        
        logger.info(f"[API] Sales orders: total={total_sales_orders}, pending={pending_sales_orders}, completed={completed_sales_orders}, failed={failed_sales_orders}")
        
        # Calculate success rate
        sales_success_rate = (completed_sales_orders / total_sales_orders * 100) if total_sales_orders > 0 else 0
        
        return jsonify({
            "status": "success",
            "overall": {
                "total_orders": total_sales_orders,
                "pending_orders": pending_sales_orders,
                "completed_orders": completed_sales_orders,
                "failed_orders": failed_sales_orders,
                "success_rate": round(sales_success_rate, 1),
                "avg_processing_time": "4.2 min"
            }
        })
        
    except Exception as e:
        logger.error(f"[API ERROR] Dashboard stats error: {e}")
        return jsonify({
            "status": "error", 
            "message": str(e),
            "type": type(e).__name__
        }), 500

# ============= SALES ORDERS WITH BETTER ERROR HANDLING =============
# @app.route('/api/sales-orders', methods=['GET'])
# def get_sales_orders():
#     """Get sales orders"""
#     try:
#         if not mongodb_connected or not mongo_client:
#             logger.error("[API] Database not connected for sales orders")
#             return jsonify({
#                 "status": "error", 
#                 "message": "Database connection failed",
#                 "details": "MongoDB client not initialized"
#             }), 500
        
#         logger.info("[API] Fetching sales orders...")
        
#         # Test connection
#         mongo_client.admin.command('ping')
        
#         page = int(request.args.get('page', 1))
#         limit = int(request.args.get('limit', 20))
#         skip = (page - 1) * limit
        
#         logger.info(f"[API] Fetching sales orders: page={page}, limit={limit}, skip={skip}")
        
#         # Get sales orders
#         sales_orders = list(
#             sales_orders_collection.find({})
#             .sort("created_at", -1)
#             .skip(skip)
#             .limit(limit)
#         )
        
#         logger.info(f"[API] Found {len(sales_orders)} sales orders")
        
#         # Format data
#         formatted_orders = []
#         for order in sales_orders:
#             katana_data = order.get('katana_order_data', {})
            
#             formatted_order = {
#                 "id": str(order.get('_id')),
#                 "order_number": order.get('katana_order_number', 'N/A'),
#                 "status": order.get('status', 'N/A'),
#                 "dcl_status": order.get('dcl_status', 'N/A'),
#                 "total": katana_data.get('total', 0),
#                 "created_at": order.get('created_at')
#             }
#             formatted_orders.append(formatted_order)
        
#         # Get total count
#         total_count = sales_orders_collection.count_documents({})
        
#         return jsonify({
#             "status": "success",
#             "data": formatted_orders,
#             "pagination": {
#                 "current_page": page,
#                 "total_pages": (total_count + limit - 1) // limit,
#                 "total_count": total_count
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"[API ERROR] Sales orders error: {e}")
#         return jsonify({
#             "status": "error", 
#             "message": str(e),
#             "type": type(e).__name__
#         }), 500

# # backend/api_server.py - Updated sales orders endpoint
# @app.route('/api/sales-orders', methods=['GET'])
# def get_sales_orders():
#     """Get sales orders with pagination and filters"""
#     try:
#         if not mongodb_connected or not mongo_client:
#             logger.error("[API] Database not connected for sales orders")
#             return jsonify({
#                 "status": "error", 
#                 "message": "Database connection failed",
#                 "details": "MongoDB client not initialized"
#             }), 500
        
#         logger.info("[API] Fetching sales orders...")
        
#         # Test connection
#         mongo_client.admin.command('ping')
        
#         # Pagination parameters
#         page = int(request.args.get('page', 1))
#         limit = int(request.args.get('limit', 20))
#         skip = (page - 1) * limit
        
#         # Filter parameters
#         date_filter = request.args.get('date_filter', '')  # 'today', 'yesterday', 'last_7_days', 'last_30_days'
#         order_number = request.args.get('order_number', '').strip()
#         status_filter = request.args.get('status', '')
#         dcl_status_filter = request.args.get('dcl_status', '')
#         start_date = request.args.get('start_date', '')
#         end_date = request.args.get('end_date', '')
        
#         logger.info(f"[API] Filters - date: {date_filter}, order_number: {order_number}, status: {status_filter}, dcl_status: {dcl_status_filter}")
        
#         # Build MongoDB query
#         query = {}
        
#         # Date filters
#         if date_filter:
#             from datetime import datetime, timedelta
#             now = datetime.now()
            
#             if date_filter == 'today':
#                 start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
#                 end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
#                 query['created_at'] = {'$gte': start_of_day, '$lte': end_of_day}
                
#             elif date_filter == 'yesterday':
#                 yesterday = now - timedelta(days=1)
#                 start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
#                 end_of_yesterday = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
#                 query['created_at'] = {'$gte': start_of_yesterday, '$lte': end_of_yesterday}
                
#             elif date_filter == 'last_7_days':
#                 seven_days_ago = now - timedelta(days=7)
#                 query['created_at'] = {'$gte': seven_days_ago}
                
#             elif date_filter == 'last_30_days':
#                 thirty_days_ago = now - timedelta(days=30)
#                 query['created_at'] = {'$gte': thirty_days_ago}
        
#         # Custom date range
#         if start_date and end_date:
#             try:
#                 start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
#                 end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
#                 query['created_at'] = {'$gte': start_dt, '$lte': end_dt}
#             except ValueError:
#                 logger.warning(f"[API] Invalid date format: start_date={start_date}, end_date={end_date}")
        
#         # Order number filter (partial match)
#         if order_number:
#             query['katana_order_number'] = {'$regex': order_number, '$options': 'i'}
        
#         # Status filters
#         if status_filter:
#             query['status'] = status_filter
            
#         if dcl_status_filter:
#             query['dcl_status'] = dcl_status_filter
        
#         logger.info(f"[API] MongoDB query: {query}")
#         logger.info(f"[API] Pagination: page={page}, limit={limit}, skip={skip}")
        
#         # Get sales orders with filters
#         sales_orders = list(
#             sales_orders_collection.find(query)
#             .sort("created_at", -1)
#             .skip(skip)
#             .limit(limit)
#         )
        
#         logger.info(f"[API] Found {len(sales_orders)} sales orders")
        
#         # Format data with complete structure for frontend
#         formatted_orders = []
#         for order in sales_orders:
#             katana_data = order.get('katana_order_data', {})
#             addresses = katana_data.get('addresses', [{}])
            
#             formatted_order = {
#                 "id": str(order.get('_id')),
#                 "_id": str(order.get('_id')),
#                 "katana_order_id": order.get('katana_order_id'),
#                 "katana_order_number": order.get('katana_order_number', 'N/A'),
#                 "order_number": order.get('katana_order_number', 'N/A'),  # Alias for compatibility
#                 "status": order.get('status', 'N/A'),
#                 "dcl_status": order.get('dcl_status', 'N/A'),
#                 "total": katana_data.get('total', 0),
#                 "currency": katana_data.get('currency', 'USD'),
#                 "customer_company": addresses[0].get('company', 'N/A') if addresses else 'N/A',
#                 "customer_name": f"{addresses[0].get('first_name', '')} {addresses[0].get('last_name', '')}".strip() if addresses else 'N/A',
#                 "items_count": len(katana_data.get('sales_order_rows', [])),
#                 "location_id": katana_data.get('location_id'),
#                 "created_at": order.get('created_at'),
#                 "updated_at": order.get('updated_at'),
#                 "order_created_date": katana_data.get('order_created_date'),
#                 "delivery_date": katana_data.get('delivery_date'),
#                 # "katana_order_data": katana_data  # Include full nested data
#                 "katana_order_data": {
#                 "order_created_date": katana_data.get("order_created_date"),
#                 "delivery_date": katana_data.get("delivery_date"),
#                 "total": katana_data.get("total"),
#                 "currency": katana_data.get("currency"),
#                 "sales_order_rows": katana_data.get("sales_order_rows", [])
#             }

#             }
#             formatted_orders.append(formatted_order)
        
#         # Get total count with same filters
#         total_count = sales_orders_collection.count_documents(query)
        
#         # Calculate pagination info
#         total_pages = (total_count + limit - 1) // limit
#         has_next = page < total_pages
#         has_prev = page > 1
        
#         return jsonify({
#             "status": "success",
#             "data": formatted_orders,
#             "pagination": {
#                 "current_page": page,
#                 "total_pages": total_pages,
#                 "total_count": total_count,
#                 "has_next": has_next,
#                 "has_prev": has_prev,
#                 "limit": limit
#             },
#             "filters_applied": {
#                 "date_filter": date_filter,
#                 "order_number": order_number,
#                 "status": status_filter,
#                 "dcl_status": dcl_status_filter,
#                 "start_date": start_date,
#                 "end_date": end_date
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"[API ERROR] Sales orders error: {e}")
#         import traceback
#         logger.error(f"[API ERROR] Traceback: {traceback.format_exc()}")
#         return jsonify({
#             "status": "error", 
#             "message": str(e),
#             "type": type(e).__name__
#         }), 500

# # backend/api_server.py - Updated sales orders endpoint with cursor pagination
# @app.route('/api/sales-orders', methods=['GET'])
# def get_sales_orders():
#     """Get sales orders with cursor-based pagination and filters"""
#     try:
#         if not mongodb_connected or not mongo_client:
#             logger.error("[API] Database not connected for sales orders")
#             return jsonify({
#                 "status": "error", 
#                 "message": "Database connection failed",
#                 "details": "MongoDB client not initialized"
#             }), 500
        
#         logger.info("[API] Fetching sales orders...")
        
#         # Test connection
#         mongo_client.admin.command('ping')
        
#         # Pagination parameters
#         page = int(request.args.get('page', 1))
#         limit = int(request.args.get('limit', 20))
#         cursor = request.args.get('cursor', '')  # For cursor-based pagination
        
#         # Filter parameters
#         date_filter = request.args.get('date_filter', '')
#         order_number = request.args.get('order_number', '').strip()
#         status_filter = request.args.get('status', '')
#         dcl_status_filter = request.args.get('dcl_status', '')
#         start_date = request.args.get('start_date', '')
#         end_date = request.args.get('end_date', '')
        
#         logger.info(f"[API] Filters - date: {date_filter}, order_number: {order_number}, status: {status_filter}, dcl_status: {dcl_status_filter}")
#         logger.info(f"[API] Pagination - page: {page}, limit: {limit}, cursor: {cursor}")
        
#         # Build MongoDB query
#         query = {}
        
#         # Date filters
#         if date_filter:
#             from datetime import datetime, timedelta
#             now = datetime.now()
            
#             if date_filter == 'today':
#                 start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
#                 end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
#                 query['created_at'] = {'$gte': start_of_day, '$lte': end_of_day}
                
#             elif date_filter == 'yesterday':
#                 yesterday = now - timedelta(days=1)
#                 start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
#                 end_of_yesterday = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
#                 query['created_at'] = {'$gte': start_of_yesterday, '$lte': end_of_yesterday}
                
#             elif date_filter == 'last_7_days':
#                 seven_days_ago = now - timedelta(days=7)
#                 query['created_at'] = {'$gte': seven_days_ago}
                
#             elif date_filter == 'last_30_days':
#                 thirty_days_ago = now - timedelta(days=30)
#                 query['created_at'] = {'$gte': thirty_days_ago}
        
#         # Custom date range
#         if start_date and end_date:
#             try:
#                 start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
#                 end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
#                 query['created_at'] = {'$gte': start_dt, '$lte': end_dt}
#             except ValueError:
#                 logger.warning(f"[API] Invalid date format: start_date={start_date}, end_date={end_date}")
        
#         # Order number filter (partial match)
#         if order_number:
#             query['katana_order_number'] = {'$regex': order_number, '$options': 'i'}
        
#         # Status filters
#         if status_filter:
#             query['status'] = status_filter
            
#         if dcl_status_filter:
#             query['dcl_status'] = dcl_status_filter
        
#         # ✅ OPTIMIZED: Use different pagination strategies based on page number
#         if page <= 5:  # For first 5 pages, use skip (fast for small numbers)
#             skip = (page - 1) * limit
#             logger.info(f"[API] Using skip-based pagination: skip={skip}, limit={limit}")
            
#             sales_orders = list(
#                 sales_orders_collection.find(query)
#                 .sort("created_at", -1)
#                 .skip(skip)
#                 .limit(limit + 1)  # Get one extra to check if there's a next page
#             )
            
#         else:  # For later pages, use cursor-based pagination
#             logger.info(f"[API] Using cursor-based pagination for page {page}")
            
#             if cursor:
#                 # Decode cursor (it's the created_at timestamp of the last item from previous page)
#                 try:
#                     from bson import ObjectId
#                     cursor_time = datetime.fromisoformat(cursor.replace('Z', '+00:00'))
#                     query['created_at'] = {**query.get('created_at', {}), '$lt': cursor_time}
#                 except Exception as e:
#                     logger.warning(f"[API] Invalid cursor: {cursor}, error: {e}")
            
#             sales_orders = list(
#                 sales_orders_collection.find(query)
#                 .sort("created_at", -1)
#                 .limit(limit + 1)  # Get one extra to check if there's a next page
#             )
        
#         # Check if there are more results
#         has_next = len(sales_orders) > limit
#         if has_next:
#             sales_orders = sales_orders[:-1]  # Remove the extra record
        
#         logger.info(f"[API] Found {len(sales_orders)} sales orders")
        
#         # Format data with complete structure for frontend
#         formatted_orders = []
#         next_cursor = None
        
#         for i, order in enumerate(sales_orders):
#             katana_data = order.get('katana_order_data', {})
#             addresses = katana_data.get('addresses', [{}])
            
#             formatted_order = {
#                 "id": str(order.get('_id')),
#                 "_id": str(order.get('_id')),
#                 "katana_order_id": order.get('katana_order_id'),
#                 "katana_order_number": order.get('katana_order_number', 'N/A'),
#                 "order_number": order.get('katana_order_number', 'N/A'),
#                 "status": order.get('status', 'N/A'),
#                 "dcl_status": order.get('dcl_status', 'N/A'),
#                 "total": katana_data.get('total', 0),
#                 "currency": katana_data.get('currency', 'USD'),
#                 "customer_company": addresses[0].get('company', 'N/A') if addresses else 'N/A',
#                 "customer_name": f"{addresses[0].get('first_name', '')} {addresses[0].get('last_name', '')}".strip() if addresses else 'N/A',
#                 "items_count": len(katana_data.get('sales_order_rows', [])),
#                 "location_id": katana_data.get('location_id'),
#                 "created_at": order.get('created_at'),
#                 "updated_at": order.get('updated_at'),
#                 "order_created_date": katana_data.get('order_created_date'),
#                 "delivery_date": katana_data.get('delivery_date'),
#                 "katana_order_data": katana_data
#             }
#             formatted_orders.append(formatted_order)
            
#             # Set next cursor to the last item's created_at
#             if i == len(sales_orders) - 1 and has_next:
#                 next_cursor = order.get('created_at').isoformat() if order.get('created_at') else None
        
#         # ✅ OPTIMIZED: Get total count only when needed and cache it
#         if page == 1:  # Only get total count on first page
#             total_count = sales_orders_collection.count_documents(query)
#         else:
#             # For other pages, estimate or don't show exact count
#             total_count = None
        
#         # Calculate pagination info
#         if total_count is not None:
#             total_pages = (total_count + limit - 1) // limit
#         else:
#             total_pages = None  # Unknown for cursor-based pagination
        
#         has_prev = page > 1
        
#         return jsonify({
#             "status": "success",
#             "data": formatted_orders,
#             "pagination": {
#                 "current_page": page,
#                 "total_pages": total_pages,
#                 "total_count": total_count,
#                 "has_next": has_next,
#                 "has_prev": has_prev,
#                 "limit": limit,
#                 "next_cursor": next_cursor  # For cursor-based pagination
#             },
#             "filters_applied": {
#                 "date_filter": date_filter,
#                 "order_number": order_number,
#                 "status": status_filter,
#                 "dcl_status": dcl_status_filter,
#                 "start_date": start_date,
#                 "end_date": end_date
#             }
#         })
        
#     except Exception as e:
#         logger.error(f"[API ERROR] Sales orders error: {e}")
#         import traceback
#         logger.error(f"[API ERROR] Traceback: {traceback.format_exc()}")
#         return jsonify({
#             "status": "error", 
#             "message": str(e),
#             "type": type(e).__name__
#         }), 500

# backend/app.py - FIXED pagination logic
@app.route('/api/sales-orders', methods=['GET'])
def get_sales_orders():
    """Get sales orders with consistent pagination"""
    try:
        if not mongodb_connected or not mongo_client:
            logger.error("[API] Database not connected for sales orders")
            return jsonify({
                "status": "error", 
                "message": "Database connection failed",
                "details": "MongoDB client not initialized"
            }), 500
        
        logger.info("[API] Fetching sales orders...")
        
        # Test connection
        mongo_client.admin.command('ping')
        
        limit = min(int(request.args.get('limit', 20)), 100)

        # Pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Filter parameters
        date_filter = request.args.get('date_filter', '')
        order_number = request.args.get('order_number', '').strip()
        status_filter = request.args.get('status', '')
        dcl_status_filter = request.args.get('dcl_status', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        
        logger.info(f"[API] Filters - date: {date_filter}, order_number: {order_number}, status: {status_filter}, dcl_status: {dcl_status_filter}")
        logger.info(f"[API] Pagination - page: {page}, limit: {limit}")
        
        # Build MongoDB query
        query = {}
        
        # Date filters
        if date_filter:
            from datetime import datetime, timedelta
            now = datetime.now()
            
            if date_filter == 'today':
                start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = now.replace(hour=23, minute=59, second=59, microsecond=999999)
                query['created_at'] = {'$gte': start_of_day, '$lte': end_of_day}
                
            elif date_filter == 'yesterday':
                yesterday = now - timedelta(days=1)
                start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_yesterday = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
                query['created_at'] = {'$gte': start_of_yesterday, '$lte': end_of_yesterday}
                
            elif date_filter == 'last_7_days':
                seven_days_ago = now - timedelta(days=7)
                query['created_at'] = {'$gte': seven_days_ago}
                
            elif date_filter == 'last_30_days':
                thirty_days_ago = now - timedelta(days=30)
                query['created_at'] = {'$gte': thirty_days_ago}
        
        # Custom date range
        if start_date and end_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query['created_at'] = {'$gte': start_dt, '$lte': end_dt}
            except ValueError:
                logger.warning(f"[API] Invalid date format: start_date={start_date}, end_date={end_date}")
        
        # Order number filter (partial match)
        if order_number:
            query['katana_order_number'] = {'$regex': order_number, '$options': 'i'}
        
        # Status filters
        if status_filter:
            query['status'] = status_filter
            
        if dcl_status_filter:
            query['dcl_status'] = dcl_status_filter
        
        # ✅ FIXED: Always get total count for consistent pagination
        logger.info("[API] Getting total count...")
        total_count = sales_orders_collection.count_documents(query)
        logger.info(f"[API] Total count: {total_count}")
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 0
        skip = (page - 1) * limit
        
        # ✅ FIXED: Use consistent skip-based pagination for simplicity
        logger.info(f"[API] Using skip-based pagination: skip={skip}, limit={limit}")
        
        sales_orders = list(
            sales_orders_collection.find(query)
            .sort("created_at", -1)
            .skip(skip)
            .limit(limit)
        )
        
        logger.info(f"[API] Found {len(sales_orders)} sales orders")
        
        # Format data with complete structure for frontend
        formatted_orders = []
        
        # for order in sales_orders:
        #     katana_data = order.get('katana_order_data', {})
        #     # addresses = katana_data.get('addresses', [{}])
            
        #     formatted_order = {
        #         "id": str(order.get('_id')),
        #         "_id": str(order.get('_id')),
        #         "katana_order_id": order.get('katana_order_id'),
        #         "katana_order_number": order.get('katana_order_number', 'N/A'),
        #         "order_number": order.get('katana_order_number', 'N/A'),
        #         "status": order.get('status', 'N/A'),
        #         "dcl_status": order.get('dcl_status', 'N/A'),
        #         # "total": katana_data.get('total', 0),
        #         "currency": katana_data.get('currency', 'USD'),
        #         # "customer_company": addresses[0].get('company', 'N/A') if addresses else 'N/A',
        #         # "customer_name": f"{addresses[0].get('first_name', '')} {addresses[0].get('last_name', '')}".strip() if addresses else 'N/A',
        #         # "items_count": len(katana_data.get('sales_order_rows', [])),
        #         # "location_id": katana_data.get('location_id'),
        #         # "created_at": order.get('created_at'),
        #         # "updated_at": order.get('updated_at'),
        #         "order_created_date": katana_data.get('order_created_date'),
        #         # "delivery_date": katana_data.get('delivery_date'),
        #         "katana_order_data": katana_data
        #     }
        #     formatted_orders.append(formatted_order)

        #     try:
        #         katana_data = order.get('katana_order_data', {})
        #         logger.debug(f"[ORDER DEBUG] Processing order: {order.get('katana_order_number')}")
        #         logger.debug(f"[ORDER DEBUG] Order created_at: {order.get('created_at')}")
        #         logger.debug(f"[ORDER DEBUG] Katana data: {katana_data}")
        #     except Exception as e:
        #         logger.error(f"[ORDER DEBUG] Error processing order ID: {order.get('_id')}, error: {e}")
        

        for order in sales_orders:
            try:
                katana_data = order.get('katana_order_data') or {}

                formatted_order = {
                    "id": str(order.get('_id')),
                    "_id": str(order.get('_id')),
                    "katana_order_id": order.get('katana_order_id'),
                    "katana_order_number": order.get('katana_order_number', 'N/A'),
                    "order_number": order.get('katana_order_number', 'N/A'),
                    "status": order.get('status', 'N/A'),
                    "dcl_status": order.get('dcl_status', 'N/A'),
                    "total": katana_data.get('total', 0),
                    "currency": katana_data.get('currency', 'USD'),
                    "items_count": len(katana_data.get('sales_order_rows', []) if isinstance(katana_data.get('sales_order_rows', []), list) else []),
                    "location_id": katana_data.get('location_id'),
                    "created_at": order.get('created_at'),
                    "updated_at": order.get('updated_at'),
                    "order_created_date": katana_data.get('order_created_date'),
                    "delivery_date": katana_data.get('delivery_date'),
                    "katana_order_data": {
                        "order_created_date": katana_data.get("order_created_date"),
                        "delivery_date": katana_data.get("delivery_date"),
                        "total": katana_data.get("total"),
                        "currency": katana_data.get("currency"),
                        "sales_order_rows": katana_data.get("sales_order_rows", []) if isinstance(katana_data.get("sales_order_rows", []), list) else []
                    }
                }

                formatted_orders.append(formatted_order)

            except Exception as e:
                logger.error(f"[API ERROR] Skipping order ID: {order.get('_id')} due to error: {e}")
                continue


        # ✅ FIXED: Always provide consistent pagination data
        has_next = page < total_pages
        has_prev = page > 1
        
        pagination_data = {
            "current_page": page,
            "total_pages": total_pages,
            "total_count": total_count,
            "has_next": has_next,
            "has_prev": has_prev,
            "limit": limit,
            "showing_from": skip + 1 if total_count > 0 else 0,
            "showing_to": min(skip + len(formatted_orders), total_count)
        }
        
        logger.info(f"[API] Pagination data: {pagination_data}")
        
        return jsonify({
            "status": "success",
            "data": formatted_orders,
            "pagination": pagination_data,
            "filters_applied": {
                "date_filter": date_filter,
                "order_number": order_number,
                "status": status_filter,
                "dcl_status": dcl_status_filter,
                "start_date": start_date,
                "end_date": end_date
            }
        })
        
    except Exception as e:
        logger.error(f"[API ERROR] Sales orders error: {e}")
        import traceback
        logger.error(f"[API ERROR] Traceback: {traceback.format_exc()}")
        return jsonify({
            "status": "error", 
            "message": str(e),
            "type": type(e).__name__
        }), 500



@app.route('/api/sales-orders/bad-records', methods=['GET'])
def find_bad_sales_orders():
    bad_orders = []
    for order in sales_orders_collection.find({}).sort("created_at", -1):
        try:
            katana_data = order.get('katana_order_data')
            if not isinstance(katana_data, dict):
                bad_orders.append(str(order.get('_id')))
            elif not isinstance(katana_data.get('sales_order_rows', []), list):
                bad_orders.append(str(order.get('_id')))
        except Exception:
            bad_orders.append(str(order.get('_id')))
    return jsonify({"bad_records": bad_orders, "count": len(bad_orders)})


# Add filter options endpoint
@app.route('/api/sales-orders/filters', methods=['GET'])
def get_sales_orders_filters():
    """Get available filter options for sales orders"""
    try:
        if not mongodb_connected or not mongo_client:
            return jsonify({"status": "error", "message": "Database connection failed"}), 500
        
        # Get unique statuses
        statuses = sales_orders_collection.distinct("status")
        dcl_statuses = sales_orders_collection.distinct("dcl_status")
        
        # Remove null/empty values
        statuses = [s for s in statuses if s]
        dcl_statuses = [s for s in dcl_statuses if s]
        
        return jsonify({
            "status": "success",
            "filters": {
                "statuses": statuses,
                "dcl_statuses": dcl_statuses,
                "date_filters": [
                    {"value": "today", "label": "Today"},
                    {"value": "yesterday", "label": "Yesterday"},
                    {"value": "last_7_days", "label": "Last 7 Days"},
                    {"value": "last_30_days", "label": "Last 30 Days"}
                ]
            }
        })
        
    except Exception as e:
        logger.error(f"[API ERROR] Filter options error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    logger.info("[FLASK API] Starting Katana-DCL Dashboard API server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
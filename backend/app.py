from flask import Flask, request, jsonify, session
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from flask_cors import CORS
import logging
import numpy as np
from PIL import Image
import io
from ocr import preprocess_image, resize_image, convert_to_png, pytesseract
from dotenv import load_dotenv
import os
from bson.objectid import ObjectId  # For handling MongoDB's ObjectId
from flask_bcrypt import Bcrypt 
from datetime import datetime, timedelta, timezone  # Import timezone
import functools #add this import
 
 #send request with valid token
# send request with valid token
app = Flask(__name__)
# Explicit CORS configuration
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
bcrypt = Bcrypt(app)  # Initialize bcrypt with your Flask app

load_dotenv()  # Load environment variables from .env file
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY") #get secret key.
if app.config['SECRET_KEY'] is None: #check if secret key is set.
    raise ValueError("SECRET_KEY is not set. Please set the environment variable.")

# def token_required(f):
#     @functools.wraps(f)
#     def decorated(*args, **kwargs):
#         token = None
#         if 'Authorization' in request.headers:
#             token = request.headers['Authorization'].split(" ")[1]

#         if not token:
#             return jsonify({'message': 'Token is missing!'}), 401

#         try:
#             data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
#             # Add user_id to the request context
#             request.user_id = data['phone'] #change to phone, as this is what is stored in the JWT.
#         except jwt.ExpiredSignatureError:
#             return jsonify({'message': 'Token has expired!'}), 401
#         except jwt.InvalidTokenError:
#             return jsonify({'message': 'Token is invalid!'}), 401
#         except Exception as e:
#             logging.error(f"Error decoding token: {str(e)}")
#             return jsonify({'message': 'Something went wrong'}), 500

#         return f(*args, **kwargs)

#     return decorated





@app.route('/extract-text', methods=['POST'])
def extract_text():
    try:
        logging.info("Received request to /extract_text")

        # Check if an image is uploaded
        if 'image' not in request.files:
            logging.warning("No image uploaded")
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files['image']

        if file.filename == '':
            logging.warning("Empty file uploaded")
            return jsonify({"error": "Empty file uploaded"}), 400

        # Read and decode image
        img = np.array(Image.open(io.BytesIO(file.read())))

        if img is None:
            logging.error("Invalid image format or corrupted file")
            return jsonify({"error": "Invalid image format or corrupted file"}), 400

        logging.info(f"Image received, shape: {img.shape}")

        # Process the image
        img = resize_image(img)
        img = convert_to_png(img)
        processed_img = preprocess_image(img)

        # Perform OCR
        custom_config = r'--oem 3 --psm 6'  
        text = pytesseract.image_to_string(processed_img, config=custom_config).strip()

        # Log extracted text
        logging.debug(f"Extracted text: {text}")

        return jsonify({"extracted_text": text})

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500


MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI is not set. Please set the environment variable.")


# Create a new client and connect to the MongoDB server
client = MongoClient(MONGO_URI)
db = client["medi-copilot"]  # Ensure a database is selected
users = db.users  # Select the `users` collection
medicines = db.medicines  # Select the `medicines` collection
medicines_history = db.medicines_history  # Select the `medicines_history` collection

# Configure logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

@app.route('/test-connection', methods=['GET'])
def test_connection():
    try:
        # Ping MongoDB to test the connection
        client.admin.command('ping')
        return jsonify({"message": "Connected to MongoDB", "database": db.name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        logging.debug(f"Received data: {data}")

        # Check for required fields
        required_fields = ('name', 'phone', 'password')
        if not all(k in data for k in required_fields):
            logging.warning("Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Check if user already exists
        existing_user = users.find_one({'phone': data['phone']})
        logging.debug(f"Existing user check: {existing_user}")
        if existing_user:
            logging.warning(f"Phone number {data['phone']} already registered")
            return jsonify({'error': 'Phone number already registered'}), 400

        # Hash password securely
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        logging.debug(f"Generated hashed password: {hashed_password}")

        # Create user document
        user = {
            'name': data['name'],
            'phone': data['phone'],
            'password': hashed_password,
            'gender': None,
            'age': None,
            'anonymity': True
        }
        logging.debug(f"User object to insert: {user}")

        # Insert into MongoDB
        inserted_id = users.insert_one(user).inserted_id
        logging.info(f"User registered successfully with ID: {inserted_id}")

        return jsonify({
            'message': 'User registered successfully',
            'user_id': str(inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error in /register: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json

    # Ensure required fields are present
    required_fields = ('phone', 'password')
    if not all(k in data for k in required_fields):
        logging.error("Missing required fields in login request: %s", data)
        return jsonify({'error': 'Missing required fields'}), 400

    # Find user by phone
    user = users.find_one({'phone': data['phone']})

    if not user:
        logging.warning("Login attempt failed - User not found: %s", data['phone'])
        return jsonify({'error': 'Invalid phone or password'}), 401

    # Check password hash
    if not bcrypt.check_password_hash(user['password'], data['password']):
        logging.warning("Login attempt failed - Incorrect password for user: %s", data['phone'])
        return jsonify({'error': 'Invalid phone or password'}), 401

    # Store user ID in session
    try:
        session['user_id'] = str(user['_id']) # Store user_id in session
        logging.info(f"User logged in successfully: {data['phone']}")
        return jsonify({
            'message': 'Login successful',
            'user_id': str(user['_id'])
        }), 200
    except Exception as e:
        logging.error(f"Error during login: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200

# Example of a protected route
@app.route('/protected', methods=['GET'])
def protected():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401
    return jsonify({'message': f'Protected route accessed by user {user_id}'}), 200

@app.route('/medicines', methods=['POST'])
def add_medicine():
    try:
        data = request.json
        logging.debug(f"Received medicine data: {data}")

        # Check for required fields (including userId)
        required_fields = ('title', 'qty', 'purchaseDate', 'expiryDate', 'userId')
        if not all(k in data for k in required_fields):
            logging.warning("Missing required medicine fields")
            return jsonify({'error': 'Missing required fields'}), 400

        # Validate date formats
        try:
            datetime.strptime(data['purchaseDate'], '%Y-%m-%d')
            datetime.strptime(data['expiryDate'], '%Y-%m-%d')
        except ValueError:
            logging.warning("Invalid date format")
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Validate quantity
        try:
            int(data['qty'])
        except ValueError:
            logging.warning("Invalid quantity format")
            return jsonify({'error': 'Invalid quantity, must be a number'}), 400

        # Create medicine document with medicineActive set to True
        medicine = {
            'user_id': data['userId'], # Get user_id from the request body
            'title': data['title'],
            'qty': int(data['qty']),
            'purchaseDate': data['purchaseDate'],
            'expiryDate': data['expiryDate'],
            'medicineActive': True  # Default value
        }

        logging.debug(f"Medicine object to insert: {medicine}")

        # Insert into MongoDB
        inserted_id = medicines.insert_one(medicine).inserted_id
        logging.info(f"Medicine added successfully with ID: {inserted_id}")

        return jsonify({
            'message': 'Medicine added successfully',
            'medicine_id': str(inserted_id)
        }), 201

    except Exception as e:
        logging.error(f"Error in /medicines: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500
    
@app.route('/medicines/expire', methods=['PUT'])
# @token_required
def expire_medicine():
    try:
        data = request.json
        medicine_id = data.get('medicine_id')

        if not medicine_id:
            return jsonify({'error': 'Medicine ID is required'}), 400

        medicine_obj_id = ObjectId(medicine_id)

        # Retrieve the medicine from the active collection
        medicine = medicines.find_one({'_id': medicine_obj_id, 'medicineActive': True})

        if not medicine:
            return jsonify({'error': 'Medicine not found or already expired'}), 404

        # Update medicineActive to False in active collection
        medicines.update_one({'_id': medicine_obj_id}, {'$set': {'medicineActive': False}})

        # Move medicine to history collection
        medicines_history.insert_one(medicine)

        return jsonify({'message': 'Medicine expired successfully'}), 200

    except Exception as e:
        logging.error(f"Error in /medicines/expire: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    logging.info(f"Tesseract Path: {pytesseract.pytesseract.tesseract_cmd}")
    app.run(host="0.0.0.0", port=5002, debug=True, threaded=True)  # Disable debug in production


from flask import Flask, request, jsonify
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



load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
bcrypt = Bcrypt(app)  # Initialize bcrypt with your Flask app

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

#flask secret key
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your_secret_key_here")  # Use env var for security

@app.route('/test-connection', methods=['GET'])
def test_connection():
    try:
        # Ping MongoDB to test the connection
        client.admin.command('ping')
        return jsonify({"message": "Connected to MongoDB", "database": db.name}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Configure logging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

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

    # Generate JWT token
    try:
        token = jwt.encode(
            {'phone': user['phone'], 'exp': datetime.now(timezone.utc) + timedelta(hours=24)},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        logging.info("User logged in successfully: %s", data['phone'])
        return jsonify({'token': token}), 200
    except Exception as e:
        logging.error("Error generating token: %s", str(e))
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logging.info(f"Tesseract Path: {pytesseract.pytesseract.tesseract_cmd}")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)  # Disable debug in production


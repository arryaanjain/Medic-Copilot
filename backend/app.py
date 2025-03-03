from flask import Flask, request, jsonify
import pytesseract
import cv2
import numpy as np
import logging

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Configure logging
logging.basicConfig(
    filename="server.log",  # Log file name
    level=logging.DEBUG,  # Log level (DEBUG, INFO, WARNING, ERROR)
    format="%(asctime)s - %(levelname)s - %(message)s",  # Log format
)

def preprocess_image(img):
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Denoise the image (reduce small noise)
    denoised = cv2.fastNlMeansDenoising(thresh, None, 30, 7, 21)

    return denoised

def upscale_image(img, scale=2.0):
    height, width = img.shape[:2]
    return cv2.resize(img, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_CUBIC)



@app.route('/extract_text', methods=['POST'])
def extract_text():
    try:
        # Log request
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
        img_np = np.frombuffer(file.read(), np.uint8)
        img = cv2.imdecode(img_np, cv2.IMREAD_COLOR)

        if img is None:
            logging.error("Invalid image format or corrupted file")
            return jsonify({"error": "Invalid image format or corrupted file"}), 400

        logging.info(f"Image received, shape: {img.shape}")
        custom_config = r'--oem 3 --psm 6'  # LSTM mode, best for text blocks

        # Preprocess the image before OCR
        processed_img = preprocess_image(img)

        # Upscale image
        upscaled_img = upscale_image(processed_img)

        # Perform OCR
        text = pytesseract.image_to_string(upscaled_img, config=custom_config)



        # Log extracted text (for debugging purposes)
        logging.debug(f"Extracted text: {text}")

        return jsonify({"extracted_text": text})

    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Log Tesseract path
    logging.info(f"Tesseract Path: {pytesseract.pytesseract.tesseract_cmd}")

    app.run(host="0.0.0.0", port=5000, debug=True)  # Allows access from other devices
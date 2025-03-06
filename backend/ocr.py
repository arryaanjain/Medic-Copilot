import pytesseract
import cv2
import numpy as np
import logging
import subprocess
from PIL import Image
import io

# Set Tesseract Path (Update this based on your system)
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"  # Change if needed

# Configure logging
logging.basicConfig(
    filename="server.log",
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s")

def preprocess_image(img):
    """Convert image to grayscale, denoise, and apply adaptive thresholding."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )
    denoised = cv2.fastNlMeansDenoising(thresh, None, 30, 7, 21)
    return denoised

def resize_image(img, max_width=800):
    """Resize image to a reasonable size for OCR."""
    height, width = img.shape[:2]
    if width > max_width:
        scale = max_width / width
        return cv2.resize(img, (int(width * scale), int(height * scale)), interpolation=cv2.INTER_AREA)
    return img

def convert_to_png(img):
    """Convert image to PNG format."""
    is_success, buffer = cv2.imencode(".png", img)
    if is_success:
        return cv2.imdecode(buffer, cv2.IMREAD_COLOR)
    return img

def run_tesseract(image):
    """Run Tesseract OCR with a timeout."""
    try:
        result = subprocess.run(
            ['tesseract', image, 'stdout', '--oem', '3', '--psm', '6'],
            capture_output=True, text=True, timeout=10  # Set timeout to prevent hanging
        )
        return result.stdout.strip()
    except subprocess.TimeoutExpired:
        return "Tesseract Timeout: Image too complex"
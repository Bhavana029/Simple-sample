import fitz  # PyMuPDF
import pdfplumber
import pytesseract
import tempfile
import os
from pdf2image import convert_from_path
import pytesseract

# Set Tesseract path
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def extract_text(uploaded_file):

    # Step 1 — Save to temporary file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(uploaded_file.read())
        temp_path = tmp.name

    text = ""

    # Step 2 — Try PyMuPDF
    try:
        doc = fitz.open(temp_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except:
        pass

    # Step 3 — If empty, try pdfplumber
    if not text.strip():
        try:
            with pdfplumber.open(temp_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except:
            pass

    # Step 4 — If still empty → OCR
    if not text.strip():
        images = convert_from_path(temp_path)
        for img in images:
            text += pytesseract.image_to_string(img)

    # Cleanup
    os.remove(temp_path)

    return text

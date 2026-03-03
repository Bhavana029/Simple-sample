import os
import whisper
import tempfile
import cv2
import easyocr
import re
from moviepy import VideoFileClip
from fastapi import UploadFile
# ---------------------------------------------------
# ENVIRONMENT SETUP
# ---------------------------------------------------

# os.environ["PATH"] += os.pathsep + r"C:\ffmpeg-8.0.1-essentials_build\ffmpeg-8.0.1-essentials_build\bin"

# Load Whisper model once
model = whisper.load_model("base")

# Load EasyOCR once
reader = easyocr.Reader(['en'], gpu=False)


# ===================================================
# 🔹 TEXT NORMALIZATION (GENE SAFE – DYNAMIC)
# ===================================================

NUMBER_MAP = {
    "zero": "0",
    "one": "1",
    "two": "2",
    "three": "3",
    "four": "4",
    "five": "5",
    "six": "6",
    "seven": "7",
    "eight": "8",
    "nine": "9",
    "ten": "10"
}


def convert_spoken_numbers(text):
    for word, digit in NUMBER_MAP.items():
        text = re.sub(rf"\b{word}\b", digit, text, flags=re.IGNORECASE)
    return text


def merge_spaced_letters(text):
    # Join patterns like F G F R 3
    text = re.sub(
        r"\b(?:[A-Z]\s+){2,}[A-Z0-9]\b",
        lambda m: m.group(0).replace(" ", ""),
        text
    )
    return text


def fix_or_to_r(text):
    # Fix patterns like "FGF or 3" → "FGFR3"
    text = re.sub(
        r"\b([A-Z]{2,})\s+or\s+(\d)\b",
        r"\1R\2",
        text,
        flags=re.IGNORECASE
    )
    return text


def normalize_gene_text(text):
    text = fix_gene_phrase(text)      # ADD FIRST
    text = convert_spoken_numbers(text)
    text = merge_spaced_letters(text)
    text = fix_or_to_r(text)
    text = fix_variant_format(text)   # ADD LAST
    return text

def fix_gene_phrase(text):
    # Convert "G name" → "gene name"
    text = re.sub(r"\bG name\b", "gene name", text, flags=re.IGNORECASE)

    # Convert "my G name" → "my gene name"
    text = re.sub(r"\bmy G\b", "my gene", text, flags=re.IGNORECASE)

    return text
def fix_variant_format(text):
    # Convert "C dot 1234A greater than G" → "c.1234A>G"
    text = re.sub(
        r"C dot (\d+)([A-Z]) greater than ([A-Z])",
        r"c.\1\2>\3",
        text,
        flags=re.IGNORECASE
    )
    return text

# ===================================================
# AUDIO → Whisper
# ===================================================



def extract_audio_text(uploaded_file: UploadFile):

    extension = os.path.splitext(uploaded_file.filename)[1] or ".webm"

    with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp:
        tmp.write(uploaded_file.file.read())
        temp_audio_path = tmp.name

    try:
        print("🎤 Transcribing:", temp_audio_path)

        result = model.transcribe(temp_audio_path)
        raw_text = result["text"].strip()

        print("🎤 Raw Result:", raw_text)

        clean_text = normalize_gene_text(raw_text)

        return clean_text

    except Exception as e:
        print("❌ Transcription error:", str(e))
        return ""

    finally:
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

# ===================================================
# VIDEO → Audio → Whisper
# If no speech → EasyOCR fallback
# ===================================================

def extract_video_text(uploaded_file):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        tmp.write(uploaded_file.read())
        temp_video_path = tmp.name

    temp_audio_path = temp_video_path + ".mp3"

    extracted_text = ""
    seen_lines = set()

    try:
        print("🎬 Opening video...")
        video = VideoFileClip(temp_video_path)

        # ---------------------------
        # STEP 1: Whisper from audio
        # ---------------------------
        if video.audio is not None:
            print("🎬 Extracting audio...")
            video.audio.write_audiofile(temp_audio_path)

            result = model.transcribe(temp_audio_path)
            extracted_text = result["text"].strip()

            print("🎬 Whisper Result:", extracted_text)

        video.close()

        # ---------------------------
        # STEP 2: OCR fallback
        # ---------------------------
        if not extracted_text:

            print("🔍 No speech detected. Running OCR...")

            cap = cv2.VideoCapture(temp_video_path)
            frame_count = 0

            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count % 30 == 0:
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    gray = cv2.GaussianBlur(gray, (5, 5), 0)
                    gray = cv2.resize(
                        gray,
                        None,
                        fx=2,
                        fy=2,
                        interpolation=cv2.INTER_CUBIC
                    )

                    results = reader.readtext(gray)

                    for (bbox, text, prob) in results:
                        clean_line = text.strip()

                        if prob > 0.6 and len(clean_line) > 2:
                            if clean_line not in seen_lines:
                                seen_lines.add(clean_line)
                                extracted_text += " " + clean_line

                frame_count += 1

            cap.release()

    except Exception as e:
        print("❌ Video processing error:", str(e))

    finally:
        if os.path.exists(temp_audio_path):
            try:
                os.remove(temp_audio_path)
            except:
                pass

        if os.path.exists(temp_video_path):
            try:
                os.remove(temp_video_path)
            except:
                pass

    # ---------------------------
    # FINAL CLEANING
    # ---------------------------
    clean_text = extracted_text.replace("\n", " ")
    clean_text = " ".join(clean_text.split())

    # 🔥 Normalize gene names dynamically
    clean_text = normalize_gene_text(clean_text)

    print("🧹 Final Extracted Text:", clean_text)

    return clean_text
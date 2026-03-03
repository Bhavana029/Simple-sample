from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from typing import Dict
from app.engines.clinical_ai_core import ClinicalAICore
from utils.pdf_extractor import extract_text
from utils.audio_extractor import extract_audio_text, extract_video_text
import joblib
from app.engines.ai_service import ClinicalAIService


app = FastAPI(title="Prenatal AI Copilot")

model_data = joblib.load("clinical_ai_model.pkl")

ai = ClinicalAIService(
    kb_data=model_data["kb_data"],
    clinvar_df=model_data["clinvar_df"]
)

# =========================
# MODELS
# =========================

class ChecklistRequest(BaseModel):
    gene: str = Field(..., description="Gene symbol is required")


class SelectionsModel(BaseModel):
    core: Dict[str, str] = Field(default_factory=dict)
    supportive: Dict[str, str] = Field(default_factory=dict)
    negative: Dict[str, str] = Field(default_factory=dict)


class PP4Request(BaseModel):
    gene: str
    gestation: int
    selections: SelectionsModel


class TextInputRequest(BaseModel):
    text: str
    gestation: int | None = None


# =========================
# 1️⃣ PDF Upload
# =========================

@app.post("/extract-pdf")
async def extract_pdf(
    file: UploadFile = File(...),
    gestation: int | None = None
):

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    text = extract_text(file.file)

    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="PDF is empty or unreadable.")

    return ai.extract_structured(text, gestation, source="pdf")


# =========================
# 2️⃣ Audio Upload
# =========================

@app.post("/extract-audio")
async def extract_audio(
    file: UploadFile = File(...),
    gestation: int | None = None
):
    print("==== AUDIO DEBUG ====")
    print("Filename:", file.filename)
    print("Content Type:", file.content_type)
    print("=====================")
    if not (
    file.content_type.startswith("audio") or file.filename.lower().endswith((".webm", ".mp3", ".wav"))):
        raise HTTPException(status_code=400, detail="Unsupported audio format.")
    text = extract_audio_text(file)
    print("========== DEBUG AUDIO ==========")
    print("Filename:", file.filename)
    print("Content Type:", file.content_type)
    print("Transcribed Text:", text)
    print("Length:", len(text.strip()) if text else 0)
    print("=================================")
    if not text:
        raise HTTPException(status_code=400, detail="Audio transcription returned empty.")

    return ai.extract_structured(text, gestation, source="audio")



# =========================
# 3️⃣ Video Upload
# =========================

@app.post("/extract-video")
async def extract_video(
    file: UploadFile = File(...),
    gestation: int | None = None
):

    if not file.filename.lower().endswith((".mp4", ".mov", ".avi")):
        raise HTTPException(status_code=400, detail="Unsupported video format.")

    text = extract_video_text(file.file)

    if not text or len(text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Video transcription failed.")

    return ai.extract_structured(text, gestation, source="video")



# =========================
# 4️⃣ Direct Text Input
# =========================

@app.post("/extract-text")
async def extract_text_input(request: TextInputRequest):

    if len(request.text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Text too short.")

    return ai.extract_structured(request.text, request.gestation, source="text")



# =========================
# Generate Checklist
# =========================

@app.post("/generate-checklist")
async def generate_checklist(request: ChecklistRequest):
    return ai.generate_checklist(request.gene)


# =========================
# Calculate PP4
# =========================

@app.post("/calculate-pp4")
async def calculate_pp4(request: PP4Request):

    pp4_result = ai.calculate_pp4(
        gene=request.gene,
        gestation=request.gestation,
        selections=request.selections.dict()
    )

    summaries = ai.generate_summaries(request.gene, pp4_result)

    return {
        "pp4_result": pp4_result,
        "summaries": summaries
    }

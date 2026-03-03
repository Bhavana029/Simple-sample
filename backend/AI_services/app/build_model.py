import pandas as pd
import json
import joblib

# Load ClinVar
clinvar_df = pd.read_csv("datasets/clinvar_100k.csv")

# Keep only needed columns (based on YOUR CSV)
clinvar_df = clinvar_df[[
    "GeneSymbol",
    "Name",
    "ClinicalSignificance"
]]

# Load KB
with open("datasets/gene_visibility_kb.json") as f:
    kb_data = json.load(f)

# Save lightweight structure
model_data = {
    "kb_data": kb_data,
    "clinvar_df": clinvar_df
}

joblib.dump(model_data, "clinical_ai_model.pkl")
print("Lightweight new model saved.")
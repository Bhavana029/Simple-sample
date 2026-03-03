from app.engines.genetic_extractor import GeneticExtractor
from app.engines.visibility_engine import GeneVisibilityModel
from app.engines.pp4_engine import PP4Engine
from app.engines.clinvar_engine import ClinVarEngine
from app.engines.nlp_phenotype_engine import NLPPhenotypeEngine
import re


class ClinicalAIService:

    def __init__(self, kb_data=None, clinvar_df=None):

        # Core engines
        self.genetic_extractor = GeneticExtractor()
        self.nlp_engine = NLPPhenotypeEngine()
        self.pp4_engine = PP4Engine()

        # Preloaded datasets (injected during build)
        self.kb_data = kb_data
        self.clinvar_engine = ClinVarEngine(clinvar_df)

    # =====================================================
    # STEP 1 — Extract Gene + Suggest Phenotypes
    # =====================================================

    def extract_structured(self, text, gestation=None, source="text"):

        # -------- Extract gene --------
        if source == "pdf":
            genetic = self.genetic_extractor.extract_pdf(text)
        else:
            genetic = self.genetic_extractor.extract_text(text)

        gene = genetic.get("gene")

        if not gene or gene == "UNKNOWN":
            return {
                "genetic": genetic,
                "suggested_phenotypes": [],
                "warning": "Gene not detected."
            }

        # -------- Load gene knowledge --------
        try:
            visibility = GeneVisibilityModel(gene, self.kb_data)
        except Exception:
            return {
                "genetic": genetic,
                "suggested_phenotypes": [],
                "warning": f"Gene {gene} not found in knowledge base."
            }

        checklist = visibility.checklist()

        checklist_terms = (
            checklist.get("core_prenatal_findings", []) +
            checklist.get("supportive_findings", [])
        )

        # -------- AI phenotype suggestion --------
        suggested = self.nlp_engine.extract_from_checklist(
            text,
            checklist_terms
        )

        return {
            "genetic": genetic,
            "suggested_phenotypes": suggested
        }

    # =====================================================
    # STEP 2 — Generate Gene Checklist
    # =====================================================

    def generate_checklist(self, gene):

        visibility = GeneVisibilityModel(gene, self.kb_data)

        return {
            "metadata": visibility.metadata(),
            "checklist": visibility.checklist()
        }

    # =====================================================
    # STEP 3 — Calculate PP4 Score
    # =====================================================

    def calculate_pp4(self, gene, gestation, selections):

        visibility = GeneVisibilityModel(gene, self.kb_data)
        metadata = visibility.metadata()

        result = self.pp4_engine.calculate(
            selections=selections,
            gestation=gestation,
            visibility_score=metadata.get("visibility_score", 0),
            gestational_profile=metadata.get("gestational_visibility_profile", {}),
            alternative_diagnosis=0,
            confidence_factor=metadata.get("confidence_factor", 1.0)
        )

        return result

    # =====================================================
    # STEP 4 — Generate Clinical Summaries
    # =====================================================

    def generate_summaries(self, gene, pp4_result):

        score = round(pp4_result.get("final_score", 0), 2)

        if score >= 4:
            risk_level = "High Risk"
            doctor_action = (
                "Urgent specialist evaluation is recommended. "
                "Consider detailed fetal imaging and multidisciplinary review."
            )
            patient_action = (
                "Please consult your doctor as soon as possible for further evaluation."
            )

        elif score >= 3:
            risk_level = "Moderate Risk"
            doctor_action = (
                "Further diagnostic evaluation and close follow-up are advised."
            )
            patient_action = (
                "We recommend discussing these findings with your doctor for further guidance."
            )

        else:
            risk_level = "Low Risk"
            doctor_action = (
                "Routine monitoring is appropriate unless new findings appear."
            )
            patient_action = (
                "At this time, the findings suggest a low likelihood. "
                "Regular prenatal check-ups are important."
            )

        doctor_summary = (
            f"Gene: {gene}\n"
            f"Final PP4 Score: {score}\n"
            f"Risk Category: {risk_level}\n\n"
            f"Interpretation:\n"
            f"The clinical findings show a {risk_level.lower()} correlation with the gene.\n\n"
            f"Recommended Action:\n"
            f"{doctor_action}"
        )

        patient_summary = (
            f"Your test related to {gene} shows a {risk_level.lower()} "
            f"based on the ultrasound findings.\n\n"
            f"This result does not confirm a diagnosis, "
            f"but helps your healthcare team understand possible risk.\n\n"
            f"{patient_action}"
        )

        return {
            "doctor_summary": doctor_summary,
            "patient_summary": patient_summary,
            "risk_level": risk_level
        }
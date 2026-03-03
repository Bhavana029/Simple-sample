class GeneVisibilityModel:

    def __init__(self, gene_symbol, kb_data=None):

        if kb_data is None:
            raise ValueError("Knowledge base not loaded")

        self.kb = kb_data

        if gene_symbol not in self.kb:
            raise ValueError(f"Gene {gene_symbol} not found in KB")

        self.data = self.kb[gene_symbol]

    def metadata(self):
        return {
            "inheritance": self.data.get("inheritance", []),
            "category": self.data.get("category", "Unknown"),
            "embryologic_role": self.data.get("embryologic_role", "Unknown"),
            "visibility_class": self.data.get("visibility_class", "moderate"),
            "visibility_score": self.data.get("visibility_score", 0.5),
            "gestational_visibility_profile": self.data.get(
                "gestational_visibility_profile",
                {"first_visible_week": None}
            ),
            "progressive_over_time": self.data.get("progressive_over_time", False),
            "confidence_factor": self.data.get("confidence_factor", 1.0)
        }

    def checklist(self):
        return {
            "core_prenatal_findings": self.data.get("core_prenatal_findings", []),
            "supportive_findings": self.data.get("supportive_findings", []),
            "fetal_echo_findings": self.data.get("fetal_echo_findings", []),
            "negative_predictors": self.data.get("negative_predictors", [])
        }

    def multiplier(self):
        score = self.data.get("visibility_score", 0.5)

        if score >= 0.7:
            return 1.0
        elif score >= 0.4:
            return 0.8
        elif score >= 0.2:
            return 0.6
        else:
            return 0.4
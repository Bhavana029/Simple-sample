from datetime import datetime


class PP4Engine:

    def calculate(
        self,
        selections,
        gestation,
        visibility_score,
        gestational_profile,
        alternative_diagnosis=0,
        confidence_factor=1.0
    ):

        # 🔥 Normalize values to lowercase
        for category in selections:
            for key in selections[category]:
                if isinstance(selections[category][key], str):
                    selections[category][key] = selections[category][key].lower()

        # -----------------------------
        # Count Present Findings
        # -----------------------------
        core_present = sum(
            1 for v in selections.get("core", {}).values()
            if v == "present"
        )

        supportive_present = sum(
            1 for v in selections.get("supportive", {}).values()
            if v == "present"
        )

        negative_present = sum(
            1 for v in selections.get("negative", {}).values()
            if v == "present"
        )

        # -----------------------------
        # Gestational Bonus
        # -----------------------------
        gestation_bonus = 0

        if gestational_profile:
            first_visible_week = gestational_profile.get("first_visible_week")
            if first_visible_week and gestation >= first_visible_week:
                gestation_bonus = 0.5

        # -----------------------------
        # Raw Score
        # -----------------------------
        raw_score = (
            (2 * core_present)
            + (1 * supportive_present)
            - (2 * negative_present)
            - (3 * alternative_diagnosis)
            + gestation_bonus
        )

        # -----------------------------
        # Visibility Multiplier
        # -----------------------------
        if visibility_score >= 0.7:
            multiplier = 1.0
        elif visibility_score >= 0.4:
            multiplier = 0.8
        elif visibility_score >= 0.2:
            multiplier = 0.6
        else:
            multiplier = 0.4

        # -----------------------------
        # Final Score
        # -----------------------------
        final_score = raw_score * multiplier * confidence_factor

        # -----------------------------
        # Classification
        # -----------------------------
        if final_score >= 3:
            state = "PP4_TRUE"
        elif final_score >= 1:
            state = "PP4_POSSIBLE"
        else:
            state = "PP4_NOT_MET"

        return {
            "raw_score": raw_score,
            "multiplier": multiplier,
            "confidence_factor": confidence_factor,
            "final_score": round(final_score, 2),
            "state": state,
            "timestamp": datetime.utcnow().isoformat()
        }
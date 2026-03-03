import re


class GeneticExtractor:

    # =========================
    # PDF Extraction (Structured)
    # =========================
    def extract_pdf(self, text):

        result = {"gene": "UNKNOWN", "variant": "UNKNOWN"}

        if not text:
            return result

        clean = text.replace("\n", " ")

        # ------------------------------
        # Gene patterns (PDF structured)
        # ------------------------------

        gene_patterns = [
            r"\bGene\b\s*[:\-]\s*([A-Za-z0-9\-]+)",
            r"\bGene\s+Identified\b\s*[:\-]?\s*([A-Za-z0-9\-]+)",
            r"\bGene\b\s+([A-Za-z0-9\-]+)"
        ]

        for pattern in gene_patterns:
            match = re.search(pattern, clean, re.IGNORECASE)
            if match:
                result["gene"] = match.group(1).upper()
                break

        # ------------------------------
        # Variant extraction
        # ------------------------------

        variant_match = re.search(
            r"(c\.\d+[A-Za-z]?>[A-Za-z]?)",
            clean,
            re.IGNORECASE
        )

        if variant_match:
            result["variant"] = variant_match.group(1).upper()

        return result



    # =========================
    # AUDIO / VIDEO Extraction (Speech Pattern)
    # =========================
    # def extract_audio(self, text):

    #     result = {"gene": "UNKNOWN", "variant": "UNKNOWN"}

    #     if not text:
    #         return result

    #     clean = text.replace(",", " ").replace(".", " ")
    #     clean = re.sub(r"[^A-Za-z0-9\s\.]", " ", clean)
    #     # identified L1 cam
    #     gene_match = re.search(
    #         r"\bidentified\b\s+([A-Za-z0-9\s]+)",
    #         clean,
    #         re.IGNORECASE
    #     )

    #     if gene_match:
    #         tokens = gene_match.group(1).split()
    #         tokens = tokens[:2]
    #         gene = "".join(tokens)
    #         gene = gene.replace(" ", "")
    #         gene = re.sub(r"[^A-Za-z0-9]", "", gene)

    #         if len(gene) >= 3:
    #             result["gene"] = gene.upper()

    #     # speech variant: c 1234 greater than G
    #     variant_match = re.search(
    #         r"c\s*\.?\s*(\d+)\s*(greater than|>)\s*([A-Za-z])",
    #         clean,
    #         re.IGNORECASE
    #     )

    #     if variant_match:
    #         result["variant"] = f"C.{variant_match.group(1)}>{variant_match.group(3)}".upper()

    #     return result


    # =========================
    # Direct Text Extraction
    # =========================
# =========================
# Direct Text Extraction
# =========================

    def extract_text(self, text):

        result = {"gene": "UNKNOWN", "variant": "UNKNOWN"}

        if not text:
            return result

        clean = text.upper()

        # -------------------------------------------------
        # 🔥 NORMALIZATION LAYER (VERY IMPORTANT)
        # -------------------------------------------------

        # Convert spoken "greater than" to >
        clean = re.sub(r"\s+GREATER\s+THAN\s+", ">", clean)

        # Merge patterns like "L1 CAM" → "L1CAM"
        clean = re.sub(
            r"\b([A-Z]\d)\s+([A-Z]{2,6})\b",
            r"\1\2",
            clean
        )

        # Merge fully spaced genes like "L 1 C A M"
        clean = re.sub(
            r"\b(?:[A-Z0-9]\s+){2,}[A-Z0-9]\b",
            lambda m: m.group(0).replace(" ", ""),
            clean
        )

        # Normalize variant like "C 1234 > G" → "C.1234>G"
        clean = re.sub(
            r"C\s*\.?\s*(\d+)\s*>\s*([A-Z])",
            r"C.\1>\2",
            clean
        )

        # Remove punctuation noise
        clean = re.sub(r"[^\w\s\.>]", " ", clean)

        # -------------------------------------------------
        # 🧬 DYNAMIC GENE DETECTION
        # -------------------------------------------------

        STOPWORDS = {
            "REPORT", "GENETIC", "PRENATAL", "VARIANT",
            "ULTRASOUND", "FINDINGS", "INCLUDE",
            "IDENTIFIED", "PATIENT", "FETAL",
            "VENTRICULAR", "MILD"
        }

        words = re.findall(r"\b[A-Z0-9]{3,15}\b", clean)

        best_candidate = None
        best_score = 0

        for word in words:

            if word in STOPWORDS:
                continue

            if word.isdigit():
                continue

            score = 0

            # Strong gene indicator: contains number (L1CAM, FGFR3)
            if re.search(r"\d", word):
                score += 5

            # Alphabet gene length typical (3–6)
            if word.isalpha() and 3 <= len(word) <= 6:
                score += 2

            # Penalize long English-like words
            if len(word) > 10:
                score -= 1

            if score > best_score:
                best_score = score
                best_candidate = word

        if best_candidate:
            result["gene"] = best_candidate

        # -------------------------------------------------
        # 🧬 VARIANT DETECTION
        # -------------------------------------------------

        variant_match = re.search(
            r"(C\.\d+[A-Z]?>[A-Z]?|P\.[A-Z]+\d+[A-Z]+)",
            clean
        )

        if variant_match:
            result["variant"] = variant_match.group(1).upper()

        print("🧬 FINAL CLEAN TEXT:", clean)
        print("🧬 FINAL EXTRACTED:", result)

        return result
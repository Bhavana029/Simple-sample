from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np


class NLPPhenotypeEngine:
    """
    Embedding-based phenotype matcher.
    Transformer model is NOT stored in pickle.
    """

    def __init__(self, model_name="all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.model = SentenceTransformer(model_name)

    # 🔥 Prevent transformer from being pickled
    def __getstate__(self):
        state = self.__dict__.copy()
        if "model" in state:
            del state["model"]
        return state

    # 🔥 Reload transformer automatically after unpickling
    def __setstate__(self, state):
        self.__dict__.update(state)
        self.model = SentenceTransformer(self.model_name)

    def extract_from_checklist(self, text, checklist_terms, threshold=0.65):

        if not text or not checklist_terms:
            return []

        text = text.lower()

        sentences = [
            s.strip()
            for s in text.split(".")
            if s.strip()
        ]

        if not sentences:
            return []

        sentence_embeddings = self.model.encode(
            sentences,
            show_progress_bar=False
        )

        term_embeddings = self.model.encode(
            checklist_terms,
            show_progress_bar=False
        )

        detected = set()

        for sent_emb in sentence_embeddings:

            similarities = cosine_similarity(
                [sent_emb],
                term_embeddings
            )[0]

            best_index = np.argmax(similarities)
            best_score = similarities[best_index]

            if best_score >= threshold:
                detected.add(checklist_terms[best_index])

        return list(detected)
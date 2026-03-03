class ClinVarEngine:

    def __init__(self, dataframe=None):
        """
        dataframe: preloaded ClinVar dataframe
        (injected during model build)
        """
        self.df = dataframe

    def validate(self, gene, variant):

        if self.df is None:
            return "ClinVar data not loaded"

        result = self.df[
            (self.df["Gene"] == gene) &
            (self.df["Variant"] == variant)
        ]

        if result.empty:
            return "Not Found"

        return result.iloc[0]["ClinicalSignificance"]
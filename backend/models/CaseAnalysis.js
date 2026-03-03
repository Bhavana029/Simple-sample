const mongoose = require("mongoose");

const CaseanalyisSchema = new mongoose.Schema(
  {
    caseNumber: String,
    gene: String,
    variant: String,
    gestation: Number,

    checklistMetadata: Object,

    pp4Result: Object,
    summaries: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("CaseAnalysis", CaseanalyisSchema);
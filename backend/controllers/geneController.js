
const Case = require("../models/caseModel");
const History = require("../models/historyModel");
const fastapiService = require("../services/fastapiService");


// =============================
// 1️⃣ START ANALYSIS
// =============================

exports.startAnalysis = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { type, text, gestation } = req.body;

    if (!caseId || caseId === "undefined") {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const doctorId = req.user?.id || caseData.doctorId;

    let result;

    // 🔹 FILE INPUT
    if (req.file) {
      result = await fastapiService.extractFile(req.file, gestation);
    }

    // 🔹 TEXT INPUT
    else if (type === "text") {
      result = await fastapiService.extractText(text, gestation);
    }

    else {
      return res.status(400).json({ message: "Invalid input type" });
    }

    // 🚨 Stop if gene not detected
    if (
      !result?.genetic?.gene ||
      result.genetic.gene === "UNKNOWN" ||
      result.warning
    ) {
      return res.json(result);
    }

    // ✅ Update Case Basic Gene Info
    const updateData = {
      gene: result.genetic.gene,
      variant: result.genetic.variant,
      gestation,
      status: "Under Review" // 🔥 AUTO STATUS CHANGE
    };

    // ✅ Save file info ONLY if file exists
    if (req.file) {
      updateData.reportFile = req.file.originalname;
      updateData.reportFileType = req.file.mimetype;
    }

    await Case.findByIdAndUpdate(caseId, updateData);

    // ✅ Add History
    await History.create({
      doctorId,
      caseId,
      caseNumber: caseData.patientId,
      action: "GENE_ANALYSIS",
      details: `Gene ${result.genetic.gene} extracted with variant ${result.genetic.variant}`
    });

    res.json(result);

  } catch (error) {
    console.error("Start Analysis Error:", error);
    res.status(500).json({ message: "Analysis failed" });
  }
};

// =============================
// 2️⃣ LOAD CHECKLIST
// =============================
exports.loadChecklist = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { gene } = req.body;

    console.log("Checklist caseId:", caseId);
    console.log("Checklist gene:", gene);

    if (!gene) {
      return res.status(400).json({ message: "Gene missing" });
    }

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // 🔥 Call FastAPI
    const fastapiResponse = await fastapiService.generateChecklist(gene);

    // 🔥 Transform structure for frontend
    const formattedChecklist = [
      {
        title: "Core Findings",
        items: fastapiResponse.checklist?.core_prenatal_findings || []
      },
      {
        title: "Fetal Echo Findings",
        items: fastapiResponse.checklist?.fetal_echo_findings || []
      },
      {
        title: "Supportive Findings",
        items: fastapiResponse.checklist?.supportive_findings || []
      },
      {
        title: "Negative Findings",
        items: fastapiResponse.checklist?.negative_predictors || []
      }
    ];

    // Optional: Save metadata too
    await Case.findByIdAndUpdate(caseId, {
      checklistMetadata: fastapiResponse.metadata
    });

    res.json({
  checklist: formattedChecklist,
  metadata: fastapiResponse.metadata
});
  } catch (error) {
    console.error("Checklist controller error:", error);
    res.status(500).json({ message: "Checklist failed" });
  }
};

// =============================
// 3️⃣ CALCULATE PP4
// =============================
exports.calculatePP4 = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { gene, gestation, selections } = req.body;

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const doctorId = req.user?.id || caseData.doctorId;

    const result = await fastapiService.calculatePP4({
      gene,
      gestation,
      selections
    });

    await Case.findByIdAndUpdate(caseId, {
  pp4: {
    rawScore: result.pp4_result.raw_score,
    finalScore: result.pp4_result.final_score,
    riskLevel: result.summaries?.risk_level,
    calculatedAt: new Date()
  },
  summary: result.summaries?.doctor_summary || "",
  status: "Completed" // 🔥 AUTO COMPLETE
});

    await History.create({
  doctorId,
  caseId,
  caseNumber: caseData.patientId,
  action: "PP4_RESULT",
  details: `Final Score: ${result.pp4_result.final_score}, State: ${result.pp4_result.state}`
});

    res.json(result);

  } catch (error) {
    console.error("PP4 controller error:", error);
    res.status(500).json({ message: "PP4 calculation failed" });
  }
};
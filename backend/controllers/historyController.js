const History = require("../models/historyModel");
const Case = require("../models/caseModel"); // 🔥 ADD THIS
// ================= ADD HISTORY =================
exports.addHistory = async (req, res) => {
  try {
    const { caseId, action, details } = req.body;

    const caseData = await Case.findById(caseId);

    const history = await History.create({
      doctorId: req.user.id,
      caseId,
      caseNumber: caseData?.patientId || "",  // 🔥 STORE case-001
      action,
      details
    });

    res.status(201).json(history);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET DOCTOR HISTORY =================
// ================= GET DOCTOR HISTORY =================
exports.getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const action = req.query.action;
    const timeFilter = req.query.timeFilter;

    const query = { doctorId: req.user.id };

    // Action filter
    if (action && action !== "ALL") {
      query.action = action;
    }

    // Time filter
    if (timeFilter) {
      const now = new Date();
      let fromDate;

      if (timeFilter === "TODAY") {
        fromDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeFilter === "WEEK") {
        fromDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeFilter === "MONTH") {
        fromDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      if (fromDate) {
        query.createdAt = { $gte: fromDate };
      }
    }

    const total = await History.countDocuments(query);

    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formatted = history.map(item => ({
      id: item._id,
       caseId: item.conversationTitle 
    ? item.conversationTitle 
    : item.caseNumber || "N/A",
    
      mongoCaseId: item.caseId,
      action: item.action,
     message: item.message || item.details,
      timestamp: new Date(item.createdAt).toLocaleString()
    }));

    res.json({
      data: formatted,
      total,
      page,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CLEAR HISTORY =================
exports.clearHistory = async (req, res) => {
  try {
    await History.deleteMany({
      doctorId: req.user.id
    });

    res.json({ message: "History cleared successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= DELETE SINGLE HISTORY =================
exports.deleteSingleHistory = async (req, res) => {
  try {
    const { id } = req.params;

    await History.findOneAndDelete({
      _id: id,
      doctorId: req.user.id
    });

    res.json({ message: "History item deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
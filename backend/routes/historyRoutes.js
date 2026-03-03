const express = require("express");
const router = express.Router();
const controller = require("../controllers/historyController");
const authMiddleware = require("../middleware/authMiddleware");

// Add history
router.post("/", authMiddleware, controller.addHistory);

// Get history
router.get("/", authMiddleware, controller.getHistory);

// Clear entire history
router.delete("/", authMiddleware, controller.clearHistory);

// ✅ DELETE single history
router.delete("/:id", authMiddleware, controller.deleteSingleHistory);

module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/doctorProfileController");
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

// Create profile
router.post(
  "/",
  authMiddleware,
  upload.single("profileImage"),
  controller.createProfile
);

// Get profile
router.get(
  "/:doctorId",
  authMiddleware,
  controller.getProfile
);

// Update profile
router.put(
  "/:doctorId",
  authMiddleware,                // 🔥 VERY IMPORTANT
  upload.single("profileImage"),
  controller.updateProfile
);

module.exports = router;
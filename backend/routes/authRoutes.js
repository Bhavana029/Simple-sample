const express = require("express");
const router = express.Router();

const {
  signup,
  signin
 
} = require("../controllers/authController");

// ================= AUTH ROUTES =================

// Register new user
router.post("/signup", signup);

// Login user
router.post("/signin", signin);


module.exports = router;
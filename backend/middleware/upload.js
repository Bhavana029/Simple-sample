const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {

    // 🔥 Get doctorId from JWT (secure way)
    const doctorId = req.user?.id || "doctor";

    // 🔥 Clean filename (remove spaces, special chars)
    const safeName = doctorId.replace(/[^a-zA-Z0-9]/g, "");

    const extension = path.extname(file.originalname);

    const fileName = `profile_${safeName}${extension}`;

    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;
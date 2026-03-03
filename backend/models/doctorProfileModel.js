const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one profile per doctor
    },
    fullName: {
      type: String,
      required: true  
    },
    specialty: {
      type: String,
      required: true
    },
    phone: {
      type: String
    },
    institution: {
      type: String
    },
    profileImage: {
      type: String // store image path or URL
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);

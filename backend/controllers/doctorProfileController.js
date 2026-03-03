const DoctorProfile = require("../models/doctorProfileModel");


// Create Profile
exports.createProfile = async (req, res) => {
  try {
    const profileData = {
      ...req.body,
      profileImage: req.file ? req.file.filename : null
    };

    const profile = await DoctorProfile.create(profileData);

    res.status(201).json(profile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Get Profile by Doctor ID
exports.getProfile = async (req, res) => {
  try {
    const profile = await DoctorProfile.findOne({
      doctorId: req.params.doctorId
    }).populate("doctorId", "name email role");

    if (!profile) {
      // 🔥 Instead of 404, return empty profile structure
      return res.status(200).json({
        fullName: "",
        specialty: "",
        phone: "",
        institution: "",
        profileImage: null,
        doctorId: {
          email: ""
        }
      });
    }

    res.json(profile);

  } catch (error) {
    console.log("GET PROFILE ERROR:", error);  // 🔥 log real error
    res.status(500).json({ message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {

    const updateData = {
      fullName: req.body.fullName,
      specialty: req.body.specialty,
      phone: req.body.phone,
      institution: req.body.institution,
      doctorId: req.params.doctorId
    };

    // 🔥 Only set profileImage if file uploaded
    if (req.file) {
      updateData.profileImage = req.file.filename;
    }

    const updatedProfile = await DoctorProfile.findOneAndUpdate(
      { doctorId: req.params.doctorId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
console.log("FILE:", req.file);
    res.json(updatedProfile);
   console.log("FILE:", req.file);

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};
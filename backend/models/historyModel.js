const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case"
    },
    caseNumber: {
      type: String
    },
    action: {
      type: String,
      required: true
    },
    details: {
      type: String
    },
     message: {              // ✅ ADD THIS
    type: String
  },
  conversationId: {       // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation"
  },
  conversationTitle: {    // ✅ ADD THIS
    type: String
  }


  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);
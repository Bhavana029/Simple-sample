const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },
    sender: {
      type: String,
      enum: ["doctor", "ai"],
      required: true
    },

    analysisSource: {
  type: String
},
fileName: {
  type: String
},
    text: String,
    type: String,
    data: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
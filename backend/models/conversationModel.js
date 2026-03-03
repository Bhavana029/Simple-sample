// models/conversationModel.js

const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true
  },
  title: {
    type: String,
    default: "New Conversation"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  conversationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Conversation"
},

conversationTitle: {
  type: String
}
});

module.exports = mongoose.model("Conversation", conversationSchema);
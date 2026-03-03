const express = require("express");
const router = express.Router();

const upload = require("../middleware/reportUpload");
const chatController = require("../controllers/chatcontroller");
const authMiddleware = require("../middleware/authMiddleware");
/*
=====================================
1️⃣ Chat Route (File or Text)
=====================================
*/

router.post(
  "/chat",
  authMiddleware,        // 🔥 ADD THIS
  upload.single("file"),
  chatController.handleChat
);
/*
=====================================
2️⃣ Generate Checklist
=====================================
*/

router.post(
  "/checklist",
  authMiddleware,
  chatController.generateChecklist
);
/*
=====================================
3️⃣ Calculate PP4
=====================================
*/

router.post(
  "/pp4",
  authMiddleware,
  chatController.calculatePP4
);
/*
=====================================
4️⃣ Conversation Management
=====================================
*/

router.post(
  "/chat/conversation",
  authMiddleware,
  chatController.createConversation
);

router.delete(
  "/chat/conversation/:id",
  authMiddleware,
  chatController.deleteConversation
);

router.put(
  "/chat/conversation/:id",
  authMiddleware,
  chatController.renameConversation
);

router.get(
  "/chat/conversation",
  authMiddleware,
  chatController.getConversations
);

router.get("/chat/messages/:conversationId",authMiddleware, chatController.getMessages);

router.post(
  "/chat/checklist-summary",
  authMiddleware,
  chatController.saveChecklistSummary
);


router.post(
  "/chat/simple",
  authMiddleware,
  chatController.saveSimpleMessage
);
module.exports = router;

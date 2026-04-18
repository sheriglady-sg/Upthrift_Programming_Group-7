const express = require("express");
const router = express.Router();

const messageController = require("../controllers/messageController");
const upload = require("../config/messageUpload");


// Render messages inbox page
router.get("/", messageController.renderMessagesPage);

//API routes
router.post("/conversation", messageController.createConversation); //creates a new conversation
router.get("/user/conversations", messageController.getUserConversations); // will get all conversations for the logged in user
router.get("/conversation/:conversationId", messageController.getMessagesByConversation); // all messages in a conversation
router.get("/new", messageController.renderNewMessagePage); //New message
router.post("/send", messageController.sendMessage); //send a message
router.post("/send-image", upload.single("image"), messageController.sendImageMessage); //image upload
router.post("/start", messageController.startConversationAndRedirect);

module.exports = router;



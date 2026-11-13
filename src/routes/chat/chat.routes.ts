
import express from "express";
import authMiddleware from "../../middleware/authMiddleware.ts";
import {
    CreateConversationController,
    GetConversationsController,
    GetMessagesController,
    SendMessageController,
    EditMessageController,
    DeleteMessageController
} from "../../controllers/chat/chat.controller.ts";

const router = express.Router();

router.post("/conversations", authMiddleware, CreateConversationController);
router.get("/conversations", authMiddleware, GetConversationsController);

router.post(
    "/conversations/:conversationId/messages",
    authMiddleware,
    SendMessageController
);

router.patch(
    "/conversations/:conversationId/messages/:messageId",
    authMiddleware,
    EditMessageController
);

router.delete(
    "/conversations/:conversationId/messages/:messageId",
    authMiddleware,
    DeleteMessageController
);

router.get(
    "/conversations/:conversationId/messages",
    authMiddleware,
    GetMessagesController
);

export default router;
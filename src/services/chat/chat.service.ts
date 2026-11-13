
import { ObjectId } from "mongodb";
import type { RowDataPacket } from "mysql2";
import dataBase from "../../db.ts";
import AppError from "../../errors/AppError.ts";
import type { MessageDocument } from "../../models/message.model.ts";
import {
    createConversation,
    getConversationForUser,
    getUserConversations
} from "../../repositories/chat/conversationRep.ts";
import {
    findMessage,
    findMessagesByIds,
    insertMessage,
    listMessages,
    updateMessage,
    deleteMessage
} from "../../repositories/chat/messageRep.ts";
import type { UserConversationRow } from "../../types/chat.types.ts";

const MAX_MESSAGE_LENGTH = 4000;
const DEFAULT_MESSAGE_LIMIT = 50;
const MAX_MESSAGE_LIMIT = 100;

type MessageWithReply = MessageDocument & {
    replyToMessage: {
        _id: ObjectId;
        senderId: number;
        body: string;
    } | null;
};

const userExists = async (userId: number): Promise<boolean> => {
    const [rows] = await dataBase.query<RowDataPacket[]>(
        `SELECT id FROM users WHERE id = ? LIMIT 1`,
        [userId]
    );

    return rows.length > 0;
};

const requirePermanentSession = (sessionType: string | undefined): void => {
    if (sessionType !== "permanent") {
        throw new AppError("Full authentication required", 403);
    }
};

const CreateConversationService = async (
    userId: number,
    targetUserId: number,
    sessionType: string | undefined
): Promise<number> => {
    requirePermanentSession(sessionType);

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
        throw new AppError("Invalid target user id", 400);
    }

    if (targetUserId === userId) {
        throw new AppError("Cannot create a conversation with yourself", 400);
    }

    const exists = await userExists(targetUserId);

    if (!exists) {
        throw new AppError("Target user not found", 404);
    }

    return createConversation(userId, targetUserId);
};

const GetConversationsService = async (
    userId: number,
    sessionType: string | undefined
): Promise<UserConversationRow[]> => {
    requirePermanentSession(sessionType);
    return getUserConversations(userId);
};

const requireConversationMember = async (
    conversationId: number,
    userId: number
): Promise<void> => {
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
        throw new AppError("Invalid conversation id", 400);
    }

    const membership = await getConversationForUser(conversationId, userId);

    if (!membership) {
        throw new AppError("Conversation not found", 404);
    }
};

const SendMessageService = async (
    userId: number,
    conversationId: number,
    body: unknown,
    replyTo: unknown,
    sessionType: string | undefined
): Promise<MessageDocument> => {
    requirePermanentSession(sessionType);
    await requireConversationMember(conversationId, userId);

    if (typeof body !== "string") {
        throw new AppError("Message body is required", 400);
    }

    const text = body.trim();

    if (text.length === 0) {
        throw new AppError("Message body is required", 400);
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
        throw new AppError("Message body is too long", 400);
    }

    let replyToId: ObjectId | null = null;

    if (replyTo !== undefined && replyTo !== null) {
        if (typeof replyTo !== "string" || !ObjectId.isValid(replyTo)) {
            throw new AppError("Invalid reply message id", 400);
        }

        replyToId = new ObjectId(replyTo);

        const originalMessage = await findMessage({
            messageId: replyToId,
            conversationId
        });

        if (!originalMessage || originalMessage.deletedAt) {
            throw new AppError("Reply message not found", 404);
        }
    }

    return insertMessage({
        conversationId,
        senderId: userId,
        body: text,
        replyTo: replyToId
    });
};

const GetMessagesService = async (
    userId: number,
    conversationId: number,
    sessionType: string | undefined,
    limitQuery: unknown,
    beforeQuery: unknown
): Promise<{
    messages: MessageWithReply[];
    nextCursor: string | null;
}> => {
    requirePermanentSession(sessionType);
    await requireConversationMember(conversationId, userId);

    let limit = DEFAULT_MESSAGE_LIMIT;

    if (limitQuery !== undefined) {
        const parsed = Number(limitQuery);

        if (!Number.isInteger(parsed) || parsed < 1) {
            throw new AppError("Invalid limit", 400);
        }

        limit = Math.min(parsed, MAX_MESSAGE_LIMIT);
    }

    let before: string | undefined;

    if (beforeQuery !== undefined && beforeQuery !== "") {
        if (typeof beforeQuery !== "string" || !ObjectId.isValid(beforeQuery)) {
            throw new AppError("Invalid pagination cursor", 400);
        }

        before = beforeQuery;
    }

    const messages = await listMessages({
        conversationId,
        limit,
        before
    });

    const replyIds = [
        ...new Map(
            messages
                .filter((message) => message.replyTo instanceof ObjectId)
                .map((message) => [
                    message.replyTo!.toHexString(),
                    message.replyTo!
                ])
        ).values()
    ];

    const originalMessages = await findMessagesByIds({
        messageIds: replyIds,
        conversationId
    });

    const originalMessagesMap = new Map(
        originalMessages.map((message) => [
            message._id!.toHexString(),
            message
        ])
    );

    const messagesWithReplies: MessageWithReply[] = messages.map((message) => {
        const originalMessage = message.replyTo
            ? originalMessagesMap.get(message.replyTo.toHexString())
            : null;

        return {
            ...message,
            replyToMessage: originalMessage?._id
                ? {
                    _id: originalMessage._id,
                    senderId: originalMessage.senderId,
                    body: originalMessage.deletedAt
                        ? "This message was deleted"
                        : originalMessage.body
                }
                : null
        };
    });

    const lastMessage = messages[messages.length - 1];

    const nextCursor = messages.length === limit && lastMessage?._id
        ? lastMessage._id.toHexString()
        : null;

    return {
        messages: messagesWithReplies,
        nextCursor
    };
};

const EditMessageService = async (
    userId: number,
    conversationId: number,
    messageId: unknown,
    body: unknown,
    sessionType: string | undefined
): Promise<MessageDocument> => {
    requirePermanentSession(sessionType);
    await requireConversationMember(conversationId, userId);

    if (typeof messageId !== "string" || !ObjectId.isValid(messageId)) {
        throw new AppError("Invalid message id", 400);
    }

    if (typeof body !== "string") {
        throw new AppError("Message body is required", 400);
    }

    const text = body.trim();

    if (text.length === 0) {
        throw new AppError("Message body is required", 400);
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
        throw new AppError("Message body is too long", 400);
    }

    const updatedMessage = await updateMessage({
        messageId: new ObjectId(messageId),
        conversationId,
        senderId: userId,
        body: text
    });

    if (!updatedMessage) {
        throw new AppError("Message not found", 404);
    }

    return updatedMessage;
};

const DeleteMessageService = async (
    userId: number,
    conversationId: number,
    messageId: unknown,
    sessionType: string | undefined
): Promise<MessageDocument> => {
    requirePermanentSession(sessionType);
    await requireConversationMember(conversationId, userId);

    if (typeof messageId !== "string" || !ObjectId.isValid(messageId)) {
        throw new AppError("Invalid message id", 400);
    }

    const deletedMessage = await deleteMessage({
        messageId: new ObjectId(messageId),
        conversationId,
        senderId: userId
    });

    if (!deletedMessage) {
        throw new AppError("Message not found", 404);
    }

    return deletedMessage;
};

export {
    CreateConversationService,
    GetConversationsService,
    SendMessageService,
    GetMessagesService,
    EditMessageService,
    DeleteMessageService
};

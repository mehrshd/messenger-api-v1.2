
import type { Request, Response } from "express";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";
import {
    CreateConversationService,
    GetConversationsService,
    GetMessagesService,
    SendMessageService,
    EditMessageService,
    DeleteMessageService
} from "../../services/chat/chat.service.ts";

const requireUser = (req: Request) => {
    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }

    return req.user;
};

const parseConversationId = (value: string | string[] | undefined): number => {
    const raw = Array.isArray(value) ? value[0] : value;
    const conversationId = Number(raw);

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
        throw new AppError("Invalid conversation id", 400);
    }

    return conversationId;
};

const CreateConversationController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversationId = await CreateConversationService(
        user.id,
        Number(req.body?.targetUserId),
        user.sessionType
    );

    return successResponse(res, "Conversation ready", { conversationId });
};

const GetConversationsController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversations = await GetConversationsService(
        user.id,
        user.sessionType
    );

    return successResponse(res, "Conversations retrieved successfully", {
        conversations
    });
};

const SendMessageController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversationId = parseConversationId(req.params.conversationId);

    const message = await SendMessageService(
        user.id,
        conversationId,
        req.body?.body,
        req.body?.replyTo,
        user.sessionType
    );

    return successResponse(res, "Message sent", { message });
};

const EditMessageController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversationId = parseConversationId(req.params.conversationId);

    const message = await EditMessageService(
        user.id,
        conversationId,
        req.params.messageId,
        req.body?.body,
        user.sessionType
    );

    return successResponse(res, "Message updated successfully", { message });
};

const DeleteMessageController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversationId = parseConversationId(req.params.conversationId);

    const message = await DeleteMessageService(
        user.id,
        conversationId,
        req.params.messageId,
        user.sessionType
    );

    return successResponse(res, "Message deleted successfully", { message });
};

const GetMessagesController = async (req: Request, res: Response) => {
    const user = requireUser(req);
    const conversationId = parseConversationId(req.params.conversationId);

    const result = await GetMessagesService(
        user.id,
        conversationId,
        user.sessionType,
        req.query.limit,
        req.query.before
    );

    return successResponse(res, "Messages retrieved successfully", result);
};

export {
    CreateConversationController,
    GetConversationsController,
    SendMessageController,
    EditMessageController,
    DeleteMessageController,
    GetMessagesController
};
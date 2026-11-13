
import { ObjectId, type Filter } from "mongodb";
import { getMongoDb } from "../../db/mongodb.ts";
import type { MessageDocument } from "../../models/message.model.ts";

const MESSAGES_COLLECTION = "messages";

const messagesCollection = () => {
    return getMongoDb().collection<MessageDocument>(MESSAGES_COLLECTION);
};

const ensureMessageIndexes = async (): Promise<void> => {
    await messagesCollection().createIndex(
        { conversationId: 1, _id: -1 },
        { name: "conversationId_id_desc" }
    );
};

type InsertMessageInput = {
    conversationId: number;
    senderId: number;
    body: string;
    replyTo?: ObjectId | null;
};

const insertMessage = async (
    input: InsertMessageInput
): Promise<MessageDocument> => {
    const document: MessageDocument = {
        conversationId: input.conversationId,
        senderId: input.senderId,
        body: input.body,
        replyTo: input.replyTo ?? null,
        createdAt: new Date(),
        editedAt: null,
        deletedAt: null
    };

    const result = await messagesCollection().insertOne(document);

    return {
        ...document,
        _id: result.insertedId
    };
};

type ListMessagesInput = {
    conversationId: number;
    limit: number;
    before?: string;
};

const listMessages = async (
    input: ListMessagesInput
): Promise<MessageDocument[]> => {
    const filter: Filter<MessageDocument> = {
        conversationId: input.conversationId
    };

    if (input.before) {
        filter._id = { $lt: new ObjectId(input.before) };
    }

    return messagesCollection()
        .find(filter)
        .sort({ _id: -1 })
        .limit(input.limit)
        .toArray();
};

type FindMessageInput = {
    messageId: ObjectId;
    conversationId: number;
};

const findMessage = async ({
    messageId,
    conversationId
}: FindMessageInput): Promise<MessageDocument | null> => {
    return messagesCollection().findOne({
        _id: messageId,
        conversationId
    });
};

type FindMessagesByIdsInput = {
    messageIds: ObjectId[];
    conversationId: number;
};

const findMessagesByIds = async ({
    messageIds,
    conversationId
}: FindMessagesByIdsInput): Promise<MessageDocument[]> => {
    if (messageIds.length === 0) {
        return [];
    }

    return messagesCollection()
        .find({
            _id: { $in: messageIds },
            conversationId
        })
        .toArray();
};

type UpdateMessageInput = {
    messageId: ObjectId;
    conversationId: number;
    senderId: number;
    body: string;
};

const updateMessage = async ({
    messageId,
    conversationId,
    senderId,
    body
}: UpdateMessageInput): Promise<MessageDocument | null> => {
    return messagesCollection().findOneAndUpdate(
        {
            _id: messageId,
            conversationId,
            senderId,
            deletedAt: null
        },
        {
            $set: {
                body,
                editedAt: new Date()
            }
        },
        {
            returnDocument: "after"
        }
    );
};

type DeleteMessageInput = {
    messageId: ObjectId;
    conversationId: number;
    senderId: number;
};

const deleteMessage = async ({
    messageId,
    conversationId,
    senderId
}: DeleteMessageInput): Promise<MessageDocument | null> => {
    return messagesCollection().findOneAndUpdate(
        {
            _id: messageId,
            conversationId,
            senderId,
            deletedAt: null
        },
        {
            $set: {
                body: "",
                deletedAt: new Date()
            }
        },
        {
            returnDocument: "after"
        }
    );
};

export {
    ensureMessageIndexes,
    insertMessage,
    listMessages,
    findMessage,
    findMessagesByIds,
    updateMessage,
    deleteMessage
};

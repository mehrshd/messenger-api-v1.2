import type { ObjectId } from "mongodb";

type MessageDocument = {
    _id?: ObjectId;
    conversationId: number;
    senderId: number;
    body: string;
    replyTo?: ObjectId | null;
    editedAt?: Date | null;
    deletedAt?: Date | null;
    createdAt: Date;
};

export type {
    MessageDocument
};

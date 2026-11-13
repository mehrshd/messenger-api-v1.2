import type { RowDataPacket } from "mysql2";

type ConversationRow = RowDataPacket & {
    id: number;
};

type UserConversationRow = RowDataPacket & {
    conversation_id: number;
    other_user_id: number;
    fullname: string;
    avatar: string | null;
};

export type {
    ConversationRow,
    UserConversationRow
};

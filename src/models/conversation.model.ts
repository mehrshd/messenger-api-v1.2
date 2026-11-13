type ConversationType = "private";

type Conversation = {
    id: number;
    type: ConversationType;
    pairKey: string;
};

export type {
    ConversationType,
    Conversation
};

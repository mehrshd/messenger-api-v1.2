import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
    createConversation,
    getConversationForUser,
    getUserConversations,
    privatePairKey
} from "../../src/repositories/chat/conversationRep.ts";
import type { RowDataPacket } from "mysql2";
import dataBase from "../../src/db.ts";
import { deleteTestUsers, insertTestUser } from "../helpers/testUsers.ts";

describe("conversation repository", () => {
    let userA: Awaited<ReturnType<typeof insertTestUser>>;
    let userB: Awaited<ReturnType<typeof insertTestUser>>;

    beforeAll(async () => {
        userA = await insertTestUser("conv-a");
        userB = await insertTestUser("conv-b");
    });

    afterAll(async () => {
        await deleteTestUsers([userA.id, userB.id]);
    });

    it("creates a private conversation once under concurrent requests", async () => {
        const [first, second] = await Promise.all([
            createConversation(userA.id, userB.id),
            createConversation(userB.id, userA.id)
        ]);

        expect(first).toBe(second);

        const pairKey = privatePairKey(userA.id, userB.id);
        const [rows] = await dataBase.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS count FROM conversations WHERE pair_key = ?`,
            [pairKey]
        );

        expect(Number(rows[0]?.count)).toBe(1);
    });

    it("verifies membership and lists conversations for a user", async () => {
        const conversationId = await createConversation(userA.id, userB.id);

        const member = await getConversationForUser(conversationId, userA.id);
        const outsider = await getConversationForUser(conversationId, 0);

        expect(member?.id).toBe(conversationId);
        expect(outsider).toBeNull();

        const list = await getUserConversations(userA.id);
        const match = list.find((row) => row.conversation_id === conversationId);

        expect(match?.other_user_id).toBe(userB.id);
        expect(match?.fullname).toBe(`Test conv-b`);
    });
});

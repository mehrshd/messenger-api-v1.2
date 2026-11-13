import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.ts";
import { connectMongo } from "../../src/db/mongodb.ts";
import { ensureMessageIndexes } from "../../src/repositories/chat/messageRep.ts";
import { deleteTestUsers, insertTestUser } from "../helpers/testUsers.ts";

describe("message API", () => {
    let userA: Awaited<ReturnType<typeof insertTestUser>>;
    let userB: Awaited<ReturnType<typeof insertTestUser>>;
    let userC: Awaited<ReturnType<typeof insertTestUser>>;
    let conversationId: number;

    beforeAll(async () => {
        await connectMongo();
        await ensureMessageIndexes();

        userA = await insertTestUser("msg-a");
        userB = await insertTestUser("msg-b");
        userC = await insertTestUser("msg-c");

        const created = await request(app)
            .post("/conversations")
            .set("Cookie", `session_${userA.id}=${userA.sessionKey}`)
            .send({ targetUserId: userB.id });

        conversationId = created.body.data.conversationId;
    });

    afterAll(async () => {
        await deleteTestUsers([userA.id, userB.id, userC.id]);
    });

    it("sends a message and retrieves it for a conversation member", async () => {
        const sent = await request(app)
            .post(`/conversations/${conversationId}/messages`)
            .set("Cookie", `session_${userA.id}=${userA.sessionKey}`)
            .send({ body: "hello from A" });

        expect(sent.status).toBe(200);
        expect(sent.body.data.message.body).toBe("hello from A");
        expect(sent.body.data.message.senderId).toBe(userA.id);
        expect(sent.body.data.message.conversationId).toBe(conversationId);

        const listed = await request(app)
            .get(`/conversations/${conversationId}/messages`)
            .set("Cookie", `session_${userB.id}=${userB.sessionKey}`);

        expect(listed.status).toBe(200);
        expect(listed.body.data.messages[0].body).toBe("hello from A");
    });

    it("paginates message history with a before cursor", async () => {
        for (const body of ["one", "two", "three"]) {
            const response = await request(app)
                .post(`/conversations/${conversationId}/messages`)
                .set("Cookie", `session_${userB.id}=${userB.sessionKey}`)
                .send({ body });

            expect(response.status).toBe(200);
        }

        const page = await request(app)
            .get(`/conversations/${conversationId}/messages`)
            .query({ limit: 2 })
            .set("Cookie", `session_${userA.id}=${userA.sessionKey}`);

        expect(page.status).toBe(200);
        expect(page.body.data.messages).toHaveLength(2);
        expect(page.body.data.nextCursor).toBeTruthy();

        const nextPage = await request(app)
            .get(`/conversations/${conversationId}/messages`)
            .query({
                limit: 2,
                before: page.body.data.nextCursor
            })
            .set("Cookie", `session_${userA.id}=${userA.sessionKey}`);

        expect(nextPage.status).toBe(200);
        expect(nextPage.body.data.messages.length).toBeGreaterThan(0);
        expect(nextPage.body.data.messages[0]._id).not.toBe(
            page.body.data.messages[0]._id
        );
    });

    it("rejects unauthorized access and invalid conversation ids", async () => {
        const outsider = await request(app)
            .get(`/conversations/${conversationId}/messages`)
            .set("Cookie", `session_${userC.id}=${userC.sessionKey}`);

        expect(outsider.status).toBe(404);

        const invalidId = await request(app)
            .get("/conversations/not-a-number/messages")
            .set("Cookie", `session_${userA.id}=${userA.sessionKey}`);

        expect(invalidId.status).toBe(400);

        const unauthenticated = await request(app)
            .post(`/conversations/${conversationId}/messages`)
            .send({ body: "nope" });

        expect(unauthenticated.status).toBe(401);
    });
});

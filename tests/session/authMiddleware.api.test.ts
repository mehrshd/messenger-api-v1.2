import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../src/app.ts";
import { deleteTestUsers, insertTestUser } from "../helpers/testUsers.ts";

describe("authMiddleware session cookies", () => {
    let userA: Awaited<ReturnType<typeof insertTestUser>>;
    let userB: Awaited<ReturnType<typeof insertTestUser>>;

    beforeAll(async () => {
        userA = await insertTestUser("session-a");
        userB = await insertTestUser("session-b");
    });

    afterAll(async () => {
        await deleteTestUsers([userA.id, userB.id]);
    });

    it("authenticates session_{userId} and ignores leftover invalid session cookies", async () => {
        const response = await request(app)
            .get("/profile")
            .set("Cookie", [
                `session_${userA.id}=${userA.sessionKey}`,
                `session_${userB.id}=not-a-valid-token`
            ]);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(userA.id);
    });

    it("does not authenticate when the cookie name user id does not match the token", async () => {
        const response = await request(app)
            .get("/profile")
            .set("Cookie", `session_${userA.id}=${userB.sessionKey}`);

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it("rejects multiple valid sessions for different users", async () => {
        const response = await request(app)
            .get("/profile")
            .set("Cookie", [
                `session_${userA.id}=${userA.sessionKey}`,
                `session_${userB.id}=${userB.sessionKey}`
            ]);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe("Multiple active sessions found");
    });
});

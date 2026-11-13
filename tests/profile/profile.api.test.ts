import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/app.ts";

describe("GET /profile", () => {
    it("should get profile successfully", async() => {
        const agent = request.agent(app);

        await agent
        .post("/login")
        .send({
            identifier: "iviessl1oo@gmail.com.com",
            password: "12ww34ertTTT"
        });

        const response = await agent
        .get("/profile");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});
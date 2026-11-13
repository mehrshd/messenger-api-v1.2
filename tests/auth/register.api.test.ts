import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.ts";
import { getMaxListeners } from "events";

describe("POST /verifyCode/register", () => {
    it("should register successfully", async () => {
        const response = await request(app)
            .post("/register")
            .send({
                fullname:"batman",
                email:"vcode155@gmail.com.com",
                password:"12ww34ert5665"
            });
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    })
})
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.ts";

describe("POST /verifyCode/login", () => {

    it("should login successfully", async () => {

        const response = await request(app)
            .post("/login")
            .send({
                identifier: "iviessl1oo@gmail.com.com",
                password: "12ww34ertTTT"
            });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

    });

});
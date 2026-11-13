// import { it, expect, beforeEach } from "vitest";
// import request from "supertest";
// import bcrypt from "bcrypt";
// import crypto from "node:crypto";

// import app from "../../src/app.ts";
// import pendingVerifications from "../../src/services/verificationService/pendingRegistrations.ts";

// let temporarySessionKey: string;

// beforeEach(async () => {

//     temporarySessionKey = crypto.randomBytes(32).toString("hex");

//     const code = "123456";
//     const codeHash = await bcrypt.hash(code, 12);

//     pendingVerifications.set(temporarySessionKey, {
//         fullname: "batmannn",
//         email: "vcode155@gmail.com",
//         passwordHash: await bcrypt.hash("Aa12345678", 12),
//         codeHash,
//         expiresAt: Date.now() + 5 * 60 * 1000
//     });
// });


// it("should verify register with correct code", async () => {

//     const response = await request(app)
//         .post("/verifyCode/Register")
//         .set(
//             "Cookie",
//             `verification_session=${temporarySessionKey}`
//         )
//         .send({
//             code: "123456"
//         });

//     expect(response.status).toBe(201);
//     expect(response.body.success).toBe(true);
// });
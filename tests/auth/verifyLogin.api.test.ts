import { it, expect, beforeAll } from "vitest";
import request from "supertest";
import crypto from "node:crypto";
import bcrypt from "bcrypt";

import app from "../../src/app.ts";
import dataBase from "../../src/db.ts";
import { SessionKeyHash } from "../../src/utils/sessionKeyHash.ts";

let temporarySessionKey: string;

beforeAll(async () => {

    const userId = 1;

    temporarySessionKey = crypto.randomBytes(32).toString("hex");

    const tokenHash = SessionKeyHash(temporarySessionKey);

    await dataBase.query(
        `
        INSERT INTO sessions
        (user_id, token_hash, expires_at, session_type)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'temporary')
        ON DUPLICATE KEY UPDATE
            token_hash = VALUES(token_hash),
            expires_at = VALUES(expires_at),
            session_type = 'temporary'
        `,
        [userId, tokenHash]
    );

    const code = "123456";

    const codeHash = await bcrypt.hash(code, 12);

    await dataBase.query(
        `
        INSERT INTO verification_codes
        (user_id, code_hash, purpose, expires_at, attempts, created_at)
        VALUES (
            ?,
            ?,
            ?,
            DATE_ADD(NOW(), INTERVAL 5 MINUTE),
            0,
            NOW()
        )
        `,
        [
            userId,
            codeHash,
            "login"
        ]
    );
});


it("should verify login with correct code", async () => {

    const response = await request(app)
        .post("/verifiLogin")
        .set("Cookie", `session_1=${temporarySessionKey}`)
        .send({
            code: "123456"
        });


    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});
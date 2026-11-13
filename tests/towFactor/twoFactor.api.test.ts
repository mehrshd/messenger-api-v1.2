import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import crypto from "node:crypto";

import app from "../../src/app.ts";
import dataBase from "../../src/db.ts";
import { SessionKeyHash } from "../../src/utils/sessionKeyHash.ts";

let sessionKey: string;

beforeAll(async () => {

    sessionKey = crypto.randomBytes(32).toString("hex");

    const tokenHash = SessionKeyHash(sessionKey);

    await dataBase.query(
        `
        INSERT INTO sessions
        (user_id, token_hash, expires_at, session_type)
        VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), 'permanent')
        ON DUPLICATE KEY UPDATE
            token_hash = VALUES(token_hash),
            expires_at = VALUES(expires_at),
            session_type = 'permanent'
        `,
        [1, tokenHash]
    );
});

it("should toggle two factor", async () => {

    const response = await request(app)
        .patch("/two-factor")
        .set("Cookie", `session_1=${sessionKey}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});
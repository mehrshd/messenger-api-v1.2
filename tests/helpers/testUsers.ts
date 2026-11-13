import type { ResultSetHeader } from "mysql2";
import dataBase from "../../src/db.ts";
import { SessionKeyHash } from "../../src/utils/sessionKeyHash.ts";
import crypto from "node:crypto";

type TestUser = {
    id: number;
    email: string;
    sessionKey: string;
};

const insertTestUser = async (label: string): Promise<TestUser> => {
    const email = `msgtest_${label}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}@example.test`;

    const [result] = await dataBase.query<ResultSetHeader>(
        `
        INSERT INTO users (fullname, email, password)
        VALUES (?, ?, ?)
        `,
        [`Test ${label}`, email, "not-a-real-password-hash"]
    );

    const sessionKey = crypto.randomBytes(32).toString("hex");
    const tokenHash = SessionKeyHash(sessionKey);

    await dataBase.query(
        `
        INSERT INTO sessions
            (user_id, token_hash, expires_at, session_type)
        VALUES
            (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), 'permanent')
        `,
        [result.insertId, tokenHash]
    );

    return {
        id: result.insertId,
        email,
        sessionKey
    };
};

const deleteTestUsers = async (ids: number[]): Promise<void> => {
    if (ids.length === 0) {
        return;
    }

    const placeholders = ids.map(() => "?").join(", ");
    await dataBase.query(
        `DELETE FROM users WHERE id IN (${placeholders})`,
        ids
    );
};

export {
    insertTestUser,
    deleteTestUsers
};

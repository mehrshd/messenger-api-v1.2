import type { RowDataPacket } from "mysql2";
import dataBase from "../db.ts";
import crypto from "node:crypto";
import { SessionKeyHash } from "./sessionKeyHash.ts";

type SessionType = "temporary" | "permanent";

const SessionToken = async (userId: number, session_type: SessionType): Promise<string> => {
    const checkSql = `
        SELECT id FROM sessions WHERE user_id = ?
    `;

    const [result] = await dataBase.query<RowDataPacket[]>(
        checkSql,
        [userId]
    );

    const sessionKey = crypto.randomBytes(32).toString("hex");

    const sessionKeyHash = SessionKeyHash(sessionKey);

    const expires_at =
    session_type === "temporary"
        ? new Date(Date.now() + 5 * 60 * 1000)
        : new Date(Date.now() + 60 * 60 * 1000);

    if (result[0]?.id) {
        const sql = `
            UPDATE sessions
            SET
                token_hash = ?,
                expires_at = ?,
                session_type = ?
            WHERE user_id = ?;
        `;

        await dataBase.query(sql, [
            sessionKeyHash,
            expires_at,
            session_type,
            userId
        ]);

        return sessionKey;
    }

    const sql = `
        INSERT INTO sessions (user_id, token_hash, expires_at, session_type)
        VALUES (?, ?, ?, ?);
    `;

    await dataBase.query(sql, [
        userId,
        sessionKeyHash,
        expires_at,
        session_type
    ]);

    return sessionKey;
};

export { SessionToken };
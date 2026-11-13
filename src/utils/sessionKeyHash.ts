import crypto from "node:crypto";
import dataBase from "../db.ts";
import type { RowDataPacket } from "mysql2";
import type { SessionUser } from "./sessionCookies.ts";

declare global {
 namespace Express {
  interface Request {
   user?: {
    id: number;
    sessionType: string;
   };
  }
 }
}

const SessionKeyHash = (sessionKey:string) => {

    const sessionKeyHash = crypto
    .createHash("sha256")
    .update(sessionKey)
    .digest("hex");

    return sessionKeyHash
}

const LookupSessionByHash = async (
    sessionKeyHash: string
): Promise<SessionUser | null> => {

    const sql = `
        SELECT user_id, session_type
        FROM sessions
        WHERE token_hash = ?
        AND expires_at > NOW()
        LIMIT 1
    `;

    const [rows] = await dataBase.query<RowDataPacket[]>(sql, [sessionKeyHash]);

    const row = rows[0];

    if (!row) {
        return null;
    }

    return {
        id: row.user_id,
        sessionType: row.session_type
    };
};

export {
    SessionKeyHash,
    LookupSessionByHash
};

import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import dataBase from "../../db.ts";
import type { ConversationRow, UserConversationRow } from "../../types/chat.types.ts";

const MYSQL_DUPLICATE_ENTRY = 1062;

const privatePairKey = (userId: number, targetUserId: number): string => {
    const first = Math.min(userId, targetUserId);
    const second = Math.max(userId, targetUserId);
    return `${first}:${second}`;
};

const isDuplicateEntry = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) {
        return false;
    }

    return "errno" in error && error.errno === MYSQL_DUPLICATE_ENTRY;
};

const findConversationOnConnection = async (
    connection: PoolConnection,
    userId: number,
    targetUserId: number
): Promise<ConversationRow | null> => {
    const sql = `
        SELECT id
        FROM conversations
        WHERE pair_key = ?
        AND type = 'private'
        LIMIT 1
        FOR UPDATE
    `;

    const [rows] = await connection.query<ConversationRow[]>(sql, [
        privatePairKey(userId, targetUserId)
    ]);

    return rows[0] ?? null;
};

const findConversation = async (
    userId: number,
    targetUserId: number
): Promise<ConversationRow | null> => {
    const sql = `
        SELECT id
        FROM conversations
        WHERE pair_key = ?
        AND type = 'private'
        LIMIT 1
    `;

    const [rows] = await dataBase.query<ConversationRow[]>(sql, [
        privatePairKey(userId, targetUserId)
    ]);

    return rows[0] ?? null;
};

const createConversation = async (
    userId: number,
    targetUserId: number
): Promise<number> => {

    const connection = await dataBase.getConnection();
    const pairKey = privatePairKey(userId, targetUserId);

    try {
        await connection.beginTransaction();

        const existingConversation = await findConversationOnConnection(
            connection,
            userId,
            targetUserId
        );

        if (existingConversation) {
            await connection.commit();
            return existingConversation.id;
        }

        const sql = `
            INSERT INTO conversations (type, pair_key)
            VALUES ('private', ?)
        `;

        const [conversationResult] =
            await connection.query<ResultSetHeader>(sql, [pairKey]);

        const conversationId = conversationResult.insertId;

        await connection.query(
            `INSERT INTO conversation_members (conversation_id, user_id)
             VALUES (?, ?), (?, ?)`,
            [conversationId, userId, conversationId, targetUserId]
        );

        await connection.commit();

        return conversationId;
    } catch (error) {
        await connection.rollback();

        if (isDuplicateEntry(error)) {
            const existing = await findConversation(userId, targetUserId);

            if (existing) {
                return existing.id;
            }
        }

        throw error;
    } finally {
        connection.release();
    }
};

const getConversationForUser = async (
    conversationId:number,
    userId:number
): Promise<ConversationRow | null> => {

    const sql = `
        SELECT c.id
        FROM conversations AS c
        JOIN conversation_members AS cm
            ON cm.conversation_id = c.id
        WHERE c.id = ?
        AND cm.user_id = ?
        LIMIT 1
    `;

    const [rows] = await dataBase.query<ConversationRow[]>(sql, [conversationId, userId]);

    return rows[0] ?? null
}

const getUserConversations = async (
    userId: number
): Promise<UserConversationRow[]> => {

    const sql = `
        SELECT
            c.id AS conversation_id,
            cm2.user_id AS other_user_id,
            u.fullname,
            u.avatar
        FROM
            conversations AS c
        JOIN
            conversation_members AS cm1
            ON cm1.conversation_id = c.id
        JOIN
            conversation_members AS cm2
            ON cm2.conversation_id = c.id
        JOIN
            users AS u
            ON u.id = cm2.user_id
        WHERE
            cm1.user_id = ?
        AND
            cm2.user_id != cm1.user_id
        AND
            c.type = 'private'
        ORDER BY
            c.id DESC
    `;

    const [rows] = await dataBase.query<UserConversationRow[]>(sql, [userId]);

    return rows;
};

export {
    privatePairKey,
    findConversation,
    createConversation,
    getConversationForUser,
    getUserConversations
};

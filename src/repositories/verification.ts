import dataBase from '../db.ts';
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { TypeVerification, VerificationData } from '../types/user.ts';

const CreateVerification = async({
    userId,
    codeHash,
    purpose,
    expires_at,
    target
}: TypeVerification) => {

    const sql = `
      INSERT INTO verification_codes
      (user_id, code_hash, purpose, expires_at, target)
      VALUES (?, ?, ?, ?, ?)
    `;
    let params;

    if(target === undefined){

        params = [
            userId,
            codeHash,
            purpose,
            expires_at
        ]

    }else {

        params = [
        userId,
        codeHash,
        purpose,
        expires_at,
        target
        ]
    }

    const [result] = await dataBase.query<ResultSetHeader>(sql, params);

    return result.insertId
}

const GetVerification = async({
    userId,
    purpose
}: VerificationData) => {

    const sql = `
      SELECT id, user_id, code_hash, purpose, expires_at, attempts, target
      FROM verification_codes
      WHERE user_id = ?
      AND purpose = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await dataBase.query<RowDataPacket[]>(sql, [
      userId,
      purpose
    ]);

    return rows[0] || null;
}

const IncrementVerificationAttempts = async (id:number) => {
    const sql = `
        UPDATE verification_codes
        SET attempts = attempts + 1
        WHERE id = ?
    `;

    await dataBase.query(sql, [id]);
};

const DeleteVerification = async (id:number) => {
    const sql = `
        DELETE FROM verification_codes
        WHERE id = ?
    `;

    await dataBase.query(sql, [id]);
};

export {
    CreateVerification,
    GetVerification,
    IncrementVerificationAttempts,
    DeleteVerification
}
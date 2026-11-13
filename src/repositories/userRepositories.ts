import dataBase from "../db.ts";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { HashPassword } from "../utils/hashPassword.ts";
import type { CreateUser, EmailRow } from "../types/user.ts";

const checkEmail = async (email: string): Promise<boolean> => {
  const checkSql = `
    SELECT email FROM users WHERE email = ?
  `;

  const [rows] = await dataBase.query<EmailRow[]>(
    checkSql,
    [email]
  );

  return rows.length > 0;
};

const createUser = async ({
  email,
  fullname,
  password,
}: CreateUser) => {

  const sql = `
    INSERT INTO users (email, fullname, password)
    VALUES (?, ?, ?)
  `;

  const passwordHash = await HashPassword(password);

  const params = [
    email,
    fullname,
    passwordHash,
  ];

  const [result] = await dataBase.query<ResultSetHeader>(sql, params);

  return result.insertId;
};

export {
  checkEmail,
  createUser,
};
import dataBase from '../../db.ts'
import { ComparePassword } from '../../utils/hashPassword.ts';
import { SessionToken } from '../../utils/sessionToken.ts';
import {GenerateCodeService} from '../verificationService/generateCodeService.ts';
import type { UserRow, LoginResult } from '../../types/user.ts'
import type { RowDataPacket } from 'mysql2';
import type { Request } from 'express';
import { SessionKeyHash } from '../../utils/sessionKeyHash.ts';

const LoginService = async(identifier: string, password: string, req:Request):  Promise<LoginResult> => {

    const sql = `
      SELECT id, email, fullname, password, two_factor_enabled
      FROM users
        WHERE username = ?
        OR email = ?
      LIMIT 1
    `;

    const identifiers = [identifier, identifier];
    const [rows] = await dataBase.query<UserRow[]>(sql, identifiers);

    if(rows.length === 0){
        return {
            success: false,
            message: "The username, email, or phone entered is incorrect."
        }
    }

      const user = rows[0];
      const passUser = user.password;
      const isPasswordCorrect = await ComparePassword(password, passUser);

    if(!isPasswordCorrect){
        return {
            success: false,
            message: "The password entered is incorrect."
        }
    }

    const twoEnabled = user.two_factor_enabled
    const userId = user.id;

    const checkSql = `
      SELECT expires_at, token_hash
      FROM sessions
      WHERE user_id = ?
      AND session_type = ?
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const dataUser = [userId, "permanent"];
    const [result] = await dataBase.query<RowDataPacket[]>(checkSql, dataUser);

    const sessionKey = req.cookies[`session_${userId}`];

    if(sessionKey){

      if(result.length !== 0){

          const now = Date.now();
          const lastRequest = new Date(result[0].expires_at).getTime();

          if (now < lastRequest) {

            const tokenHash = result[0].token_hash

            const currentCookieSessionHash =
              sessionKey
              ? SessionKeyHash(sessionKey)
              : null;

            const message = "Your account is already active in another session.";

            if(tokenHash === currentCookieSessionHash){
              return {
                success: true,
                message,
                isLoggedIn:true
              }
            }

              return {
                success: true,
                message,
                userId,
                isLoggedIn:true,
                sessionKey
              }
          }
      }

    }

    if(twoEnabled === 0){
        const sessionKey = await SessionToken(userId, "permanent");

        if(sessionKey){
          return {
            success: true,
            message: ` Welcome ${user.fullname} `,
            sessionKey,
            userId,
            requiresTwoFactor: false
          }
        }else {
          return {
            success: false,
            message: "Try again"
          }
        }
    }else {

        const temporarySessionKey = await SessionToken(userId, "temporary");

        const dataCode = {
            userId,
            purpose: "login",
        }

        const code = await GenerateCodeService(dataCode);

        if(temporarySessionKey && code.success){
          return {
            success: true,
            message: code.message,
            temporarySessionKey,
            userId,
            requiresTwoFactor: true
          }
        }else {
          return {
            success: false,
            message: code.message
          }
        }
    }

}

export default LoginService
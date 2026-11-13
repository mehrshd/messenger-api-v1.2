import type { RowDataPacket } from "mysql2";
import dataBase from "../../db.ts";
import { GenerateCode } from "../verificationService/generateCodeService.ts";
import type { Request, Response } from "express";
import { ComparePassword, HashPassword } from "../../utils/hashPassword.ts";
import PendingPasswordResets from "../verificationService/PendingPasswordReset.ts";
import { baseCookieOptions } from "../../utils/cookieOptions.ts";


const DataUser = (req:Request) => {
    const sessionKey = req.cookies.password_reset_session;
    const dataUser = PendingPasswordResets.get(sessionKey);

    if (!dataUser) {
        return {
            success: false,
            message: "Verification session not found"
        }
    }

    if (Date.now() > dataUser.expiresAt) {
        PendingPasswordResets.delete(sessionKey);

        return {
            success: false,
            message: "The code has expired."
        };
    }

    return dataUser
}

const forgotPassword_getEmail = async(email:string, res:Response) => {

    const checkSql = `
        SELECT email FROM users WHERE email = ?
    `;

    const [result] = await dataBase.query<RowDataPacket[]>(checkSql, [email]);
    if(!result[0]?.email){
        return {
            success: false,
            message: "No user exists with this email."
        }
    }

    const dataVerifyUser = result[0]?.email;

    const status = await GenerateCode(dataVerifyUser, res);

    return status

}

const forgotPassword_getCode = async(code:string, req:Request) => {

    const dataUser = DataUser(req);
    const sessionKey = req.cookies.password_reset_session;

    if ("success" in dataUser) {
        return dataUser;
    }


    if (dataUser.attempts >= 3) {

        PendingPasswordResets.delete(sessionKey);

        return {
            success: false,
            message: "The code has expired."
        }
    }

    const verifyCode = await ComparePassword(code, dataUser?.codeHash);

    if(!verifyCode){

        dataUser.attempts++

        return {
            success: false,
            message: "The entered code is incorrect."
        }
    }

    dataUser.verified = true;

    return {
        success: true,
        message: "The code executed successfully."
    }

}

const forgotPasswordCntrl_getNewPassword = async (newPassword: string, res:Response, req:Request) => {

    const dataUser = DataUser(req);
    const sessionKey = req.cookies.password_reset_session;

    if ("success" in dataUser) {
        return dataUser;
    }

    const verified = dataUser.verified;

    if(!verified){
        return {
            success: false,
            message: "You are not authorized to change the password; please try again."
        }
    }

    const sql = `
        UPDATE users
        SET password = ?
        WHERE email = ?;
    `;
    const email = dataUser.email;
    const passwordHash = await HashPassword(newPassword);


    await dataBase.query(sql, [passwordHash, email]);

    res.clearCookie("password_reset_session", baseCookieOptions());

    PendingPasswordResets.delete(sessionKey);

    return {
        success: true,
        message: " Password successfully changed. "
    }
}

export {
    forgotPassword_getEmail,
    forgotPassword_getCode,
    forgotPasswordCntrl_getNewPassword
}
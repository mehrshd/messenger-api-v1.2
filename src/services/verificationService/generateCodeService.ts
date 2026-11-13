import crypto from 'crypto';
import dataBase from '../../db.ts';
import { CreateVerification } from '../../repositories/verification.ts'
import SendVerificationEmail from '../../utils/sendVerificationCode.ts'
import { HashPassword } from '../../utils/hashPassword.ts'
import type { RowDataPacket } from "mysql2";
import type { TypeGnCodeSv } from '../../types/user.ts';
import type { Request, Response } from 'express';
import pendingVerifications from './pendingRegistrations.ts';
import PendingPasswordResets from './PendingPasswordReset.ts';
import { baseCookieOptions } from '../../utils/cookieOptions.ts';

const GenerateCodeService = async({
    userId,
    purpose,
    target
}: TypeGnCodeSv) => {

    const checkCreatedAtSql = `
        SELECT created_at
        FROM verification_codes
        WHERE user_id = ?
        AND purpose = ?
        ORDER BY created_at DESC
        LIMIT 1;
    `;

    const [result] = await dataBase.query<RowDataPacket[]>(checkCreatedAtSql, [userId, purpose]);
    if(result[0]?.created_at){

        const now = Date.now();
        const lastRequest = new Date(result[0].created_at).getTime();
        const cooldown = 2 * 60 * 1000;

        if(now - lastRequest < cooldown){
            throw new Error("Please wait 10 minutes before requesting another verification code.");
        }
    }

    const checkSql = `SELECT email FROM users WHERE id = ?`;
    const [row] = await dataBase.query<RowDataPacket[]>(checkSql, [userId]);

    if(row.length === 0){
        return {
            success: false,
            message: "User not found"
        };
    }

    const code = crypto.randomInt(100000, 1000000);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    const codeHash = await HashPassword(String(code));

    await CreateVerification({
        userId,
        codeHash,
        purpose,
        expires_at,
        target
    });

    const email = row[0].email;

    await SendVerificationEmail(email, code);

    return {
        success: true,
        message: "The code was sent successfully."
    }

}

const GenerateCodeRegister = async(dataVerifyUser: any) => {

    const code = crypto.randomInt(100000, 1000000);
    const codeHash = await HashPassword(String(code));
    const passwordHash = await HashPassword(dataVerifyUser.password)

    const sessionKey = crypto.randomBytes(32).toString("hex");

    pendingVerifications.set(sessionKey, {
        fullname: dataVerifyUser.fullname,
        email: dataVerifyUser.email,
        passwordHash,
        codeHash,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
    });

    await SendVerificationEmail(dataVerifyUser?.email, code);

    return {
        success: true,
        message: "The code was sent successfully.",
        sessionKey
    }

}

const GenerateCode = async(dataVerifyUser: string, res:Response) => {

    const code = crypto.randomInt(100000, 1000000);
    const codeHash = await HashPassword(String(code));

    const sessionKey = crypto.randomBytes(32).toString("hex");

    PendingPasswordResets.set(sessionKey, {
        email: dataVerifyUser,
        codeHash,
        verified: false,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
    });

    await SendVerificationEmail(dataVerifyUser, code);

    res.cookie("password_reset_session", sessionKey, {
        ...baseCookieOptions(),
        maxAge: 5 * 60 * 1000
    });

    return {
        success: true,
        message: "The code was sent successfully.",
    }

}

export {
    GenerateCodeService,
    GenerateCodeRegister,
    GenerateCode
}
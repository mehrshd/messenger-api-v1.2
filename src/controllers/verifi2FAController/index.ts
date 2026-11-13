import type { Request, Response } from "express";
import {VerifyCodeRegisterService, VerifyCodeService} from "../../services/verificationService/verifyCodeService.ts";
import dataBase from '../../db.ts';
import type { RowDataPacket } from "mysql2";
import { SessionToken } from "../../utils/sessionToken.ts";
import SetSessionCookie from "../../utils/SessionCookie.ts";
import { createUser } from "../../repositories/userRepositories.ts";
import pendingVerifications from "../../services/verificationService/pendingRegistrations.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";
import { ComparePassword } from "../../utils/hashPassword.ts";


const Verifi2FAController = async(req: Request, res:Response) => {

    const { code } = req.body;
    const userId = req.user?.id;

    if(!userId){
        throw new AppError("user not found!", 401);
    }

    const sql = `SELECT email, fullname FROM users WHERE id = ?`;
    const [result] = await dataBase.query<RowDataPacket[]>(sql, [userId]);

    if(result[0]?.email){

        const CodeReviewResult = await VerifyCodeService({
            userId: Number(userId),
            purpose: "login",
            code
        });

        if(CodeReviewResult.success === false){
            throw new AppError(CodeReviewResult.message, 400);
        }else {

            const sessionKey = await SessionToken(userId, "permanent");

            if(!sessionKey){
                throw new AppError(CodeReviewResult.message, 400);
            }

            SetSessionCookie(res, sessionKey, userId, req);

            return successResponse(res, CodeReviewResult.message);
        }
    }
}

const VerifiRegisterController = async (
    req: Request,
    res: Response
) => {

    const { code } = req.body;

    const verificationSession =
        req.cookies.verification_session;

    const dataUser =
        pendingVerifications.get(verificationSession);


    if (!dataUser) {
        throw new AppError("Verification data not found", 401);
    }

    const result =
        await VerifyCodeRegisterService(
            dataUser,
            verificationSession,
            code
        );

    if (!result.success) {
        throw new AppError(result.message, 429);
    }


    const id = await createUser({
        email: dataUser.email,
        fullname: dataUser.fullname,
        password: dataUser.passwordHash
    });


    const sessionKey =
        await SessionToken(
            id,
            "permanent"
        );


    SetSessionCookie(
        res,
        sessionKey,
        id,
        req
    );


    pendingVerifications.delete(
        verificationSession
    );

    return successResponse(res, `Welcome ${dataUser?.fullname}`);

};

const VerifiFrogetPassword = async (
    req: Request,
    res: Response
) => {

    const { code } = req.body;

    const verificationSession =
        req.cookies.verification_session;

    const dataUser =
        pendingVerifications.get(verificationSession);


    if (!dataUser) {
        throw new AppError("Verification data not found", 401);
    }

    const result =
        await VerifyCodeRegisterService(
            dataUser,
            verificationSession,
            code
        );

    if (!result.success) {
        throw new AppError(result.message, 429);
    }

    dataUser.verified = true;

    return successResponse(res, "Verification successful")
}

const VerifiUpdateEmail = async(
    req: Request,
    res: Response
) => {

    const { code } = req.body;
    const userId = req.user?.id;

    if(!userId){
        throw new AppError("user not found!", 401);
    }

    const sql = `SELECT target FROM verification_codes WHERE user_id = ?`;
    const [result] = await dataBase.query<RowDataPacket[]>(sql, [userId]);

    if(result.length === 0){
        throw new AppError("No record found for the registered user.", 403)
    }

    const CodeReviewResult = await VerifyCodeService({
        userId: Number(userId),
        purpose: "update_email",
        code
    });

    if(!CodeReviewResult.success){
        throw new AppError(CodeReviewResult.message, 401);
    }

    const updateSql = `
        UPDATE users
        SET email = ?
        WHERE id = ?
    `;

    await dataBase.query(updateSql, [result[0].target, userId]);
    return successResponse(res, "Email changed successfully");


}

export {
    Verifi2FAController,
    VerifiRegisterController,
    VerifiFrogetPassword,
    VerifiUpdateEmail
}
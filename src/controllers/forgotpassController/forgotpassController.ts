// import type { Request, Response } from "express";
// import pendingVerifications from "../../services/verificationService/pendingRegistrations.ts";
// import ChangePassword from "../../services/forgotPassword/ChangePassword.ts";

import type { Request, Response } from "express";
import {forgotPassword_getCode, forgotPassword_getEmail, forgotPasswordCntrl_getNewPassword} from "../../services/forgotPassword/forgotPassword.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const forgotPasswordCntrl_sendEmail = async(req:Request, res:Response) => {

    const { email } = req.body;

    const result = await forgotPassword_getEmail(email, res);

    if(!result.success){
        throw new AppError(result.message, 401);
    }

    return successResponse(res, result.message)
}

const forgotPasswordCntrl_sendCode = async(req:Request, res:Response) => {

    const { code } = req.body;
    const result = await forgotPassword_getCode(code, req);

    if(!result.success){
        throw new AppError(result.message, 429);
    }

    return successResponse(res, result.message)

}

const forgotPassword_sendNewPassword = async(req: Request, res: Response) => {

    const { newPassword } = req.body;
    const result = await forgotPasswordCntrl_getNewPassword(newPassword, res, req);

    if(!result.success){
        throw new AppError(result.message, 401);
    }

    return successResponse(res, result.message)

}

export {
    forgotPasswordCntrl_sendEmail,
    forgotPasswordCntrl_sendCode,
    forgotPassword_sendNewPassword
}
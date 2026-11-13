import type {
    Request,
    Response
} from "express";

import RegisterService from
    "../../services/authService/registerService.ts";

import SetVerificationCookie from
    "../../utils/SetVerificationCookie.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";


const RegisterController = async (
    req: Request,
    res: Response
) => {

    const {
        fullname,
        email,
        password
    } = req.body;

    const result = await RegisterService(
        fullname,
        email,
        password
    );

    if (!result.success) {
        throw new AppError(result.message, 400)
    }

    SetVerificationCookie(
        res,
        result.sessionKey
    );

    return successResponse(res, "The verification code was sent successfully.")
};


export default RegisterController;
import type { Request, Response } from "express";
import updateEmailService from "../../services/updateEmailService/updateEmailService.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const updateEmailController = async(req: Request, res:Response) => {

    const { target } = req.body;

    if(!req.user){
        return {
            success: false,
            message: "user not found!"
        }
    }

    const { id, sessionType } = req.user;

    if(sessionType === "temporary"){
        throw new AppError("Full authentication required", 403);
    }

    const result = await updateEmailService(target, id);

    if (!result.success) {
        throw new AppError("Full authentication required", 401);
    }

    return successResponse(res, result.message);
}

export {
    updateEmailController
}
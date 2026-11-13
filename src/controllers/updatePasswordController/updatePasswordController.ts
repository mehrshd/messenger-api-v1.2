import type { Request, Response } from "express";
import AppError from "../../errors/AppError.ts";
import updatePasswordService from "../../services/updatePasswordService/updatePasswordService.ts";
import successResponse from "../../utils/successResponse.ts";

const updatePasswordController = async(req:Request, res:Response) => {

    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }

    const { id } = req.user;
    const result = await updatePasswordService(currentPassword, newPassword, id);

    if(!result.success){
        throw new AppError(result.message, 400);
    }

    return successResponse(res, result.message);
}

export default updatePasswordController
import type { Request, Response } from "express";
import updateProfileServices from "../../services/updateProfileServices/updateProfileServices.ts";
import type { updates } from "../../types/user.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const updateProfileController = async(req:Request, res:Response) => {

      const { fullname, username, bio } = req.body;
      const userId = req.user?.id;
      if(!userId){
        return {
            success: false,
            message:"user not found!"
        }
      }

      const updates = {
         fullname,
         username,
         bio,
         avatar: req.file ? `/uploads/${req.file.filename}` : undefined
      }

      const allowedFields:(keyof updates)[] = [
        "fullname",
        "username",
        "bio",
        "avatar"
      ];

      const result = await updateProfileServices(userId, updates, allowedFields);

      if(!result.success){
        throw new AppError(result.message, 400);
      }

      return successResponse(res, result.message);
}

export default updateProfileController
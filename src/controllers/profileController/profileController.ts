import type { Request, Response } from "express";
import dataBase from '../../db.ts'
import type { RowDataPacket } from "mysql2";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const ProfileController = async(req: Request, res: Response) => {

    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }

    const { id, sessionType } = req.user;
    const sql = `
        SELECT
            id,
            username,
            email,
            fullname,
            bio,
            avatar,
            email_verified,
            two_factor_enabled
        FROM users
        WHERE id = ?
    `;

    if(sessionType === "temporary"){

        throw new AppError("Full authentication required", 403);

    }else if(sessionType === "permanent"){

        const [result] = await dataBase.query<RowDataPacket[]>(sql, [id]);

        if(result.length === 0){
            throw new AppError("user not found!", 404);
        }

        return successResponse(res, `Welcome ${result[0].fullname}`, result[0])

    }
}

export default ProfileController
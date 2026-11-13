import type { Request, Response } from "express";
import dataBase from "../../db.ts";
import type { RowDataPacket } from "mysql2";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const TwoFactorController = async (req: Request, res: Response) => {

    if (!req.user) {
        throw new AppError("Unauthorized", 401);
    }

    const { id, sessionType } = req.user;

    if (sessionType !== "permanent") {
        throw new AppError("Full authentication required", 403);
    }

    const updateSql = `
        UPDATE users
        SET two_factor_enabled = NOT two_factor_enabled
        WHERE id = ?
    `;

    await dataBase.query(updateSql, [id]);

    const selectSql = `
        SELECT two_factor_enabled
        FROM users
        WHERE id = ?
    `;

    const [rows] = await dataBase.query<RowDataPacket[]>(
        selectSql,
        [id]
    );

    const isEnabled = rows[0].two_factor_enabled === 1;
    const message = isEnabled
            ? "Two-step verification has been enabled."
            : "Two-step verification has been disabled.";

    return successResponse(res, message)
};

export default TwoFactorController
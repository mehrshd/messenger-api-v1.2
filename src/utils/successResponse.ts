import type { Response } from "express";

const successResponse = (
    res: Response,
    message: string,
    data?: unknown,
    isLoggedIn?: boolean,
    statusCode: 200 | 201 = 200
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        ...(isLoggedIn !== undefined && { isLoggedIn }),
        ...(data !== undefined && { data })
    });
};

export default successResponse;
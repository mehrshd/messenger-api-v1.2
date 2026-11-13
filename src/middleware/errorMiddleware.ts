import type { NextFunction, Request, Response } from "express";
import AppError from "../errors/AppError.ts";

const errorMiddleware = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {

    console.error("ERROR:", err);

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });

}

export default errorMiddleware
import type { NextFunction, Request, Response } from "express";
import { LookupSessionByHash } from "../utils/sessionKeyHash.ts";
import { resolveSessionFromCookies } from "../utils/sessionCookies.ts";

const authMiddleware = async(req:Request, res:Response, next:NextFunction) => {

    const result = await resolveSessionFromCookies(
        req.cookies,
        LookupSessionByHash
    );

    if (!result.ok) {
        return res.status(result.status).json({
            success: false,
            message: result.message
        });
    }

    req.user = result.user;
    next();
}

export default authMiddleware

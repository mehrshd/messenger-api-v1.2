import type { Request, Response } from "express";
import { baseCookieOptions } from "./cookieOptions.ts";

const sessionCookieName = (userId: number) => `session_${userId}`;

const SetSessionCookie = (
    res: Response,
    sessionKey: string,
    userId: number,
    req?: Request
) => {
    const options = {
        ...baseCookieOptions(),
        maxAge: 60 * 60 * 1000
    };

    res.cookie(sessionCookieName(userId), sessionKey, options);

    if (!req?.cookies) {
        return;
    }

    for (const key of Object.keys(req.cookies)) {
        if (key.startsWith("session_") && key !== sessionCookieName(userId)) {
            res.clearCookie(key, baseCookieOptions());
        }
    }
}

export default SetSessionCookie

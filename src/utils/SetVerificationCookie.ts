import type { Response } from "express";
import { baseCookieOptions } from "./cookieOptions.ts";

const SetVerificationCookie = (
    res: Response,
    sessionKey: string
) => {

    res.cookie("verification_session", sessionKey, {
        ...baseCookieOptions(),
        maxAge: 10 * 60 * 1000
    });
};

export default SetVerificationCookie;

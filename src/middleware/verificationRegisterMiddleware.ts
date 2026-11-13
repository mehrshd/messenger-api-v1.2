import type {
    Request,
    Response,
    NextFunction
} from "express";

import pendingVerifications from
    "../services/verificationService/pendingRegistrations.ts";


const VerificationRegisterMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const sessionKey =
        req.cookies.verification_session;


    if (!sessionKey) {

        return res.status(400).json({
            success: false,
            message: "Verification session not found"
        });

    }


    const data =
        pendingVerifications.get(sessionKey);


    if (!data) {

        return res.status(400).json({
            success: false,
            message: "Verification session expired"
        });

    }


    if (Date.now() > data.expiresAt) {

        pendingVerifications.delete(sessionKey);

        return res.status(400).json({
            success: false,
            message: "Verification session expired"
        });

    }


    req.verifyCode = data;

    next();
};


export default VerificationRegisterMiddleware;
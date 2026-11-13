import type { pendingVerifications } from
    "../services/verificationService/pendingRegistrations.ts";


declare global {

    namespace Express {

        interface Request {

            verifyCode?: pendingVerifications;

        }

    }

}


export {};
import { DeleteVerification, GetVerification, IncrementVerificationAttempts } from "../../repositories/verification.ts";
import type { TypeGnCodeSv2 } from "../../types/user.ts";
import { ComparePassword } from "../../utils/hashPassword.ts";
import pendingVerifications from "./pendingRegistrations.ts";

const VerifyCodeService = async ({
    userId,
    purpose,
    code
}: TypeGnCodeSv2) => {

    const verification = await GetVerification({
        userId,
        purpose,
    });

    if(!verification){
        return {
            success: false,
            message: "Verification code not found"
        };
    }

    const now = new Date();

    if(now > verification.expires_at){
        return {
            success: false,
            message: "Verification code has expired"
        };
    }

    if(verification.attempts >= 3){
        return {
            success: false,
            message: "Too many attempts"
        };
    }

    const isValid = await ComparePassword(
        String(code),
        verification.code_hash
    );

    if(!isValid){
        await IncrementVerificationAttempts(verification.id);

        return {
            success: false,
            message: "Invalid verification code"
        };
    }

    await DeleteVerification(verification.id);

    return {
        success: true,
        message: "Verification successful"
    };
}

const VerifyCodeRegisterService = async(dataUser:any, verificationSession:string, code:string) => {

    if (!dataUser) {
        return {
            success: false,
            message: "Verification data not found"
        };
    }

    if(dataUser.attempts >= 3){
        pendingVerifications.delete(verificationSession);

        return {
            success: false,
            message: "Guessing the code caused your code's validity to expire; please try again."
        };
    }
    const isValid = await ComparePassword(
        code,
        dataUser.codeHash
    );

    if(!isValid){

        dataUser.attempts++;

        return {
            success: false,
            message: "Invalid verification code"
        };
    }

    return {
        success: true,
        message: "Verification successful"
    };
}

export {VerifyCodeService, VerifyCodeRegisterService}
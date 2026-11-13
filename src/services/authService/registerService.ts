import { ErrorValidations } from "../../errors/index.ts";
import { checkEmail } from "../../repositories/userRepositories.ts";
import type { RegisterResult } from "../../types/user.ts";
import { GenerateCodeRegister } from "../verificationService/generateCodeService.ts";


const RegisterService = async (
    fullname: string,
    email: string,
    password: string
): Promise<RegisterResult> => {

    const errorValid = ErrorValidations(
        {
            fullname,
            email,
            password
        },
        [
            "fullname",
            "email",
            "password"
        ]
    );

    if (errorValid.length > 0) {
        return {
            success: false,
            message: errorValid[0].message
        };
    }


    const checkEmailAddress = await checkEmail(email);

    if (checkEmailAddress) {
        return {
            success: false,
            message: "⚠ An account already exists with this email"
        };
    }

    const dataVerifyUser = {
        fullname,
        email,
        password
    }

    const result = await GenerateCodeRegister(dataVerifyUser);

    return result;
};


export default RegisterService;
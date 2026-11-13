import type { RowDataPacket } from "mysql2";
import dataBase from "../../db.ts";
import { DuplicateErrors, ErrorValidations } from "../../errors/index.ts";
import { GenerateCodeService } from "../verificationService/generateCodeService.ts";

const updateEmailService = async(target:string, userId:number) => {

    const checkSQL = `SELECT email FROM users WHERE id = ?`;

    const errorValid = ErrorValidations(
        {
            email: target
        },
        [
            "email"
        ]
    );

    const [rows]:any = await dataBase.query<RowDataPacket[]>(checkSQL, [userId]);

    if(rows.length !== 0){
        const errorDuplicate = DuplicateErrors({email: target}, ["email"], rows);

        if(errorDuplicate.length > 0){
            return {
                success: false,
                message: errorDuplicate[0].message
            };
        }
    }


    if (errorValid.length > 0) {
        return {
            success: false,
            message: errorValid[0].message
        };
    }

    const purpose = "update_email"

        const result = await GenerateCodeService(
            {userId, purpose, target}
        );

    return result
}

export default updateEmailService
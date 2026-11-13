import type { RowDataPacket } from "mysql2";
import dataBase from "../../db.ts";
import { ComparePassword, HashPassword } from "../../utils/hashPassword.ts";
import { ErrorValidations } from "../../errors/index.ts";

const updatePasswordService = async(
    currentPassword:string,
    newPassword:string,
    userId:number
) => {

    const checkSQL = `SELECT password FROM users WHERE id = ?`
    const [row] = await dataBase.query<RowDataPacket[]>(checkSQL, [userId]);

    if(row.length === 0 ){
        return {
            success: false,
            message: "user not found!"
        }
    }

    const hashPassword = row[0].password;
    const statusPassword = await ComparePassword(currentPassword, hashPassword);

    if(!statusPassword){
        return {
            success: false,
            message: "The previous password is incorrect."
        }
    }

    const errorValid = ErrorValidations(
        {
            password: newPassword
        },
        [
            "password"
        ]
    );

    if (errorValid.length > 0) {
        return {
            success: false,
            message: errorValid[0].message
        };
    }

    const hashNewPassword = await HashPassword(newPassword);

    const sql = `UPDATE users SET password = ? WHERE id = ?;`;

    await dataBase.query(sql, [hashNewPassword, userId]);

    return {
        success: true,
        message:"Password successfully changed."
    }

}

export default updatePasswordService
import type { RowDataPacket } from "mysql2";
import dataBase from "../../db.ts";
import type { updates } from "../../types/user.ts";
import CheckUndefined from "../../utils/checkUndefined.ts";


const updateProfileServices = async(
    userId:number,
    updates:updates,
    allowedFields:(keyof updates)[],
) => {

    const result = CheckUndefined(updates, allowedFields);
    const fields = Object.keys(result);
    const values = Object.values(result);

    if(fields.length === 0){
        return {
            success: false,
            message: "No fields to update"
        };
    }

    if(result.username !== undefined){

        const checkSql = `
            SELECT id
            FROM users
            WHERE username = ?
            AND id != ?
        `;

        const [checkResult] = await dataBase.query<RowDataPacket[]>(
            checkSql,
            [result.username, userId]
        );

        if (checkResult.length > 0) {
            return {
                success: false,
                message: "Username is already taken."
            };
        }
    }

    const setQuery = fields.map(fielde => `${fielde} = ?`).join(", ");
    const sql = `
        UPDATE users
        SET ${setQuery}
        WHERE id = ?
    `;

    await dataBase.query(sql, [...values, userId]);

    return {
        success: true,
        message: "Profile updated successfully."
    };

}

export default updateProfileServices
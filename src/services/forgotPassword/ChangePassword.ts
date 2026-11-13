// import type { RowDataPacket } from "mysql2";
// import dataBase from "../../db.ts";

// const ChangePassword = async(dataUser: any, newpassword: string) => {

//     if (!dataUser.verified) {
//         return {
//             success: false,
//             message: "Please verify your code first"
//         };
//     }

//     const checkSQL = `
//         UPDATE users
//         SET password = ?
//         WHERE email = ?;
//     `;

//     const newPass = newpassword;
//     const result = await dataBase.query(checkSQL, [newPass, dataUser.email]);

//     if(!result){
//         return {
//             success: false,
//             message: " user not found. "
//         }
//     }

//     return {
//         success: true,
//         message: " The password change was successful. "
//     }


// }

// export default ChangePassword
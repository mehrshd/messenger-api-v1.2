import type { Request, Response } from "express";
import dataBase from "../../db.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const deleteAccountController = async(req:Request, res:Response) => {

  const userId = req.user?.id;
  if(!userId){
    throw new AppError("user not found!", 401);
  }

  const sql = `DELETE FROM users WHERE id = ?`;
  await dataBase.query(sql, [userId]);

  return successResponse(res, 'Account deletion was successful.', 200);

}

export default deleteAccountController
import type { Request, Response } from "express";
import LoginService from "../../services/authService/loginService.ts";
import SetSessionCookie from "../../utils/SessionCookie.ts";
import AppError from "../../errors/AppError.ts";
import successResponse from "../../utils/successResponse.ts";

const LoginController = async(req: Request, res: Response) => {

  const { identifier, password } = req.body;
  let isLoggedIn: boolean | undefined;
  const result = await LoginService(identifier, password, req);

  if(result.success === false){
    throw new AppError(result.message, 401)
  }

  if ("isLoggedIn" in result && result.isLoggedIn) {

    if(
      result.sessionKey &&
      "userId" in result &&
      typeof result.userId === "number"
    ){
      SetSessionCookie(res, result.sessionKey, result.userId, req);
    }
    isLoggedIn = result.isLoggedIn;

  }

    else if (
        "requiresTwoFactor" in result &&
        result.requiresTwoFactor === false
    ) {
        SetSessionCookie(res, result.sessionKey, result.userId, req);
    } else if ("temporarySessionKey" in result) {
        SetSessionCookie(res, result.temporarySessionKey, result.userId, req);
    }

  return successResponse(res, result.message, undefined, isLoggedIn)
}

export default LoginController
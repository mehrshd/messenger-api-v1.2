import type { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: number;
  fullname: string;
  password: string;
}

interface UserNameRow extends RowDataPacket {
  fullname: string;
}

type updates = {
    fullname?: string;
    username?: string;
    bio?: string;
    avatar?: string;
}

type LoginResult =
| {
    success: true;
    message: string;
    sessionKey: string;
    userId: number;
    requiresTwoFactor: false;
}
| {
    success: true;
    message: string;
    temporarySessionKey: string;
    userId: number;
    requiresTwoFactor: true;
}
| {
    success: true;
    message: string;
    isLoggedIn:boolean;
    sessionKey?:string;
    userId?: number;
}
| {
    success: false;
    message: string;
};

interface RegisterSvc {
  fullname: string;
  email: string;
  password: string;
  ip: string;
}

type RegisterResult =
| {
    success: true;
    sessionKey: string;
}
| {
    success: false;
    message: string;
};

interface TypeGnCodeSv {
    userId: number;
    purpose: string;
    target?: string;
}

interface TypeGnCodeSvRegister extends TypeGnCodeSv {
    email: string;
}

interface TypeGnCodeSv2 extends TypeGnCodeSv {
    code: number;
}

interface EmailRow extends RowDataPacket {
  email: string;
}

interface CreateUser {
  email: string;
  fullname: string;
  password: string;
}

interface TypeVerification extends TypeGnCodeSv {
    codeHash: string;
    expires_at: Date;
    target?: string;
}

type VerificationData = Pick<
  TypeVerification,
  "userId" | "purpose"
>;


export type {
    UserRow,
    UserNameRow,
    LoginResult,
    RegisterSvc,
    RegisterResult,
    TypeGnCodeSv,
    TypeGnCodeSvRegister,
    TypeGnCodeSv2,
    EmailRow,
    CreateUser,
    TypeVerification,
    VerificationData,
    updates
}
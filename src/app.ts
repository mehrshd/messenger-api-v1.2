import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import register from './routes/auth/register.ts'
import login from './routes/auth/login.ts'
import verifyCode from './routes/verifi2FA/index.ts'
import profile from './routes/profile/profile.ts'
import twoFactor from './routes/twoFactor/twoFactor.ts'
import updatePassword from './routes/updatePassword/updatePassword.ts'

import forgotPasswordCntrl_sendEmail from './routes/forgotpass/forgotpass.ts'
import forgotPasswordCntrl_sendCode from './routes/forgotpass/forgotpass.ts'
import forgotPassword_sendNewPassword from './routes/forgotpass/forgotpass.ts'
import errorMiddleware from './middleware/errorMiddleware.ts';
import updateEmail from './routes/updateEmail/updateEmail.ts'
import updateProfile from './routes/updateProfile/updateProfile.ts'
import deleteAccount from './routes/deleteAccount/deleteAccount.ts'
import chat from './routes/chat/chat.routes.ts'
// import users from './routes/users.ts'

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(register);
app.use(login);
app.use('/verifyCode', verifyCode);
app.use(profile);
app.use(twoFactor);

app.use("/forgotPassword", forgotPasswordCntrl_sendEmail);
app.use("/forgotPassword", forgotPasswordCntrl_sendCode);
app.use("/forgotPassword", forgotPassword_sendNewPassword);

app.use(updatePassword);
app.use(updateEmail);
app.use(updateProfile);

app.use(deleteAccount);
app.use(chat);

app.use("/uploads", express.static('uploads'));
app.use(errorMiddleware);

// app.use(users);

app.use((req, res) => {
  res.status(404).send("Sorry, can't find that!")
});

export default app
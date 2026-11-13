import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

const SendVerificationEmail = async(email:string, code:number) => {
    await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: email,
        subject: "Verification Code",
        text: `Your verification code is ${code}`
    });
}

export default SendVerificationEmail
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const sendEmail = async({to , subject ,html})=>{
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      const mailOptions = {
        from: `"Job Search Application"<${process.env.EMAIL}>`,
        to,
        subject,
        html,
      };
      return await transporter.sendMail(mailOptions);
}

export const subject = {
    RESET_PASSWORD:"Reset Password",
    VERIFY_EMAIL:"Verify Email",
    UPDATE_EMAIL:"Update Email"
}
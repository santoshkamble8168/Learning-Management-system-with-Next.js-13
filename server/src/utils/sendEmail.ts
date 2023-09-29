require("dotenv").config();
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";

interface IEmailOptions {
    email: string;
    subject: string;
    html: string;
}

const sendEmail = async (options: IEmailOptions): Promise<void> => {
    // Create a transporter
    const transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    });

    const { email, subject, html } = options;

    // Define mail options
    const mailOptions: SendMailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html: html
    };

    try {
        // Send the email
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${email}`);
    } catch (error) {
        console.error(`Email sending failed to: ${email}`, error);
        throw error; // Rethrow the error for handling in the calling function
    }
}

export default sendEmail;

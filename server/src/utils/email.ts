import ejs from "ejs"
import path from "path"
import sendEmail from "./sendEmail";


export const sendActivationEmail = async (email: string, data: any) => {
  try {
    const html: string = await ejs.renderFile(
      path.join(__dirname, "../mails/user-activation.ejs"),
      data
    );

    await sendEmail({
      email,
      subject: "Activate your account",
      html,
    });
  } catch (error) {
    console.error("Failed to send activation email:", error);
  }
};

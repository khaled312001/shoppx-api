import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject:string, html: string    ) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_EMAIL_HOST, // Your SMTP server hostname
    port: Number(process.env.SMTP_PORT) || 587, // Port for secure SMTP (TLS)
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SENDER_EMAIL, // Your email address
      pass: process.env.SENDER_EMAIL_PASSWORD, // Your email password or app-specific password
    },
  });

  let info = await transporter.sendMail({
    from: process.env.SENDER_EMAIL, // Sender address
    to,
    subject,
    html
  });
};

import "server-only";

import nodemailer from "nodemailer";

// Transporter is created lazily so missing env vars don't crash the build
let _mailer: ReturnType<typeof nodemailer.createTransport> | undefined;

export function getMailer() {
  if (!_mailer) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
    }
    _mailer = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _mailer;
}

export function getFrom() {
  return `"iClose Academy" <${process.env.GMAIL_USER ?? "noreply"}>`;
}

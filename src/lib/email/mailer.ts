import "server-only";

import nodemailer from "nodemailer";

// Transporter is created lazily so missing env vars don't crash the build.
// Prefers Brevo (shared with iclose.ae) and falls back to Gmail SMTP if Brevo
// creds aren't provided — keeps local dev working when only the Gmail vars
// from .env.local.example are set.
let _mailer: ReturnType<typeof nodemailer.createTransport> | undefined;

export function getMailer() {
  if (_mailer) return _mailer;

  const brevoUser = process.env.BREVO_SMTP_USER;
  const brevoKey  = process.env.BREVO_SMTP_KEY;
  if (brevoUser && brevoKey) {
    _mailer = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // STARTTLS
      auth: { user: brevoUser, pass: brevoKey },
    });
    return _mailer;
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    _mailer = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    return _mailer;
  }

  throw new Error(
    "Email is not configured. Set BREVO_SMTP_USER + BREVO_SMTP_KEY (preferred) or GMAIL_USER + GMAIL_APP_PASSWORD.",
  );
}

export function getFrom() {
  // BREVO_FROM_EMAIL is expected in nodemailer's display-name format, e.g.
  //   iClose Academy <noreply@iclose.ae>
  // The address MUST be a sender Brevo accepts: a verified single-sender or an
  // address on a domain authenticated in Brevo. Brevo rejects free-domain
  // senders (gmail.com, etc.), so the fallback uses the authenticated
  // iclose.ae domain — never the legacy Gmail account — to avoid silently
  // configuring a sender Brevo will refuse.
  return process.env.BREVO_FROM_EMAIL ?? '"iClose Academy" <noreply@iclose.ae>';
}

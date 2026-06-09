// Standalone Brevo SMTP test — verifies the exact transport the app uses to
// send sign-in codes, without going through the OTP / Supabase flow.
//
// Usage (Node 20.6+ loads .env.local for us):
//   node --env-file=.env.local scripts/test-brevo-email.mjs you@example.com
//
// It will:
//   1. Confirm BREVO_SMTP_USER / BREVO_SMTP_KEY / BREVO_FROM_EMAIL are present
//   2. Authenticate against smtp-relay.brevo.com (transporter.verify)
//   3. Send a real test email and print Brevo's message id
//
// Any failure prints the exact Brevo response (bad auth, unverified sender,
// etc.) so you know precisely what to fix before touching the Vercel env.

import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node --env-file=.env.local scripts/test-brevo-email.mjs <recipient@email>");
  process.exit(1);
}

const user = process.env.BREVO_SMTP_USER;
const pass = process.env.BREVO_SMTP_KEY;
const from = process.env.BREVO_FROM_EMAIL;

const missing = [
  !user && "BREVO_SMTP_USER",
  !pass && "BREVO_SMTP_KEY",
  !from && "BREVO_FROM_EMAIL",
].filter(Boolean);

if (missing.length) {
  console.error(`Missing env var(s): ${missing.join(", ")}`);
  console.error("Add them to .env.local (Brevo dashboard -> SMTP & API -> SMTP tab).");
  process.exit(1);
}

console.log(`From:      ${from}`);
console.log(`SMTP user: ${user}`);
console.log(`To:        ${to}\n`);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS
  auth: { user, pass },
});

try {
  console.log("Verifying SMTP auth against smtp-relay.brevo.com ...");
  await transporter.verify();
  console.log("✓ Auth OK\n");

  console.log("Sending test email ...");
  const info = await transporter.sendMail({
    from,
    to,
    subject: "Brevo test — iClose Academy",
    text: "If you can read this, sign-in codes are sending through Brevo.",
    html: "<p>If you can read this, sign-in codes are sending through <b>Brevo</b>.</p>",
  });

  console.log(`✓ Sent. messageId: ${info.messageId}`);
  console.log(`  response: ${info.response}`);
  console.log("\nCheck the inbox, and Brevo dashboard -> Logs to confirm.");
} catch (err) {
  console.error("\n✗ Failed:");
  console.error(err);
  console.error(
    "\nCommon causes:\n" +
      "  - 'authentication failed'  -> wrong BREVO_SMTP_USER/KEY (use the SMTP tab, not API key)\n" +
      "  - 'Sender ... not valid'   -> BREVO_FROM_EMAIL is not a verified sender in Brevo\n" +
      "                                (verify an @iclose.ae sender; gmail.com is rejected)",
  );
  process.exit(1);
}

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, ".env.local"), override: true });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Recipient is hardcoded at the server level; sender credentials come from env vars.
const RECIPIENT_EMAIL = "abraham.gobi@gmail.com";

// Allow requests from typical Vite dev/preview ports
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:4174",
  "http://localhost:4175",
  "http://localhost:4176",
  "http://localhost:4177",
  "http://localhost:4178",
  "http://localhost:4179",
  "http://localhost:4180",
];

app.use(express.json({ limit: "50kb" }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin requests (no Origin header) or whitelisted origins
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ["POST", "OPTIONS"],
  })
);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    recipient: RECIPIENT_EMAIL,
    emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
  });
});

/**
 * POST /api/feedback
 * Body: { name: string, email: string, message: string }
 * Sends an email via Nodemailer using env-var credentials.
 */
app.post("/api/feedback", async (req, res) => {
  const { name, email, message } = req.body ?? {};

  // --- Input validation ---
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }
  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ error: "Email is required." });
  }
  // Basic email format check (server-side)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: "Invalid email address." });
  }
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Feedback message is required." });
  }

  const safeName = name.trim().slice(0, 120);
  const safeEmail = email.trim().slice(0, 254);
  const safeMessage = message.trim().slice(0, 5000);

  // --- Nodemailer transporter ---
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️  EMAIL_USER / EMAIL_PASS not set in .env — email not sent.");
    return res.status(202).json({
      success: true,
      delivery: "not-configured",
      message: "Feedback received, but email delivery is not configured on the server.",
      note: "Add EMAIL_USER and EMAIL_PASS to src/server/.env to enable email delivery.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SuperStore Dashboard" <${process.env.EMAIL_USER}>`,
    to: RECIPIENT_EMAIL,
    replyTo: safeEmail,
    subject: `[Dashboard Feedback] from ${safeName}`,
    text: `Name:    ${safeName}\nEmail:   ${safeEmail}\n\n--- Feedback ---\n${safeMessage}`,
    html: `
      <h2 style="font-family:sans-serif;color:#1e3a5f;">SuperStore Dashboard — Feedback</h2>
      <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse;">
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#555;">Name</td><td>${safeName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:600;color:#555;">Email</td><td><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
      </table>
      <hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0;"/>
      <p style="font-family:sans-serif;font-size:14px;color:#444;white-space:pre-wrap;">${safeMessage}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅  Feedback email sent from ${safeEmail}`);
    return res.json({ success: true, delivery: "sent", message: "Feedback sent successfully." });
  } catch (err) {
    console.error("❌  Email send error:", err.message);
    const isAuthError = ["EAUTH", "535"].includes(err.code) || /auth/i.test(err.message);
    return res.status(500).json({
      error: isAuthError
        ? "Email login failed. Use a valid Gmail address in EMAIL_USER and a Gmail App Password in EMAIL_PASS."
        : "Failed to send email. Check EMAIL_USER / EMAIL_PASS in src/server/.env and use a Gmail App Password.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀  Feedback server running at http://localhost:${PORT}`);
  console.log(`    Recipient: ${RECIPIENT_EMAIL}`);
  console.log(`    Email credentials ${process.env.EMAIL_USER ? "✓ configured" : "✗ NOT configured (set EMAIL_USER + EMAIL_PASS in .env)"}`);
});

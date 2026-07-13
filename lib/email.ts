import nodemailer from "nodemailer";

export async function sendNoticeEmail(to: string, title: string, content: string) {
  // If SMTP is not fully configured, fallback to console logging for now
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("Mock Email Sent!");
    console.log(`To: ${to}`);
    console.log(`Title: ${title}`);
    console.log(`Content: ${content}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #333;">${title}</h2>
      <p style="color: #555; white-space: pre-wrap;">${content}</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">
        This is an automated notice from Corpulate. Please log in to your dashboard to view more details.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Corpulate Notices" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `New Notice: ${title}`,
    html: htmlContent,
  });
}

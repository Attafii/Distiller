const RESEND_API_URL = "https://api.resend.com/emails";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = from ?? process.env.EMAIL_FROM ?? "Distiller <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[Email] RESEND_API_KEY not set in production — email not sent");
      return { id: `skipped-${Date.now()}`, provider: "skipped" };
    }
    console.log("📧 EMAIL TO:", to);
    console.log("📧 SUBJECT:", subject);
    console.log("📧 BODY:", html.slice(0, 200));
    return { id: `console-${Date.now()}`, provider: "console" };
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ from: fromAddress, to, subject, html })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Email] Resend API error:", response.status, errorBody);
      throw new Error(`Resend API error: ${response.status}`);
    }

    const data = (await response.json()) as { id: string };
    return { id: data.id, provider: "resend" };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    throw error;
  }
}

export function buildPasswordResetEmail(url: string) {
  return {
    subject: "Reset your Distiller password",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #fafafa; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">Click the button below to reset your Distiller password. This link expires in 1 hour.</p>
        <a href="${url}" style="display: inline-block; background: #fafafa; color: #09090b; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Reset Password</a>
        <p style="color: #71717a; margin-top: 24px; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  };
}

export function buildVerificationEmail(url: string) {
  return {
    subject: "Verify your Distiller email",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #fafafa; margin-bottom: 16px;">Verify your email</h2>
        <p style="color: #a1a1aa; margin-bottom: 24px;">Click the button below to verify your Distiller account.</p>
        <a href="${url}" style="display: inline-block; background: #fafafa; color: #09090b; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">Verify Email</a>
        <p style="color: #71717a; margin-top: 24px; font-size: 13px;">This link expires in 24 hours.</p>
      </div>
    `
  };
}

export function buildDailyBriefingEmail(articles: Array<{ title: string; bullets: string[]; url: string; source: string }>) {
  const articleHtml = articles
    .map(
      (a) => `
      <div style="margin-bottom: 24px; padding: 16px; background: #18181b; border-radius: 8px; border: 1px solid #27272a;">
        <h3 style="color: #fafafa; margin: 0 0 8px; font-size: 16px;">${escapeHtml(a.title)}</h3>
        <ul style="color: #a1a1aa; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
          ${a.bullets.map((b) => `<li>${escapeHtml(b)}</li>`).join("")}
        </ul>
        <p style="margin: 8px 0 0;">
          <a href="${a.url}" style="color: #3b82f6; font-size: 13px;">Read on ${escapeHtml(a.source)} →</a>
        </p>
      </div>
    `
    )
    .join("");

  return {
    subject: `Your Daily Distiller — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #09090b;">
        <h1 style="color: #fafafa; margin-bottom: 8px; font-size: 20px;">Daily Distiller</h1>
        <p style="color: #71717a; margin-bottom: 24px; font-size: 14px;">Your AI-curated news briefing</p>
        ${articleHtml}
        <hr style="border: none; border-top: 1px solid #27272a; margin: 24px 0;" />
        <p style="color: #52525b; font-size: 12px;">
          You're receiving this because you enabled daily briefings in Distiller.
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://distiller.attafii.dev"}/dashboard/settings" style="color: #3b82f6;">Manage preferences</a>
        </p>
      </div>
    `
  };
}

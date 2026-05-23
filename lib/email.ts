export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const provider = process.env.EMAIL_PROVIDER ?? "console";
  if (provider === "console") {
    console.log("📧 EMAIL TO:", to);
    console.log("📧 SUBJECT:", subject);
    console.log("📧 BODY:", html.slice(0, 200));
    return { id: `console-${Date.now()}` };
  }
  throw new Error("Email provider not configured");
}
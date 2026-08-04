import { Resend } from "resend";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL ?? "PreCompilers <onboarding@resend.dev>";
}

export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  await getResendClient().emails.send({
    from: getFromAddress(),
    to,
    subject: "Verify your PreCompilers email",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  code: string
): Promise<void> {
  await getResendClient().emails.send({
    from: getFromAddress(),
    to,
    subject: "Reset your PreCompilers password",
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
}

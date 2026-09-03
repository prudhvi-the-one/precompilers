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
  const { error } = await getResendClient().emails.send({
    from: getFromAddress(),
    to,
    subject: "Verify your PreCompilers email",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
  if (error) {
    throw new Error(`Resend failed to send verification email: ${error.message}`);
  }
}

export async function sendPasswordResetEmail(
  to: string,
  code: string
): Promise<void> {
  const { error } = await getResendClient().emails.send({
    from: getFromAddress(),
    to,
    subject: "Reset your PreCompilers password",
    text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
  });
  if (error) {
    throw new Error(`Resend failed to send password reset email: ${error.message}`);
  }
}

const RESEND_BATCH_LIMIT = 100;

// Bulk roster uploads create many accounts in one request — looping
// sendPasswordResetEmail per account would be hundreds of sequential HTTP
// calls. Resend's batch endpoint accepts up to 100 emails per call, so a
// 1,000-row upload is ~10 calls instead of 1,000.
export async function sendPasswordResetEmailBatch(
  recipients: { to: string; code: string }[]
): Promise<void> {
  const client = getResendClient();
  const from = getFromAddress();
  for (let i = 0; i < recipients.length; i += RESEND_BATCH_LIMIT) {
    const chunk = recipients.slice(i, i + RESEND_BATCH_LIMIT);
    const { error } = await client.batch.send(
      chunk.map(({ to, code }) => ({
        from,
        to,
        subject: "Reset your PreCompilers password",
        text: `Your password reset code is ${code}. It expires in 10 minutes. If you didn't request this, you can ignore this email.`,
      }))
    );
    if (error) {
      throw new Error(`Resend failed to send a batch of password reset emails: ${error.message}`);
    }
  }
}

function getMsg91Config(): { authKey: string; templateId: string } {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;
  if (!authKey) {
    throw new Error("MSG91_AUTH_KEY environment variable is not set");
  }
  // MSG91's Send OTP API accepts a request with no template_id and reports
  // success (queuing the job), but never actually delivers anything without
  // an approved template attached — so unlike Resend/Meta's optional
  // fallbacks, this one is a hard requirement, not a nice-to-have.
  if (!templateId) {
    throw new Error("MSG91_TEMPLATE_ID environment variable is not set");
  }
  return { authKey, templateId };
}

// MSG91 is used purely as an SMS delivery channel here — we generate, hash,
// and verify the code ourselves via src/lib/otp.ts (same pattern as Resend
// for email and Meta's Cloud API for WhatsApp). MSG91's `otp` param lets us
// pass our own code instead of letting MSG91 generate/track it.
export async function sendSmsOtp(phoneNumber: string, code: string): Promise<void> {
  const { authKey, templateId } = getMsg91Config();
  const params = new URLSearchParams({
    otp: code,
    mobile: phoneNumber.replace(/^\+/, ""),
    authkey: authKey,
    template_id: templateId,
  });

  const res = await fetch(`https://control.msg91.com/api/v5/otp?${params.toString()}`);
  const data = await res.json();
  if (data.type !== "success") {
    throw new Error(`MSG91 failed to send OTP: ${JSON.stringify(data)}`);
  }
}

// Phone + OTP login is fully built and code-correct, but real SMS delivery
// is blocked on India DLT template approval (a real telecom-regulatory
// process, not something the app can control) — see src/lib/sms.ts. Keep the
// whole feature off by default until that approval clears; flip
// PHONE_LOGIN_ENABLED=true once a real OTP has been confirmed landing on a
// real phone.
export function isPhoneLoginEnabled(): boolean {
  return process.env.PHONE_LOGIN_ENABLED === "true";
}

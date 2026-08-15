import Razorpay from "razorpay";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";

function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET environment variables are not set");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function createOrder(
  amountPaise: number,
  receipt: string
): Promise<{ id: string; amount: number; currency: string }> {
  const order = await getRazorpayClient().orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
  });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET environment variable is not set");
  }
  return validatePaymentVerification(
    { order_id: orderId, payment_id: paymentId },
    signature,
    keySecret
  );
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET environment variable is not set");
  }
  return Razorpay.validateWebhookSignature(rawBody, signature, webhookSecret);
}

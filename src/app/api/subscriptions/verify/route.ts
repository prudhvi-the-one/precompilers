import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { subscriptionVerifySchema } from "@/lib/validation";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { termDays } from "@/lib/pricing";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = subscriptionVerifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = parsed.data;

  const subscription = await prisma.subscription.findUnique({
    where: { razorpayOrderId: orderId },
  });
  if (!subscription || subscription.userId !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (subscription.status === "ACTIVE") {
    return NextResponse.json({ success: true, tier: subscription.tier });
  }

  const validSignature = verifyPaymentSignature(orderId, paymentId, signature);
  if (!validSignature) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "FAILED" },
    });
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 }
    );
  }

  const startsAt = new Date();
  const expiresAt = new Date(
    startsAt.getTime() + termDays(subscription.billingCycle) * 24 * 60 * 60 * 1000
  );

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "ACTIVE", razorpayPaymentId: paymentId, startsAt, expiresAt },
    }),
    ...(user.entitlement === "INSTITUTION"
      ? []
      : [
          prisma.user.update({
            where: { id: user.id },
            data: { entitlement: "INDIVIDUAL" },
          }),
        ]),
  ]);

  return NextResponse.json({ success: true, tier: subscription.tier, expiresAt });
}

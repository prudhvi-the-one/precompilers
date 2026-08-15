import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { termDays } from "@/lib/pricing";

type RazorpayWebhookPayload = {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        order_id: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const body: RazorpayWebhookPayload = JSON.parse(rawBody);
  const orderId = body.payload.payment?.entity?.order_id;
  const paymentId = body.payload.payment?.entity?.id;
  if (!orderId || !paymentId) {
    return NextResponse.json({ received: true });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { razorpayOrderId: orderId },
  });
  if (!subscription || subscription.status === "ACTIVE") {
    return NextResponse.json({ received: true });
  }

  if (body.event === "payment.captured") {
    const startsAt = new Date();
    const expiresAt = new Date(
      startsAt.getTime() + termDays(subscription.billingCycle) * 24 * 60 * 60 * 1000
    );
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "ACTIVE", razorpayPaymentId: paymentId, startsAt, expiresAt },
      }),
      prisma.user.updateMany({
        where: { id: subscription.userId, entitlement: { not: "INSTITUTION" } },
        data: { entitlement: "INDIVIDUAL" },
      }),
    ]);
  } else if (body.event === "payment.failed") {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "FAILED" },
    });
  }

  return NextResponse.json({ received: true });
}

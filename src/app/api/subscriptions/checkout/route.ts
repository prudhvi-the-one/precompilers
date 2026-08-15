import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { subscriptionCheckoutSchema } from "@/lib/validation";
import { getTierDefinition, priceForBillingCycle } from "@/lib/pricing";
import { createOrder } from "@/lib/razorpay";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = subscriptionCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { tier, billingCycle } = parsed.data;
  const tierDef = getTierDefinition(tier);
  const amountPaise = priceForBillingCycle(tierDef, billingCycle);

  const order = await createOrder(amountPaise, `sub_${user.id}_${Date.now()}`);

  await prisma.subscription.create({
    data: {
      userId: user.id,
      tier,
      billingCycle,
      amountPaise,
      status: "CREATED",
      razorpayOrderId: order.id,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    tierName: tierDef.name,
  });
}

import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function notifyUser(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  phoneNumber?: string | null;
  whatsappOptIn?: boolean;
}): Promise<void> {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    },
  });

  if (!params.whatsappOptIn || !params.phoneNumber) {
    return;
  }

  try {
    await sendWhatsAppMessage(params.phoneNumber, `${params.title} — ${params.body}`);
    await prisma.notification.update({
      where: { id: notification.id },
      data: { whatsappSentAt: new Date() },
    });
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { whatsappError: err instanceof Error ? err.message : "Unknown error" },
    });
  }
}

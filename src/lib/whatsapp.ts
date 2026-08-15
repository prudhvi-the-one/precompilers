function getWhatsappConfig(): { accessToken: string; phoneNumberId: string } {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    throw new Error("WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID environment variables are not set");
  }
  return { accessToken, phoneNumberId };
}

// Meta's Cloud API only allows free-form text as a reply within a 24-hour
// window after the recipient messages the business number first. Every
// notification we send is business-initiated, so it must go as a template
// message. Until a real content template is approved in WhatsApp Manager
// (set via WHATSAPP_TEMPLATE_NAME), this falls back to Meta's built-in
// zero-approval "hello_world" template, which has fixed English content and
// takes no parameters — enough to prove the send pipeline works end to end.
export async function sendWhatsAppMessage(to: string, bodyText: string): Promise<void> {
  const { accessToken, phoneNumberId } = getWhatsappConfig();
  const customTemplate = process.env.WHATSAPP_TEMPLATE_NAME;
  const templateName = customTemplate ?? "hello_world";

  const payload = customTemplate
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en_US" },
          components: [{ type: "body", parameters: [{ type: "text", text: bodyText }] }],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: { name: templateName, language: { code: "en_US" } },
      };

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`WhatsApp send failed: ${res.status} ${errText}`);
  }
}

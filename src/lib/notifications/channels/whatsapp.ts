import { sendWhatsAppMessage, sendTemplateMessage } from "../../whatsapp.server";

export interface WhatsAppParams {
  recipient: string;
  body: string;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: any[];
}

export async function sendWhatsApp(
  params: WhatsAppParams,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (params.templateName) {
    return await sendTemplateMessage(
      params.recipient,
      params.templateName,
      params.templateLanguage || "en_US",
      params.templateComponents || [],
    );
  } else {
    return await sendWhatsAppMessage(params.recipient, params.body);
  }
}

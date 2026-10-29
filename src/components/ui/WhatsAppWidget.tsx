import React from "react";
import { SmartWhatsAppChatbot } from "@/components/chatbot/SmartWhatsAppChatbot";

/**
 * Global WhatsApp Support Widget wrapper
 * Loaded asynchronously on every public page via root route.
 */
export function WhatsAppWidget() {
  return <SmartWhatsAppChatbot />;
}

export default WhatsAppWidget;

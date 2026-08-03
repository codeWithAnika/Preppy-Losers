/**
 * WhatsApp Business API — server-side helpers.
 * App Router equivalent of lib/whatsapp.js
 */
export {
  normalizeWhatsAppPhone,
  sendTemplateMessage,
  sendWhatsAppMessage,
  type TemplateVariable,
  type WhatsAppSendResult,
} from "./whatsapp/client";

export {
  persistOutboundMessage,
  recordInboundMessage,
  updateMessageStatus,
} from "./whatsapp/db";

export {
  sendOrderConfirmationWhatsApp,
  sendWelcomeWhatsApp,
} from "./whatsapp/notifications";

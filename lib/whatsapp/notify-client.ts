/** Fire-and-forget WhatsApp notification requests from the client. */
export async function requestWhatsAppNotification(
  payload:
    | {
        type: "welcome";
        phone: string;
        customerName?: string;
      }
    | {
        type: "order_confirmation";
        phone: string;
        customerName?: string;
        orderId: string;
        amountInr: number;
        productSummary?: string;
      }
): Promise<void> {
  try {
    await fetch("/api/whatsapp/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking — checkout/signup must not fail if WhatsApp is down
  }
}

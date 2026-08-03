/** Fire-and-forget email notification requests from the client. */
export async function requestEmailNotification(
  payload:
    | {
        type: "welcome";
        customerName?: string;
      }
    | {
        type: "order_confirmation";
        orderId: string;
        paymentId?: string;
        amountInr: number;
        items: {
          productName: string;
          size: string;
          quantity: number;
          lineTotalInr: number;
        }[];
        shippingAddress?: {
          line1: string;
          line2?: string;
          city: string;
          state: string;
          pincode: string;
          phone?: string;
        };
        customerName?: string;
      }
): Promise<void> {
  try {
    await fetch("/api/email/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking — order/signup must not fail if email is down
  }
}

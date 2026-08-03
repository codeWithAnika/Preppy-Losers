"use server";

import { revalidatePath } from "next/cache";
import { assertAdminAction } from "@/lib/auth/is-admin";
import type { OrderStatus } from "@/lib/admin/types";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus,
  extras?: {
    trackingId?: string;
    courierName?: string;
    trackingUrl?: string;
    deliveryStatus?: string;
  }
) {
  const { supabase } = await assertAdminAction();

  const { error } = await supabase
    .from("orders")
    .update({
      status,
      tracking_id: extras?.trackingId ?? null,
      courier_name: extras?.courierName ?? null,
      tracking_url: extras?.trackingUrl ?? null,
      delivery_status: extras?.deliveryStatus ?? status,
    })
    .eq("id", orderId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

export async function bulkUpdateOrderStatusAction(
  orderIds: string[],
  status: OrderStatus
) {
  const { supabase } = await assertAdminAction();
  const { error } = await supabase
    .from("orders")
    .update({ status, delivery_status: status })
    .in("id", orderIds);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true as const };
}

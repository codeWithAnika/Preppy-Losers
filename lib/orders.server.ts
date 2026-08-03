import { createClient } from "@/lib/supabase/server";
import { formatINR } from "@/lib/cart";

export type Order = {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  amount: number;
  status: string;
  delivery_status: string | null;
  created_at: string;
};

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, product_id, size, quantity, amount, status, delivery_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  return (data ?? []) as Order[];
}

export function formatOrderDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export { formatINR };

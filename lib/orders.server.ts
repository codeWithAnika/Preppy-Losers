import { createClient } from "@/lib/supabase/server";

import { formatINR, type ShippingAddress } from "@/lib/cart";



export type Order = {

  id: string;

  product_id: string;

  product_name: string;

  size: string;

  quantity: number;

  amount: number;

  status: string;

  delivery_status: string | null;

  created_at: string;

  razorpay_order_id: string | null;

  shipping_address: ShippingAddress | null;

};



export type OrderGroup = {

  key: string;

  razorpay_order_id: string | null;

  created_at: string;

  status: string;

  delivery_status: string | null;

  total_amount: number;

  items: Order[];

  shipping_address: ShippingAddress | null;

};



type OrderRow = {

  id: string;

  product_id: string;

  size: string;

  quantity: number;

  amount: number;

  status: string;

  delivery_status: string | null;

  created_at: string;

  razorpay_order_id: string | null;

  shipping_address: ShippingAddress | null;

  products: { name: string } | null;

};



function parseShippingAddress(raw: unknown): ShippingAddress | null {

  if (!raw || typeof raw !== "object") return null;

  const entry = raw as Record<string, unknown>;

  if (typeof entry.line1 !== "string") return null;

  return {

    fullName: typeof entry.fullName === "string" ? entry.fullName : undefined,

    line1: entry.line1,

    line2: typeof entry.line2 === "string" ? entry.line2 : undefined,

    city: typeof entry.city === "string" ? entry.city : "",

    state: typeof entry.state === "string" ? entry.state : "",

    pincode: typeof entry.pincode === "string" ? entry.pincode : "",

    phone: typeof entry.phone === "string" ? entry.phone : "",

    country: typeof entry.country === "string" ? entry.country : undefined,

  };

}



export async function getUserOrders(userId: string): Promise<Order[]> {

  const supabase = createClient();



  const { data, error } = await supabase

    .from("orders")

    .select(

      "id, product_id, size, quantity, amount, status, delivery_status, created_at, razorpay_order_id, shipping_address, products(name)"

    )

    .eq("user_id", userId)

    .order("created_at", { ascending: false });



  if (error) {

    throw new Error(`Failed to fetch orders: ${error.message}`);

  }



  return ((data ?? []) as OrderRow[]).map((row) => ({

    id: row.id,

    product_id: row.product_id,

    product_name: row.products?.name ?? row.product_id,

    size: row.size,

    quantity: row.quantity,

    amount: row.amount,

    status: row.status,

    delivery_status: row.delivery_status,

    created_at: row.created_at,

    razorpay_order_id: row.razorpay_order_id,

    shipping_address: parseShippingAddress(row.shipping_address),

  }));

}



export function groupOrdersByPayment(orders: Order[]): OrderGroup[] {

  const groups = new Map<string, OrderGroup>();



  for (const order of orders) {

    const key = order.razorpay_order_id ?? order.id;

    const existing = groups.get(key);



    if (existing) {

      existing.items.push(order);

      existing.total_amount += order.amount;

    } else {

      groups.set(key, {

        key,

        razorpay_order_id: order.razorpay_order_id,

        created_at: order.created_at,

        status: order.status,

        delivery_status: order.delivery_status,

        total_amount: order.amount,

        items: [order],

        shipping_address: order.shipping_address,

      });

    }

  }



  return Array.from(groups.values()).sort(

    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

  );

}



export function formatOrderDate(dateString: string): string {

  return new Intl.DateTimeFormat("en-IN", {

    month: "short",

    day: "numeric",

    year: "numeric",

  }).format(new Date(dateString));

}



export { formatINR };



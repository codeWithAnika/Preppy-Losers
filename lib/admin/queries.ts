import { createClient } from "@/lib/supabase/server";
import type {
  AdminCustomerRow,
  AdminCustomerProfileRpc,
  AdminOrderRow,
  AdminOrderWithCustomer,
  AdminProductRow,
  AdminPromoCodeRow,
  AdminDropRow,
  ChartPoint,
  DashboardStats,
  StockAlert,
  StoreSettings,
} from "@/lib/admin/types";
import { DEFAULT_STORE_SETTINGS } from "@/lib/admin/types";
import { isOutOfStock, mapAdminProductRow } from "@/lib/admin/product-utils";
import { mapDropRow } from "@/lib/drops";
import { isDropListed } from "@/lib/purchasability";

export {
  buildDropGroups,
  formatSizeStockSummary,
  inventoryTotal,
  isOutOfStock,
  mapAdminProductRow,
} from "@/lib/admin/product-utils";

export async function fetchAdminDrops(): Promise<AdminDropRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .order("launch_date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminDropRow[];
}

export async function fetchAdminDrop(id: string): Promise<AdminDropRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drops")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as AdminDropRow | null;
}

export async function fetchAdminProducts(): Promise<AdminProductRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapAdminProductRow);
}

export async function fetchAdminProduct(id: string): Promise<AdminProductRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapAdminProductRow(data) : null;
}

export async function fetchAdminOrders(): Promise<AdminOrderRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminOrderRow[];
}

export async function fetchAdminCustomers(
  orderRows?: Array<{ user_id: string; amount: number }>
): Promise<AdminCustomerRow[]> {
  const supabase = createClient();

  const { data: profiles, error: profileError } = await supabase.rpc(
    "admin_customer_profiles"
  );

  if (profileError) {
    console.error("[admin] admin_customer_profiles failed:", profileError.message);
    return [];
  }

  const customerProfiles = (profiles ?? []) as AdminCustomerProfileRpc[];

  let orders = orderRows;
  if (!orders) {
    const { data, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, amount");

    if (ordersError) throw new Error(ordersError.message);
    orders = data ?? [];
  }

  const orderStats = new Map<string, { count: number; total: number }>();
  for (const order of orders) {
    const current = orderStats.get(order.user_id) ?? { count: 0, total: 0 };
    orderStats.set(order.user_id, {
      count: current.count + 1,
      total: current.total + order.amount,
    });
  }

  return customerProfiles.map((profile) => {
    const stats = orderStats.get(profile.id) ?? { count: 0, total: 0 };
    return {
      ...profile,
      order_count: stats.count,
      lifetime_value: stats.total,
    } as AdminCustomerRow;
  });
}

export async function fetchCustomerAddresses(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("settings")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data?.settings) {
    return DEFAULT_STORE_SETTINGS;
  }

  return { ...DEFAULT_STORE_SETTINGS, ...(data.settings as StoreSettings) };
}

function lastNDaysLabels(days: number): string[] {
  const labels: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(
      date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    );
  }
  return labels;
}

function groupByDay(orders: AdminOrderRow[], days: number): ChartPoint[] {
  const labels = lastNDaysLabels(days);
  const map = new Map<string, { revenue: number; count: number }>();

  for (const label of labels) {
    map.set(label, { revenue: 0, count: 0 });
  }

  for (const order of orders) {
    const label = new Date(order.created_at).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    if (!map.has(label)) continue;
    const current = map.get(label)!;
    current.revenue += order.amount;
    current.count += 1;
    map.set(label, current);
  }

  return labels.map((label) => ({
    label,
    value: map.get(label)?.revenue ?? 0,
  }));
}

function ordersByDay(orders: AdminOrderRow[], days: number): ChartPoint[] {
  const labels = lastNDaysLabels(days);
  const map = new Map<string, number>();
  for (const label of labels) map.set(label, 0);

  for (const order of orders) {
    const label = new Date(order.created_at).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    if (!map.has(label)) continue;
    map.set(label, (map.get(label) ?? 0) + 1);
  }

  return labels.map((label) => ({ label, value: map.get(label) ?? 0 }));
}

export async function fetchAdminPromoCodes(): Promise<AdminPromoCodeRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AdminPromoCodeRow[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [products, orders, drops] = await Promise.all([
    fetchAdminProducts(),
    fetchAdminOrders(),
    fetchAdminDrops(),
  ]);

  const customers = await fetchAdminCustomers(
    orders.map((order) => ({ user_id: order.user_id, amount: order.amount }))
  );

  const paidOrders = orders.filter(
    (order) => order.status !== "cancelled" && order.status !== "pending"
  );
  const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  const activeDrops = drops.filter((drop) => isDropListed(mapDropRow(drop)));
  const outOfStockCount = products.filter(isOutOfStock).length;

  const stockAlerts: StockAlert[] = [];
  for (const product of products) {
    for (const entry of product.size_stock ?? []) {
      if (entry.stock <= 2) {
        stockAlerts.push({
          productId: product.id,
          productName: product.name,
          size: entry.size,
          stock: entry.stock,
        });
      }
    }
  }

  const profileMap = new Map(
    customers.map((customer) => [customer.id, customer])
  );

  const recentOrders: AdminOrderWithCustomer[] = orders.slice(0, 8).map(
    (order) => ({
      ...order,
      customer_name: profileMap.get(order.user_id)?.full_name ?? null,
      customer_email: profileMap.get(order.user_id)?.email ?? null,
    })
  );

  return {
    revenue,
    ordersCount: orders.length,
    customersCount: customers.length,
    productsCount: products.length,
    activeDrops,
    outOfStockCount,
    recentOrders,
    latestCustomers: customers.slice(0, 6),
    stockAlerts: stockAlerts.slice(0, 8),
    salesByDay: groupByDay(paidOrders, 14),
    ordersByDay: ordersByDay(orders, 14),
  };
}

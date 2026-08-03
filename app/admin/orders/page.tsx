import { OrdersTable } from "@/components/admin/OrdersTable";
import { fetchAdminCustomers, fetchAdminOrders } from "@/lib/admin/queries";
import type { AdminOrderWithCustomer } from "@/lib/admin/types";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminOrdersPage() {
  await requireAdmin("/admin/orders");
  const [orders, customers] = await Promise.all([
    fetchAdminOrders(),
    fetchAdminCustomers(),
  ]);

  const profileMap = new Map(customers.map((customer) => [customer.id, customer]));
  const ordersWithCustomers: AdminOrderWithCustomer[] = orders.map((order) => ({
    ...order,
    customer_name: profileMap.get(order.user_id)?.full_name ?? null,
    customer_email: profileMap.get(order.user_id)?.email ?? null,
  }));

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Commerce</p>
          <h1>Orders</h1>
        </div>
      </div>
      <OrdersTable orders={ordersWithCustomers} />
    </div>
  );
}

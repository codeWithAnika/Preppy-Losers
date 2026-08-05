import { OrdersTable } from "@/components/admin/OrdersTable";
import { fetchAdminCustomers, fetchAdminOrders } from "@/lib/admin/queries";
import type { AdminOrderWithCustomer } from "@/lib/admin/types";

export default async function AdminOrdersPage() {
  const orders = await fetchAdminOrders();
  const customers = await fetchAdminCustomers(
    orders.map((order) => ({ user_id: order.user_id, amount: order.amount }))
  );
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

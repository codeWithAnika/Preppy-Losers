"use client";

import { useMemo, useState } from "react";
import type { AdminOrderWithCustomer, OrderStatus } from "@/lib/admin/types";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { formatAdminDateTime, formatINR, shortId } from "@/lib/admin/format";
import { Pagination, paginate } from "@/components/admin/Pagination";
import { OrderDrawer } from "@/components/admin/OrderDrawer";

interface OrdersTableProps {
  orders: AdminOrderWithCustomer[];
}

const PAGE_SIZE = 12;

export function OrdersTable({ orders }: OrdersTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderWithCustomer | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const { items, page: currentPage, totalPages } = paginate(filtered, page, PAGE_SIZE);

  return (
    <>
      <div className="admin-panel">
        <div className="admin-toolbar">
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((order) => (
                <tr key={order.id}>
                  <td>{shortId(order.id)}</td>
                  <td>{order.customer_name ?? "—"}</td>
                  <td>{order.customer_email ?? "—"}</td>
                  <td>{formatINR(order.amount)}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.razorpay_payment_id ? "Paid" : "—"}</td>
                  <td>{formatAdminDateTime(order.created_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() => setSelectedOrder(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
}

export type { OrderStatus };

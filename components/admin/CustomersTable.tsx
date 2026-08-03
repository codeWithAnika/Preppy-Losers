"use client";

import { Fragment, useState } from "react";
import type { AdminCustomerRow } from "@/lib/admin/types";
import { formatAdminDate, formatINR } from "@/lib/admin/format";
import { Pagination, paginate } from "@/components/admin/Pagination";

interface CustomersTableProps {
  customers: AdminCustomerRow[];
}

const PAGE_SIZE = 12;

export function CustomersTable({ customers }: CustomersTableProps) {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { items, page: currentPage, totalPages } = paginate(customers, page, PAGE_SIZE);

  return (
    <div className="admin-panel">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Orders</th>
              <th>Lifetime value</th>
              <th>Joined</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((customer) => (
              <Fragment key={customer.id}>
                <tr>
                  <td>{customer.full_name ?? "—"}</td>
                  <td>{customer.email ?? "—"}</td>
                  <td>{customer.order_count}</td>
                  <td>{formatINR(customer.lifetime_value)}</td>
                  <td>{formatAdminDate(customer.created_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      onClick={() =>
                        setExpanded((current) =>
                          current === customer.id ? null : customer.id
                        )
                      }
                    >
                      Details
                    </button>
                  </td>
                </tr>
                {expanded === customer.id ? (
                  <tr key={`${customer.id}-details`}>
                    <td colSpan={6}>
                      <div className="admin-customer-details">
                        <p>Phone: {customer.phone ?? "—"}</p>
                        <p>Role: {customer.role}</p>
                        <p className="admin-muted">
                          Addresses are loaded on the server for support workflows.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

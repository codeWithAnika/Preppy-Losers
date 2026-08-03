import { CustomersTable } from "@/components/admin/CustomersTable";
import { fetchAdminCustomers } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminCustomersPage() {
  await requireAdmin("/admin/customers");
  const customers = await fetchAdminCustomers();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Community</p>
          <h1>Customers</h1>
        </div>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
}

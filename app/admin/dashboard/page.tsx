import {
  DollarSign,
  Package,
  ShoppingBag,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { QuickActions } from "@/components/admin/QuickActions";
import { fetchDashboardStats } from "@/lib/admin/queries";
import { formatAdminDate, formatINR, shortId } from "@/lib/admin/format";

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats();

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__kicker">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-stat-grid">
        <StatCard label="Revenue" value={formatINR(stats.revenue)} icon={<DollarSign size={16} />} />
        <StatCard label="Orders" value={stats.ordersCount} icon={<ShoppingBag size={16} />} />
        <StatCard label="Customers" value={stats.customersCount} icon={<Users size={16} />} />
        <StatCard label="Products" value={stats.productsCount} icon={<Package size={16} />} />
        <StatCard
          label="Active Drops"
          value={String(stats.activeDrops.length)}
          hint={
            stats.activeDrops.length > 0
              ? stats.activeDrops.map((d) => d.name).join(", ")
              : "No live drops"
          }
          icon={<Zap size={16} />}
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStockCount}
          icon={<AlertTriangle size={16} />}
        />
      </div>

      <DashboardCharts salesByDay={stats.salesByDay} ordersByDay={stats.ordersByDay} />

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <h2 className="admin-section-title">Recent orders</h2>
          <div className="admin-list">
            {stats.recentOrders.length === 0 ? (
              <p className="admin-muted">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="admin-list__item">
                  <div>
                    <p>{shortId(order.id)}</p>
                    <span className="admin-muted">
                      {order.customer_name ?? order.customer_email ?? "Customer"}
                    </span>
                  </div>
                  <div className="admin-list__meta">
                    <strong>{formatINR(order.amount)}</strong>
                    <span className={`admin-badge admin-badge--${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="admin-section-title">Latest customers</h2>
          <div className="admin-list">
            {stats.latestCustomers.map((customer) => (
              <div key={customer.id} className="admin-list__item">
                <div>
                  <p>{customer.full_name ?? "Unnamed"}</p>
                  <span className="admin-muted">{customer.email ?? "—"}</span>
                </div>
                <span className="admin-muted">{formatAdminDate(customer.created_at)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-panel">
          <h2 className="admin-section-title">Stock alerts</h2>
          <div className="admin-list">
            {stats.stockAlerts.length === 0 ? (
              <p className="admin-muted">All sizes look healthy.</p>
            ) : (
              stats.stockAlerts.map((alert) => (
                <div key={`${alert.productId}-${alert.size}`} className="admin-list__item">
                  <div>
                    <p>{alert.productName}</p>
                    <span className="admin-muted">Size {alert.size}</span>
                  </div>
                  <span className="admin-badge admin-badge--danger">{alert.stock} left</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <QuickActions />
    </div>
  );
}

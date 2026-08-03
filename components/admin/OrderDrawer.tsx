"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";
import type { AdminOrderWithCustomer, OrderStatus } from "@/lib/admin/types";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { formatAdminDateTime, formatINR, shortId } from "@/lib/admin/format";
import { updateOrderStatusAction } from "@/lib/admin/actions/orders";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { useRouter } from "next/navigation";

interface OrderDrawerProps {
  order: AdminOrderWithCustomer | null;
  onClose: () => void;
}

export function OrderDrawer({ order, onClose }: OrderDrawerProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<OrderStatus>("paid");
  const [trackingId, setTrackingId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  useEffect(() => {
    if (!order) return;
    setStatus((order.status as OrderStatus) || "paid");
    setTrackingId(order.tracking_id ?? "");
    setCourierName(order.courier_name ?? "");
    setTrackingUrl(order.tracking_url ?? "");
  }, [order]);

  if (!order) return null;

  const shipping = order.shipping_address;

  const handleUpdate = () => {
    startTransition(async () => {
      const result = await updateOrderStatusAction(order.id, status, {
        trackingId,
        courierName,
        trackingUrl,
        deliveryStatus: status,
      });
      if (result.success) {
        toast("Order updated", "success");
        router.refresh();
        onClose();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="admin-drawer-backdrop" onClick={onClose}>
      <aside
        className="admin-drawer"
        onClick={(event) => event.stopPropagation()}
        aria-label="Order details"
      >
        <div className="admin-drawer__header">
          <div>
            <p className="admin-drawer__kicker">Order</p>
            <h2>{shortId(order.id)}</h2>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__section">
          <h3>Customer</h3>
          <p>{order.customer_name ?? "—"}</p>
          <p className="admin-muted">{order.customer_email ?? "—"}</p>
        </div>

        <div className="admin-drawer__section">
          <h3>Items</h3>
          <p>
            {order.product_id} · Size {order.size} × {order.quantity}
          </p>
          <p className="admin-drawer__amount">{formatINR(order.amount)}</p>
        </div>

        <div className="admin-drawer__section">
          <h3>Shipping</h3>
          {shipping ? (
            <address className="admin-address">
              {shipping.line1}
              {shipping.line2 ? `, ${shipping.line2}` : ""}
              <br />
              {shipping.city}, {shipping.state} {shipping.pincode}
              <br />
              {shipping.phone}
            </address>
          ) : (
            <p className="admin-muted">No shipping address</p>
          )}
        </div>

        <div className="admin-drawer__section">
          <h3>Payment</h3>
          <p>Razorpay: {order.razorpay_payment_id ?? "—"}</p>
          <p className="admin-muted">{formatAdminDateTime(order.created_at)}</p>
        </div>

        <div className="admin-drawer__section">
          <h3>Timeline</h3>
          <ul className="admin-timeline">
            <li>Created · {formatAdminDateTime(order.created_at)}</li>
            <li>Status · {order.status}</li>
            {order.delivery_status ? <li>Delivery · {order.delivery_status}</li> : null}
          </ul>
        </div>

        <div className="admin-drawer__section">
          <h3>Update status</h3>
          <label className="admin-field">
            <span>Status</span>
            <select
              className="admin-select"
              value={status}
              onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
              {ORDER_STATUSES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-field">
            <span>Tracking number</span>
            <input
              className="admin-input"
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Courier</span>
            <input
              className="admin-input"
              value={courierName}
              onChange={(event) => setCourierName(event.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>Tracking URL</span>
            <input
              className="admin-input"
              value={trackingUrl}
              onChange={(event) => setTrackingUrl(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            disabled={pending}
            onClick={handleUpdate}
          >
            {pending ? "Updating…" : "Update order"}
          </button>
        </div>
      </aside>
    </div>
  );
}

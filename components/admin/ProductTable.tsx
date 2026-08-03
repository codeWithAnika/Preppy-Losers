"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Archive,
  Copy,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { AdminProductRow } from "@/lib/admin/types";
import { formatAdminDate, formatINR } from "@/lib/admin/format";
import { inventoryTotal } from "@/lib/admin/product-utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Pagination, paginate } from "@/components/admin/Pagination";
import {
  archiveProductAction,
  bulkDeleteProductsAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/lib/admin/actions/products";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { useRouter } from "next/navigation";

interface ProductTableProps {
  products: AdminProductRow[];
  initialQuery?: string;
}

const PAGE_SIZE = 10;

export function ProductTable({ products, initialQuery = "" }: ProductTableProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "price">("newest");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; action: "delete" | "archive" } | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.id.toLowerCase().includes(q) ||
          String(product.drop_number ?? "").includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((product) => product.status === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price") return b.price - a.price;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [products, query, sortBy, statusFilter]);

  const { items, page: currentPage, totalPages } = paginate(filtered, page, PAGE_SIZE);

  const toggleAll = () => {
    if (selected.length === items.length) {
      setSelected([]);
    } else {
      setSelected(items.map((product) => product.id));
    }
  };

  const runAction = async () => {
    if (!confirm) return;
    setLoading(true);
    const result =
      confirm.action === "delete"
        ? await deleteProductAction(confirm.id)
        : await archiveProductAction(confirm.id);
    setLoading(false);
    setConfirm(null);
    if (result.success) {
      toast(confirm.action === "delete" ? "Product deleted" : "Product archived", "success");
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    const result = await bulkDeleteProductsAction(selected);
    setLoading(false);
    if (result.success) {
      toast("Selected products deleted", "success");
      setSelected([]);
      router.refresh();
    } else {
      toast(result.error, "error");
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-toolbar">
        <input
          className="admin-input"
          placeholder="Search products…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          className="admin-select"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
        >
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
        {selected.length > 0 ? (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={handleBulkDelete}
          >
            Delete ({selected.length})
          </button>
        ) : null}
        <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
          New Product
        </Link>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selected.length === items.length && items.length > 0}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th>Image</th>
              <th>Name</th>
              <th>Drop</th>
              <th>Price</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => {
              const image = product.primary_image || product.images?.[0] || "/product-placeholder.webp";
              return (
                <tr key={product.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() =>
                        setSelected((current) =>
                          current.includes(product.id)
                            ? current.filter((id) => id !== product.id)
                            : [...current, product.id]
                        )
                      }
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                  <td>
                    <div className="admin-table-thumb">
                      <Image src={image} alt="" width={40} height={40} />
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/products/${product.id}`} className="admin-link">
                      {product.name}
                    </Link>
                    {product.is_active ? (
                      <span className="admin-badge admin-badge--accent">Live</span>
                    ) : null}
                  </td>
                  <td>Drop {product.drop_number ?? "—"}</td>
                  <td>{formatINR(product.price)}</td>
                  <td>
                    <span className={`admin-badge admin-badge--${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>{inventoryTotal(product)}</td>
                  <td>{formatAdminDate(product.created_at)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link href={`/admin/products/${product.id}`} className="admin-icon-btn">
                        <Pencil size={14} />
                      </Link>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={async () => {
                          const result = await duplicateProductAction(product.id);
                          if (result.success) {
                            toast("Product duplicated", "success");
                            router.refresh();
                          } else {
                            toast(result.error, "error");
                          }
                        }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => setConfirm({ id: product.id, action: "archive" })}
                      >
                        <Archive size={14} />
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn"
                        onClick={() => setConfirm({ id: product.id, action: "delete" })}
                      >
                        <Trash2 size={14} />
                      </button>
                      <MoreHorizontal size={14} className="opacity-30" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.action === "delete" ? "Delete product?" : "Archive product?"}
        description="This action affects the storefront catalog."
        confirmLabel={confirm?.action === "delete" ? "Delete" : "Archive"}
        destructive={confirm?.action === "delete"}
        loading={loading}
        onCancel={() => setConfirm(null)}
        onConfirm={runAction}
      />
    </div>
  );
}

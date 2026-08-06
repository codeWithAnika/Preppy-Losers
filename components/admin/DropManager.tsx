"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DropGroup } from "@/lib/admin/types";
import { formatAdminDate } from "@/lib/admin/format";
import {
  activateDropAction,
  archiveDropAction,
  deactivateDropAction,
  deleteDropAction,
} from "@/lib/admin/actions/drops";
import { useAdminToast } from "@/components/admin/AdminProviders";

interface DropManagerProps {
  dropGroups: DropGroup[];
}

export function DropManager({ dropGroups }: DropManagerProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();

  const run = (action: () => Promise<{ success: boolean; error?: string }>, successMsg: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.success) {
        toast(successMsg, "success");
        router.refresh();
      } else {
        toast(result.error ?? "Action failed", "error");
      }
    });
  };

  return (
    <div className="admin-drops">
      <div className="admin-toolbar">
        <Link href="/admin/drops/new" className="admin-btn admin-btn--primary">
          Create drop
        </Link>
        <Link href="/admin/products/new" className="admin-btn admin-btn--ghost">
          Add product
        </Link>
      </div>

      <p className="admin-muted">
        Drops are collections. Assign one or many products to each drop. Activating a drop
        does not affect other drops.
      </p>

      <div className="admin-drop-grid">
        {dropGroups.map(({ drop, products }) => {
          const image = drop.hero_image || products[0]?.primary_image || "/product-placeholder.webp";

          return (
            <article key={drop.id} className="admin-drop-card">
              <div className="admin-drop-card__media">
                <Image src={image} alt="" fill className="object-cover" sizes="400px" />
              </div>
              <div className="admin-drop-card__body">
                <div className="admin-drop-card__head">
                  <div>
                    <p className="admin-drop-card__kicker">
                      Drop {String(drop.drop_number).padStart(2, "0")}
                    </p>
                    <h3>{drop.name}</h3>
                  </div>
                  <span
                    className={`admin-badge ${drop.is_active ? "admin-badge--accent" : ""}`}
                  >
                    {drop.is_active ? "Active" : drop.status}
                  </span>
                </div>
                <p className="admin-muted">
                  Launch · {drop.launch_date ? formatAdminDate(drop.launch_date) : "—"}
                </p>
                <p className="admin-muted">
                  {products.length} product{products.length === 1 ? "" : "s"}
                </p>
                <div className="admin-drop-card__actions">
                  {!drop.is_active ? (
                    <button
                      type="button"
                      className="admin-btn admin-btn--primary"
                      disabled={pending}
                      onClick={() =>
                        run(() => activateDropAction(drop.id), "Drop activated")
                      }
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      disabled={pending}
                      onClick={() =>
                        run(() => deactivateDropAction(drop.id), "Drop deactivated")
                      }
                    >
                      Deactivate
                    </button>
                  )}
                  <Link href={`/admin/drops/${drop.id}`} className="admin-btn admin-btn--ghost">
                    Edit drop
                  </Link>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={pending}
                    onClick={() =>
                      run(() => archiveDropAction(drop.id), "Drop archived")
                    }
                  >
                    Archive
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={pending || products.length > 0}
                    onClick={() =>
                      run(() => deleteDropAction(drop.id), "Drop deleted")
                    }
                  >
                    Delete
                  </button>
                </div>
                {products.length > 0 && (
                  <ul className="admin-drop-products-list">
                    {products.map((product) => (
                      <li key={product.id}>
                        <Link href={`/admin/products/${product.id}`}>{product.name}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

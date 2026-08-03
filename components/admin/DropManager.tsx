"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DropGroup } from "@/lib/admin/types";
import { formatAdminDate } from "@/lib/admin/format";
import {
  activateDropAction,
  archiveDropProductsAction,
  deactivateDropAction,
} from "@/lib/admin/actions/drops";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { useRouter } from "next/navigation";

interface DropManagerProps {
  drops: DropGroup[];
}

export function DropManager({ drops }: DropManagerProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [pending, startTransition] = useTransition();

  const handleActivate = (productId: string) => {
    startTransition(async () => {
      const result = await activateDropAction(productId);
      if (result.success) {
        toast("Drop activated", "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="admin-drops">
      <div className="admin-toolbar">
        <Link href="/admin/products/new" className="admin-btn admin-btn--primary">
          Launch new drop
        </Link>
      </div>

      <p className="admin-muted">
        Use <strong>Launch new drop</strong> to create a full product with images, stock, and
        pricing. Publish with &ldquo;Active drop product&rdquo; checked to swap the live drop
        automatically.
      </p>

      <div className="admin-drop-grid">
        {drops.map((drop) => {
          const hero = drop.heroProduct;
          const image =
            hero?.primary_image || hero?.images?.[0] || "/product-placeholder.webp";

          return (
            <article key={drop.dropNumber} className="admin-drop-card">
              <div className="admin-drop-card__media">
                <Image src={image} alt="" fill className="object-cover" sizes="400px" />
              </div>
              <div className="admin-drop-card__body">
                <div className="admin-drop-card__head">
                  <div>
                    <p className="admin-drop-card__kicker">{drop.title}</p>
                    <h3>{hero?.name ?? "No hero product"}</h3>
                  </div>
                  <span
                    className={`admin-badge ${drop.isActive ? "admin-badge--accent" : ""}`}
                  >
                    {drop.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="admin-muted">
                  Release · {drop.releaseDate ? formatAdminDate(drop.releaseDate) : "—"}
                </p>
                <p className="admin-muted">{drop.products.length} product(s)</p>
                <div className="admin-drop-card__actions">
                  {hero ? (
                    <>
                      {!drop.isActive ? (
                        <button
                          type="button"
                          className="admin-btn admin-btn--primary"
                          disabled={pending}
                          onClick={() => handleActivate(hero.id)}
                        >
                          Set active
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              const result = await deactivateDropAction(hero.id);
                              if (result.success) {
                                toast("Drop marked sold out / inactive", "success");
                                router.refresh();
                              } else {
                                toast(result.error, "error");
                              }
                            })
                          }
                        >
                          Mark sold out
                        </button>
                      )}
                      <Link href={`/admin/products/${hero.id}`} className="admin-btn admin-btn--ghost">
                        Edit hero
                      </Link>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await archiveDropProductsAction(drop.dropNumber);
                        if (result.success) {
                          toast("Drop archived", "success");
                          router.refresh();
                        } else {
                          toast(result.error, "error");
                        }
                      })
                    }
                  >
                    Archive drop
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

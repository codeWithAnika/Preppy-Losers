"use client";

import { useEffect, useState, useTransition } from "react";
import {
  buildDefaultSizeStock,
  STANDARD_DROP_SIZES,
  type SizeStock,
} from "@/lib/products";
import { updateProductStockAction } from "@/lib/admin/actions/products";
import { useAdminToast } from "@/components/admin/AdminProviders";
import { useRouter } from "next/navigation";

interface InventoryEditorProps {
  value: SizeStock[];
  onChange: (value: SizeStock[]) => void;
}

export function InventoryEditor({ value, onChange }: InventoryEditorProps) {
  const rows =
    value.length > 0 ? value : buildDefaultSizeStock([...STANDARD_DROP_SIZES]);

  useEffect(() => {
    if (value.length === 0) {
      onChange(buildDefaultSizeStock([...STANDARD_DROP_SIZES]));
    }
    // Seed default stock once for new products; parent may not have initialized yet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRow = (index: number, patch: Partial<SizeStock>) => {
    const next = rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const addRow = () => {
    onChange([...rows, { size: "", stock: 0 }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-inventory">
      <div className="admin-inventory__head">
        <span>Size</span>
        <span>Stock</span>
        <span />
      </div>
      {rows.map((row, index) => (
        <div key={`${row.size}-${index}`} className="admin-inventory__row">
          <input
            className="admin-input"
            value={row.size}
            onChange={(event) => updateRow(index, { size: event.target.value.toUpperCase() })}
            placeholder="M"
          />
          <input
            className="admin-input"
            type="number"
            min={0}
            value={row.stock}
            onChange={(event) =>
              updateRow(index, { stock: Number.parseInt(event.target.value, 10) || 0 })
            }
          />
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => removeRow(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn--ghost" onClick={addRow}>
        Add size
      </button>
    </div>
  );
}

interface DropStockPanelProps {
  productId: string;
  productName: string;
  sizeStock: SizeStock[];
}

export function DropStockPanel({
  productId,
  productName,
  sizeStock,
}: DropStockPanelProps) {
  const router = useRouter();
  const { toast } = useAdminToast();
  const [rows, setRows] = useState<SizeStock[]>(
    sizeStock.length > 0 ? sizeStock : buildDefaultSizeStock([...STANDARD_DROP_SIZES])
  );
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setRows(
      sizeStock.length > 0 ? sizeStock : buildDefaultSizeStock([...STANDARD_DROP_SIZES])
    );
  }, [sizeStock]);

  const updateRow = (index: number, stock: number) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, stock } : row))
    );
  };

  const save = () => {
    startTransition(async () => {
      const result = await updateProductStockAction(productId, rows);
      if (result.success) {
        toast(`Stock updated for ${productName}`, "success");
        router.refresh();
      } else {
        toast(result.error, "error");
      }
    });
  };

  return (
    <div className="admin-panel admin-drop-stock">
      <div className="admin-drop-stock__head">
        <div>
          <h2 className="admin-section-title">Active drop stock</h2>
          <p className="admin-muted">{productName} — adjust counts per size (0 = sold out).</p>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          disabled={pending}
          onClick={save}
        >
          {pending ? "Saving…" : "Save stock"}
        </button>
      </div>
      <div className="admin-inventory">
        <div className="admin-inventory__head">
          <span>Size</span>
          <span>Stock</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div key={`${row.size}-${index}`} className="admin-inventory__row">
            <input className="admin-input" value={row.size} readOnly />
            <input
              className="admin-input"
              type="number"
              min={0}
              value={row.stock}
              onChange={(event) =>
                updateRow(index, Number.parseInt(event.target.value, 10) || 0)
              }
            />
            <span className="admin-muted">
              {row.stock === 0 ? "Sold out" : row.stock <= 2 ? "Low" : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

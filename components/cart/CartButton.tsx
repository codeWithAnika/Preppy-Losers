"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface CartButtonProps {
  size?: number;
  className?: string;
}

export function CartButton({ size = 20, className = "" }: CartButtonProps) {
  const openCart = useCartStore((state) => state.openCart);
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      className={`relative inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/80 transition-colors hover:text-foreground ${className}`}
    >
      <ShoppingBag size={size} strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-medium text-white">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </button>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatINR } from "@/lib/cart";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";

export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, closeCart]);

  if (!mounted) return null;

  const subtotal = getSubtotal();

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-none flex-col border-l border-white/10 bg-background transition-transform duration-300 sm:max-w-md ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-foreground">
            Cart
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag size={32} className="mb-4 text-muted" />
              <p className="text-sm text-muted">Your cart is empty.</p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-4 border-b border-white/10 pb-5"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-900">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm uppercase tracking-wide text-foreground">
                      {item.productName}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Size {item.size} · {formatINR(item.price)}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-white/20">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity - 1
                            )
                          }
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/70 hover:text-foreground"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[2rem] text-center text-xs tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.quantity + 1
                            )
                          }
                          className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/70 hover:text-foreground"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId, item.size)}
                        className="inline-flex min-h-11 items-center px-2 text-xs uppercase tracking-[0.15em] text-muted transition-colors hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-5">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="uppercase tracking-[0.2em] text-muted">Subtotal</span>
            <span className="text-foreground">{formatINR(subtotal)}</span>
          </div>

          {items.length > 0 ? (
            <MagneticGlitchButton
              variant="outline"
              className="w-full"
              onClick={() => {
                closeCart();
                router.push("/checkout");
              }}
            >
              Checkout
            </MagneticGlitchButton>
          ) : (
            <MagneticGlitchButton variant="outline" disabled className="w-full">
              Checkout
            </MagneticGlitchButton>
          )}
        </div>
      </aside>
    </>
  );
}

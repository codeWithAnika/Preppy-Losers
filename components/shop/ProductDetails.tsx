"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { DistressedHeadline } from "@/components/ui/DistressedHeadline";
import { MagneticGlitchButton } from "@/components/ui/MagneticGlitchButton";
import { useShopRevealEntrance } from "@/lib/use-shop-reveal-entrance";
import { useCartStore } from "@/lib/cart-store";
import {
  getSizeStock,
  isProductFullySoldOut,
  formatDropLabel,
  type Product,
} from "@/lib/products";
import { formatINR } from "@/lib/cart";

interface ProductDetailsProps {
  product: Product;
  selectedSize: string | null;
  onSelectedSizeChange: (size: string | null) => void;
}

export function ProductDetails({
  product,
  selectedSize,
  onSelectedSizeChange,
}: ProductDetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  const fullySoldOut = isProductFullySoldOut(product);
  const selectedStock = selectedSize ? getSizeStock(product, selectedSize) : 0;

  useShopRevealEntrance(containerRef, { stagger: 0.09, delay: 0.04 });

  useEffect(() => {
    onSelectedSizeChange(null);
    setQuantity(1);
  }, [product.id, onSelectedSizeChange]);

  useEffect(() => {
    if (selectedStock > 0 && quantity > selectedStock) {
      setQuantity(selectedStock);
    }
  }, [selectedStock, quantity]);

  const handleBuyNow = () => {
    if (!selectedSize) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] ?? "/product-placeholder.webp",
      price: Number(product.price),
      size: selectedSize,
      quantity,
      maxStock: selectedStock,
    });
    openCart();
  };

  return (
    <div ref={containerRef} className="flex flex-col">
      <p
        data-shop-reveal
        className="mb-2 text-xs uppercase tracking-[0.3em] text-muted"
      >
        {formatDropLabel(product.dropNumber)}
      </p>

      <DistressedHeadline
        as="h1"
        data-shop-reveal
        className="mb-3 text-2xl tracking-tight text-foreground md:text-3xl lg:text-4xl"
      >
        {product.name}
      </DistressedHeadline>

      {product.description && (
        <p
          data-shop-reveal
          className="mb-4 text-sm leading-relaxed text-foreground/70 md:text-base"
        >
          {product.description}
        </p>
      )}

      <p
        data-shop-reveal
        className="mb-8 text-lg text-foreground/90 md:text-xl"
      >
        {formatINR(product.price)}
      </p>

      {fullySoldOut ? (
        <div data-shop-reveal className="space-y-3">
          <MagneticGlitchButton disabled variant="outline">
            Sold Out
          </MagneticGlitchButton>
          <p className="text-center text-sm text-muted">
            This drop has ended.
          </p>
        </div>
      ) : (
        <>
          <div data-shop-reveal>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted">
              Size
            </p>
            <div className="flex flex-wrap gap-x-2 gap-y-7 pb-8 pt-2">
              {product.sizeStock.map(({ size, stock }) => {
                const soldOut = stock === 0;
                const lowStock = stock > 0 && stock < 10;
                const selected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                      onSelectedSizeChange(size);
                      setQuantity(1);
                    }}
                    className={`relative inline-flex min-h-10 min-w-[2.65rem] shrink-0 items-center justify-center border px-2.5 py-2.5 text-xs uppercase tracking-wider transition-colors sm:min-h-11 sm:min-w-[3.25rem] sm:px-3 sm:text-sm sm:tracking-widest ${
                      soldOut
                        ? "cursor-not-allowed border-white/10 text-foreground/25 line-through"
                        : selected
                          ? "border-foreground bg-foreground/10 text-foreground"
                          : "border-white/20 text-foreground/80 hover:border-white/50 hover:text-foreground"
                    }`}
                  >
                    {lowStock && (
                      <span className="low-stock-tag pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.58rem] font-medium normal-case tracking-normal text-accent sm:text-[0.62rem]">
                        Only {stock} left
                      </span>
                    )}
                    {size}
                    {soldOut && (
                      <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] normal-case tracking-normal text-foreground/30">
                        Sold Out
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div data-shop-reveal>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted">
              Quantity
            </p>
            <div className="inline-flex items-center border border-white/20">
              <button
                type="button"
                disabled={!selectedSize || quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="flex min-h-11 min-w-[2.75rem] items-center justify-center text-center text-sm tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                disabled={!selectedSize || quantity >= selectedStock}
                onClick={() =>
                  setQuantity((q) => Math.min(selectedStock, q + 1))
                }
                className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            {selectedSize && selectedStock > 0 && (
              <p className="mt-2 text-xs text-muted">
                {selectedStock} left in {selectedSize}
              </p>
            )}
          </div>

          <div data-shop-reveal>
            <MagneticGlitchButton
              variant="outline"
              disabled={!selectedSize}
              onClick={handleBuyNow}
            >
              Buy Now
            </MagneticGlitchButton>
          </div>
        </>
      )}
    </div>
  );
}

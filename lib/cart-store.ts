import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCartItemKey,
  getCartSubtotal,
  normalizeCartItems,
  parsePrice,
  type CartItem,
} from "@/lib/cart";

const DEFAULT_MAX_STOCK = 30;

function resolveMaxStock(
  ...candidates: Array<number | undefined>
): number {
  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value) && value >= 1) {
      return Math.floor(value);
    }
  }
  return DEFAULT_MAX_STOCK;
}

function capQuantity(quantity: number, maxStock: number): number {
  return Math.min(Math.max(1, Math.floor(quantity)), maxStock);
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const price = parsePrice(item.price);
        if (price === null) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[cart] Refusing to add item with invalid price:", item);
          }
          return;
        }

        const quantity = capQuantity(item.quantity ?? 1, DEFAULT_MAX_STOCK);
        const key = getCartItemKey(item.productId, item.size);
        const maxStock = resolveMaxStock(item.maxStock, quantity);

        set((state) => {
          const existing = state.items.find(
            (entry) => getCartItemKey(entry.productId, entry.size) === key
          );

          if (existing) {
            const stockCap = resolveMaxStock(item.maxStock, existing.maxStock);
            const nextQuantity = capQuantity(
              existing.quantity + quantity,
              stockCap
            );
            return {
              items: state.items.map((entry) =>
                getCartItemKey(entry.productId, entry.size) === key
                  ? {
                      ...entry,
                      price,
                      quantity: nextQuantity,
                      maxStock: stockCap,
                    }
                  : entry
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                productId: item.productId,
                productName: item.productName,
                productImage: item.productImage,
                price,
                size: item.size,
                quantity: capQuantity(quantity, maxStock),
                maxStock,
              },
            ],
          };
        });
      },

      updateQuantity: (productId, size, quantity) => {
        const key = getCartItemKey(productId, size);

        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }

        set((state) => ({
          items: state.items.map((entry) => {
            if (getCartItemKey(entry.productId, entry.size) !== key) {
              return entry;
            }

            const stockCap = resolveMaxStock(entry.maxStock);
            return {
              ...entry,
              quantity: capQuantity(quantity, stockCap),
            };
          }),
        }));
      },

      removeItem: (productId, size) => {
        const key = getCartItemKey(productId, size);
        set((state) => ({
          items: state.items.filter(
            (entry) => getCartItemKey(entry.productId, entry.size) !== key
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => getCartSubtotal(get().items),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "pl-cart",
      version: 2,
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState) => {
        const state = persistedState as { items?: unknown } | undefined;
        return { items: normalizeCartItems(state?.items ?? []) };
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { items?: unknown } | undefined;
        return {
          ...currentState,
          ...persisted,
          items: normalizeCartItems(persisted?.items ?? []),
        };
      },
    }
  )
);

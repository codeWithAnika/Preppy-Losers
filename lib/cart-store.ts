import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCartItemKey,
  getCartSubtotal,
  type CartItem,
} from "@/lib/cart";

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
        const quantity = item.quantity ?? 1;
        const key = getCartItemKey(item.productId, item.size);

        set((state) => {
          const existing = state.items.find(
            (entry) => getCartItemKey(entry.productId, entry.size) === key
          );

          if (existing) {
            return {
              items: state.items.map((entry) =>
                getCartItemKey(entry.productId, entry.size) === key
                  ? { ...entry, quantity: entry.quantity + quantity }
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
                price: item.price,
                size: item.size,
                quantity,
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
          items: state.items.map((entry) =>
            getCartItemKey(entry.productId, entry.size) === key
              ? { ...entry, quantity }
              : entry
          ),
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
      partialize: (state) => ({ items: state.items }),
    }
  )
);

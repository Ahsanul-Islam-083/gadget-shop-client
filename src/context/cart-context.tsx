"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/auth-context";
import {
  addCartItem,
  clearCart as clearCartRequest,
  fetchCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart";
import type { Cart, CartItem } from "@/types/api";

export type CartStatus = "idle" | "loading" | "ready";

interface CartContextValue {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  status: CartStatus;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: Cart = { items: [], totalAmount: 0, itemCount: 0 };

function recalc(items: CartItem[]): Pick<Cart, "totalAmount" | "itemCount"> {
  const totalAmount = Number(
    items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0).toFixed(2)
  );
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  return { totalAmount, itemCount };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [status, setStatus] = useState<CartStatus>("idle");
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  // Adjust state during render (React-recommended): reset the cart and flip to
  // loading whenever the active user changes, so the fetch effect below runs
  // with a clean slate and no stale cross-user data can survive logout.
  const activeUserId = authStatus === "authed" && user ? user.id : null;
  if (loadedForUserId !== activeUserId) {
    setLoadedForUserId(activeUserId);
    setCart(EMPTY_CART);
    setStatus(activeUserId === null ? "idle" : "loading");
  }

  // Fetch on login/authed; the render-time adjustment above resets on logout.
  useEffect(() => {
    if (activeUserId === null) return;
    let cancelled = false;
    fetchCart()
      .then((next) => {
        if (cancelled) return;
        setCart(next);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setCart(EMPTY_CART);
        setStatus("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  const refresh = useCallback(async () => {
    const next = await fetchCart();
    setCart(next);
    setStatus("ready");
  }, []);

  const addItem = useCallback(
    async (productId: string, quantity = 1) => {
      await addCartItem(productId, quantity); // server increments quantity
      await refresh();
    },
    [refresh],
  );

  const updateQty = useCallback(
    async (id: string, quantity: number) => {
      // Optimistic absolute-set, then reconcile with the server response.
      setCart((prev) => {
        const items = prev.items.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity,
                lineTotal: Number((Number(item.product.price) * quantity).toFixed(2)),
              }
            : item
        );
        return { items, ...recalc(items) };
      });
      try {
        const updated = await updateCartItem(id, quantity);
        setCart((prev) => {
          const items = prev.items.map((item) => (item.id === id ? updated : item));
          return { items, ...recalc(items) };
        });
      } catch (error) {
        await refresh().catch(() => undefined); // rollback to server truth
        throw error;
      }
    },
    [refresh],
  );

  const removeItem = useCallback(
    async (id: string) => {
      setCart((prev) => {
        const items = prev.items.filter((item) => item.id !== id);
        return { items, ...recalc(items) };
      });
      try {
        await removeCartItem(id);
      } catch (error) {
        await refresh().catch(() => undefined);
        throw error;
      }
    },
    [refresh],
  );

  const clearCart = useCallback(async () => {
    setCart(EMPTY_CART);
    try {
      await clearCartRequest();
    } catch (error) {
      await refresh().catch(() => undefined);
      throw error;
    }
  }, [refresh]);

  const value = useMemo(
    () => ({
      items: cart.items,
      totalAmount: cart.totalAmount,
      itemCount: cart.itemCount,
      status,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [cart, status, addItem, updateQty, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

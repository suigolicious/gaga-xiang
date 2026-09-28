import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { DailyDishCap } from '@/constants/business';
import { FakeMenu, FakeOrderedCount, type MenuItem } from '@/data/fake-menu';
import { useNow } from '@/hooks/use-now';
import { getOrderingWindow, type OrderingWindow } from '@/lib/ordering-window';
import { salesTaxCents } from '@/lib/tax';

export type CartLine = { item: MenuItem; quantity: number };

type CartContextValue = {
  /** Null while a web page is being pre-rendered and the time isn't known yet. */
  window: OrderingWindow | null;
  isOpen: boolean;
  /** Dishes still available for the delivery day, after this cart. */
  remaining: number;
  canAdd: boolean;
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  quantityOf: (id: string) => number;
  increment: (id: string) => void;
  decrement: (id: string) => void;
};

type Quantities = Record<string, number>;

// TODO: once sign-in exists, clear this on sign-out so the cart only lasts while logged in.
const STORAGE_KEY = 'cart';

function isQuantities(value: unknown): value is Quantities {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((quantity) => Number.isInteger(quantity) && quantity > 0)
  );
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The customer's cart, plus the ordering rules that decide whether they can add
 * to it or check out. The cart is saved on the device and kept across days; it
 * applies to whichever delivery day is open. The server re-checks everything at checkout.
 */
export function CartProvider({ children }: PropsWithChildren) {
  const now = useNow();
  const window = now && getOrderingWindow(now);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        const parsed: unknown = saved && JSON.parse(saved);
        // Don't overwrite anything added while the saved cart was loading.
        if (isQuantities(parsed)) {
          setQuantities((current) => (Object.keys(current).length ? current : parsed));
        }
      })
      .catch(() => {
        // Unreadable or missing: start with an empty cart.
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Wait for the saved cart first, so the initial empty cart doesn't overwrite it.
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(quantities)).catch(() => {
      // Not saved; the cart still works for this session.
    });
  }, [loaded, quantities]);

  // Dishes no longer on the menu drop out of the cart.
  const lines = FakeMenu.filter((item) => quantities[item.id]).map((item) => ({
    item,
    quantity: quantities[item.id],
  }));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalCents = lines.reduce((sum, line) => sum + line.item.priceCents * line.quantity, 0);
  const taxCents = salesTaxCents(subtotalCents);

  const isOpen = window?.isOpen ?? false;
  // The daily cap covers every customer's order for the day.
  const remaining = DailyDishCap - FakeOrderedCount - count;
  const canAdd = isOpen && remaining > 0;

  const change = (id: string, delta: number) => {
    if (delta > 0 && !canAdd) return;
    setQuantities((current) => {
      const next = { ...current };
      const quantity = Math.max(0, (next[id] ?? 0) + delta);
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  };

  return (
    <CartContext
      value={{
        window,
        isOpen,
        remaining,
        canAdd,
        lines,
        count,
        subtotalCents,
        taxCents,
        totalCents: subtotalCents + taxCents,
        quantityOf: (id) => quantities[id] ?? 0,
        increment: (id) => change(id, 1),
        decrement: (id) => change(id, -1),
      }}>
      {children}
    </CartContext>
  );
}

export function useCart() {
  const context = use(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

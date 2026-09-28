import { createContext, use, useState, type PropsWithChildren } from 'react';

import { DailyDishCap } from '@/constants/business';
import { FakeMenu, FakeOrderedCount, type MenuItem } from '@/data/fake-menu';
import { useNow } from '@/hooks/use-now';
import { getOrderingWindow, toDateKey, type OrderingWindow } from '@/lib/ordering-window';

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
  totalCents: number;
  quantityOf: (id: string) => number;
  increment: (id: string) => void;
  decrement: (id: string) => void;
};

type CartState = {
  /** The delivery day these quantities are for. */
  dateKey: string | null;
  quantities: Record<string, number>;
};

const EMPTY: Record<string, number> = {};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The customer's cart for the next delivery day, plus the ordering rules that
 * decide whether they can add to it. The server re-checks all of this at checkout.
 */
export function CartProvider({ children }: PropsWithChildren) {
  const now = useNow();
  const window = now && getOrderingWindow(now);
  const dateKey = window && toDateKey(window.deliveryDate);

  const [state, setState] = useState<CartState>({ dateKey: null, quantities: EMPTY });
  // A cart holds dishes for one delivery day, so it starts empty once the day rolls over at midnight.
  const quantities = state.dateKey === dateKey ? state.quantities : EMPTY;

  const lines = FakeMenu.filter((item) => quantities[item.id]).map((item) => ({
    item,
    quantity: quantities[item.id],
  }));
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalCents = lines.reduce((sum, line) => sum + line.item.priceCents * line.quantity, 0);

  const isOpen = window?.isOpen ?? false;
  // The daily cap covers every customer's order for the day.
  const remaining = DailyDishCap - FakeOrderedCount - count;
  const canAdd = isOpen && remaining > 0;

  const change = (id: string, delta: number) => {
    if (!dateKey || (delta > 0 && !canAdd)) return;
    setState((current) => {
      const next = { ...(current.dateKey === dateKey ? current.quantities : EMPTY) };
      const quantity = Math.max(0, (next[id] ?? 0) + delta);
      if (quantity === 0) delete next[id];
      else next[id] = quantity;
      return { dateKey, quantities: next };
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
        totalCents,
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

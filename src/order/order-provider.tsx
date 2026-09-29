import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { DailyLunchboxCap, LunchboxPriceCents } from '@/constants/business';
import { FakeLocations, FakeOrderedCount, type PickupLocation } from '@/data/fake-lunchbox';
import { useNow } from '@/hooks/use-now';
import { getOrderingWindow, type OrderingWindow } from '@/lib/ordering-window';
import { salesTaxCents } from '@/lib/tax';

type OrderContextValue = {
  /** Null while a web page is being pre-rendered and the time isn't known yet. */
  window: OrderingWindow | null;
  isOpen: boolean;
  /** Lunchboxes still available for the delivery day, before this order. */
  available: number;
  soldOut: boolean;
  quantity: number;
  canIncrement: boolean;
  canDecrement: boolean;
  increment: () => void;
  decrement: () => void;
  location: PickupLocation | null;
  selectLocation: (id: string) => void;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
};

type Draft = { quantity: number; locationId: string | null };

// TODO: once sign-in exists, clear this on sign-out so it only lasts while logged in.
const STORAGE_KEY = 'order-draft';

const EMPTY_DRAFT: Draft = { quantity: 1, locationId: null };

function isDraft(value: unknown): value is Draft {
  if (typeof value !== 'object' || value === null) return false;
  const { quantity, locationId } = value as Record<string, unknown>;
  return (
    Number.isInteger(quantity) &&
    (quantity as number) >= 1 &&
    (locationId === null || typeof locationId === 'string')
  );
}

const OrderContext = createContext<OrderContextValue | null>(null);

/**
 * The customer's order in progress (how many lunchboxes, and where to pick them up),
 * plus the ordering rules that decide whether they can check out. It's saved on the
 * device and kept across days, so it applies to whichever delivery day is open, and
 * customers can keep changing it after the cutoff. The server re-checks everything
 * at checkout.
 */
export function OrderProvider({ children }: PropsWithChildren) {
  const now = useNow();
  const window = now && getOrderingWindow(now);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        const parsed: unknown = saved && JSON.parse(saved);
        if (isDraft(parsed)) setDraft(parsed);
      })
      .catch(() => {
        // Unreadable or missing: start from the defaults.
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    // Wait for the saved draft first, so the defaults don't overwrite it.
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft)).catch(() => {
      // Not saved; the order still works for this session.
    });
  }, [loaded, draft]);

  const isOpen = window?.isOpen ?? false;
  // The daily cap covers every customer's order for the day. After the cutoff the order
  // is for the following delivery, which nobody can have ordered for yet.
  const available = DailyLunchboxCap - (isOpen ? FakeOrderedCount : 0);
  const { quantity } = draft;
  // A location that's since been removed counts as not chosen.
  const location = FakeLocations.find((place) => place.id === draft.locationId) ?? null;
  const subtotalCents = LunchboxPriceCents * quantity;
  const taxCents = salesTaxCents(subtotalCents);

  const setQuantity = (next: number) => setDraft((current) => ({ ...current, quantity: next }));

  return (
    <OrderContext
      value={{
        window,
        isOpen,
        available,
        soldOut: available <= 0,
        quantity,
        canIncrement: quantity < available,
        canDecrement: quantity > 1,
        increment: () => quantity < available && setQuantity(quantity + 1),
        decrement: () => quantity > 1 && setQuantity(quantity - 1),
        location,
        selectLocation: (id) => setDraft((current) => ({ ...current, locationId: id })),
        subtotalCents,
        taxCents,
        totalCents: subtotalCents + taxCents,
      }}>
      {children}
    </OrderContext>
  );
}

export function useOrder() {
  const context = use(OrderContext);
  if (!context) throw new Error('useOrder must be used inside OrderProvider');
  return context;
}

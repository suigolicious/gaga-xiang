import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import {
  useBusinessSettings,
  useLunchboxesRemaining,
  usePickupLocations,
  type BusinessSettings,
  type PickupLocation,
} from '@/data/lunchbox';
import { useNow } from '@/hooks/use-now';
import { getOrderingWindow, type OrderingWindow } from '@/lib/ordering-window';
import { supabase } from '@/lib/supabase';
import { salesTaxCents } from '@/lib/tax';

type OrderContextValue = {
  /** Null until the settings have loaded, or while a web page is pre-rendered. */
  settings: BusinessSettings | null;
  /** Null until the settings have loaded, or while a web page is pre-rendered. */
  window: OrderingWindow | null;
  isOpen: boolean;
  /** Lunchboxes still available for the order's delivery day; null if not known. */
  available: number | null;
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
 * device and kept across days until sign-out, so it applies to whichever delivery day
 * is open, and customers can keep changing it after the cutoff. The server re-checks
 * everything at checkout.
 */
export function OrderProvider({ children }: PropsWithChildren) {
  const now = useNow();
  const settings = useBusinessSettings().data ?? null;
  const locations = usePickupLocations().data;
  const window =
    now && settings
      ? getOrderingWindow(now, { timeZone: settings.timeZone, cutoffHour: settings.orderCutoffHour })
      : null;
  const available = useLunchboxesRemaining(window?.orderDate ?? null).data ?? null;
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
    // The saved order only lasts while the customer stays signed in.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setDraft(EMPTY_DRAFT);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Wait for the saved draft first, so the defaults don't overwrite it.
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(draft)).catch(() => {
      // Not saved; the order still works for this session.
    });
  }, [loaded, draft]);

  const isOpen = window?.isOpen ?? false;
  const { quantity } = draft;
  // Never beyond what's left. If the count couldn't be loaded, the daily cap is the
  // limit instead of blocking the customer: checkout re-checks what's actually left.
  const limit = available ?? settings?.dailyLunchboxCap ?? 0;
  const canIncrement = quantity < limit;
  // A location that's since been removed or turned off counts as not chosen.
  const location = locations?.find((place) => place.id === draft.locationId) ?? null;
  const subtotalCents = (settings?.lunchboxPriceCents ?? 0) * quantity;
  const taxCents = salesTaxCents(subtotalCents, settings?.salesTaxBasisPoints ?? 0);

  const setQuantity = (next: number) => setDraft((current) => ({ ...current, quantity: next }));

  return (
    <OrderContext
      value={{
        settings,
        window,
        isOpen,
        available,
        soldOut: available !== null && available <= 0,
        quantity,
        canIncrement,
        canDecrement: quantity > 1,
        increment: () => canIncrement && setQuantity(quantity + 1),
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

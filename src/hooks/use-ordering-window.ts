import { useBusinessSettings, type BusinessSettings } from '@/data/lunchbox';
import { useNow } from '@/hooks/use-now';
import { getOrderingWindow, type OrderingWindow } from '@/lib/ordering-window';

/**
 * Development switch (EXPO_PUBLIC_IGNORE_ORDER_CUTOFF=true in .env.local): keeps
 * ordering for tomorrow open at any hour, so checkout can be tested in the evening.
 * Expo only inlines `process.env.EXPO_PUBLIC_*` written out in full like this.
 */
const IGNORE_ORDER_CUTOFF = process.env.EXPO_PUBLIC_IGNORE_ORDER_CUTOFF === 'true';

/**
 * Which day customers can order for right now, and whether ordering is open. Both
 * are null until the settings have loaded, or while a web page is pre-rendered.
 */
export function useOrderingWindow(): {
  settings: BusinessSettings | null;
  window: OrderingWindow | null;
} {
  const now = useNow();
  const settings = useBusinessSettings().data ?? null;
  const window =
    now && settings
      ? getOrderingWindow(now, {
          timeZone: settings.timeZone,
          cutoffHour: settings.orderCutoffHour,
          ignoreCutoff: IGNORE_ORDER_CUTOFF,
        })
      : null;
  return { settings, window };
}

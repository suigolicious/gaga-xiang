import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import type { Language } from '@/i18n';
import { fromIsoDate, toIsoDate, type CalendarDate } from '@/lib/ordering-window';
import { supabase } from '@/lib/supabase';

/**
 * Admin-only reads for the prep sheet and its history. Row-level security lets only
 * admins see everyone's orders.
 */

/** Lunchboxes ordered for a day: the total, and how many go to each location. */
export type PrepCount = {
  total: number;
  /** In the family's location order. Locations with no orders are left out. */
  byLocation: { id: string; name: Record<Language, string>; quantity: number }[];
};

/** One past (or today's) lunchbox in the sales history. */
export type DaySales = {
  date: CalendarDate;
  /** Dish names in display order, as entered (both languages in one). */
  dishNames: string[];
  sides: Record<Language, string>;
  /** Lunchboxes sold, which is also how many were made. */
  sold: number;
  /** Lunchboxes checked off at pickup on the packing list. */
  pickedUp: number;
};

const HISTORY_PAGE_SIZE = 30;

/** Confirmed (paid) lunchboxes for a day. Pending, cancelled, and refunded ones don't count. */
export function usePrepCount(date: CalendarDate | null) {
  const day = date && toIsoDate(date);
  return useQuery({
    queryKey: ['prep-count', day],
    enabled: day !== null,
    // Changes as customers order.
    staleTime: 15_000,
    queryFn: async (): Promise<PrepCount> => {
      const { data, error } = await supabase
        .from('orders')
        // Embeds the location even if it's since been turned off: admins can read all.
        .select('quantity, pickup_locations(id, name_en, name_zh, sort_order)')
        .eq('delivery_date', day!)
        .eq('status', 'confirmed');
      if (error) throw error;

      const byLocation = new Map<
        string,
        PrepCount['byLocation'][number] & { sortOrder: number }
      >();
      for (const { quantity, pickup_locations: place } of data) {
        const entry = byLocation.get(place.id) ?? {
          id: place.id,
          name: { en: place.name_en, 'zh-Hans': place.name_zh },
          quantity: 0,
          sortOrder: place.sort_order,
        };
        entry.quantity += quantity;
        byLocation.set(place.id, entry);
      }
      return {
        total: data.reduce((sum, row) => sum + row.quantity, 0),
        byLocation: [...byLocation.values()]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(({ sortOrder: _, ...entry }) => entry),
      };
    },
  });
}

/** Every lunchbox up to and including `today`, newest first, loaded a page at a time. */
export function useSalesHistory(today: CalendarDate | null) {
  const through = today && toIsoDate(today);
  return useInfiniteQuery({
    queryKey: ['sales-history', through],
    enabled: through !== null,
    initialPageParam: 0,
    // A full page means there may be more; a short one is the last.
    getNextPageParam: (lastPage: DaySales[], pages) =>
      lastPage.length === HISTORY_PAGE_SIZE ? pages.length * HISTORY_PAGE_SIZE : undefined,
    queryFn: async ({ pageParam }): Promise<DaySales[]> => {
      const { data, error } = await supabase
        .from('lunchbox_sales')
        .select('delivery_date, dish_names, sides_en, sides_zh, sold, picked_up')
        .lte('delivery_date', through!)
        .order('delivery_date', { ascending: false })
        .range(pageParam, pageParam + HISTORY_PAGE_SIZE - 1);
      if (error) throw error;
      // Postgres can't promise a view's columns aren't null, so the types allow it.
      return data.map((row) => ({
        date: fromIsoDate(row.delivery_date!),
        dishNames: row.dish_names ?? [],
        sides: { en: row.sides_en ?? '', 'zh-Hans': row.sides_zh ?? '' },
        sold: row.sold ?? 0,
        pickedUp: row.picked_up ?? 0,
      }));
    },
  });
}

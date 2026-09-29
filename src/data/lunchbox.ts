import { useQuery } from '@tanstack/react-query';

import type { Language } from '@/i18n';
import { toIsoDate, type CalendarDate } from '@/lib/ordering-window';
import { supabase } from '@/lib/supabase';

/**
 * The lunchbox, pickup locations, and business settings, loaded from Supabase.
 * Everything here is entered by the family, not translated by the app: a dish name
 * holds both names ("回锅肉 Twice-cooked pork") and reads the same in every
 * language; other text is written once per language.
 */

/** Price, cap, cutoff, and tax, set by the family. The server enforces them at checkout. */
export type BusinessSettings = {
  lunchboxPriceCents: number;
  dailyLunchboxCap: number;
  /** Orders for a day close at this hour (0-23) the day before, in `timeZone`. */
  orderCutoffHour: number;
  timeZone: string;
  /** 700 = 7.00% */
  salesTaxBasisPoints: number;
};

/** A dish in the family's library, entered once and reused on any day's lunchbox. */
export type Dish = {
  id: string;
  name: string;
  description: Record<Language, string>;
  /** Public URL of the photo, if one has been uploaded. */
  image?: string;
};

/** The one lunchbox every customer gets on a delivery day. */
export type Lunchbox = {
  /** Usually two, but the number varies day to day. */
  dishes: Dish[];
  /** What comes with the dishes, e.g. "Served with steamed rice". */
  sides: Record<Language, string>;
};

export type PickupLocation = {
  id: string;
  name: Record<Language, string>;
  address: string;
  /** Where the car parks; included in the "arrived" text. */
  pickupNote: Record<Language, string>;
};

const DISH_PHOTOS_BUCKET = 'dish-photos';

export function useBusinessSettings() {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: async (): Promise<BusinessSettings> => {
      const { data, error } = await supabase.from('business_settings').select('*').single();
      if (error) throw error;
      return {
        lunchboxPriceCents: data.lunchbox_price_cents,
        dailyLunchboxCap: data.daily_lunchbox_cap,
        orderCutoffHour: data.order_cutoff_hour,
        timeZone: data.time_zone,
        salesTaxBasisPoints: data.sales_tax_basis_points,
      };
    },
  });
}

/** Active pickup locations, in the family's chosen order. */
export function usePickupLocations() {
  return useQuery({
    queryKey: ['pickup-locations'],
    queryFn: async (): Promise<PickupLocation[]> => {
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('id, name_en, name_zh, address, pickup_note_en, pickup_note_zh')
        .eq('active', true)
        .order('sort_order');
      if (error) throw error;
      return data.map((row) => ({
        id: row.id,
        name: { en: row.name_en, 'zh-Hans': row.name_zh },
        address: row.address,
        pickupNote: { en: row.pickup_note_en, 'zh-Hans': row.pickup_note_zh },
      }));
    },
  });
}

/** The lunchbox for a delivery day, or null if the family hasn't posted it yet. */
export function useLunchbox(date: CalendarDate | null) {
  const day = date && toIsoDate(date);
  return useQuery({
    queryKey: ['lunchbox', day],
    enabled: day !== null,
    queryFn: async (): Promise<Lunchbox | null> => {
      const { data, error } = await supabase
        .from('lunchboxes')
        .select(
          'sides_en, sides_zh, lunchbox_dishes(position, dishes(id, name, description_en, description_zh, photo_path))',
        )
        .eq('delivery_date', day!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const dishes = [...data.lunchbox_dishes]
        .sort((a, b) => a.position - b.position)
        .map(({ dishes: dish }) => ({
          id: dish.id,
          name: dish.name,
          description: { en: dish.description_en, 'zh-Hans': dish.description_zh },
          image: dish.photo_path
            ? supabase.storage.from(DISH_PHOTOS_BUCKET).getPublicUrl(dish.photo_path).data.publicUrl
            : undefined,
        }));
      return { dishes, sides: { en: data.sides_en, 'zh-Hans': data.sides_zh } };
    },
  });
}

/** Lunchboxes still available for a delivery day, counting everyone's orders. */
export function useLunchboxesRemaining(date: CalendarDate | null) {
  const day = date && toIsoDate(date);
  return useQuery({
    queryKey: ['lunchboxes-remaining', day],
    enabled: day !== null,
    // Changes as other customers order, so check more often than the menu.
    staleTime: 15_000,
    // A function call, which Supabase doesn't retry itself (unlike reads).
    retry: 2,
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('lunchboxes_remaining', { day: day! });
      if (error) throw error;
      return data;
    },
  });
}

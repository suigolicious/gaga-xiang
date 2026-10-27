import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DISH_COLUMNS, toDish, type Dish, type Lunchbox } from '@/data/lunchbox';
import { toIsoDate, type CalendarDate } from '@/lib/ordering-window';
import { supabase } from '@/lib/supabase';

/**
 * Admin-only reads and writes for setting each day's lunchbox. Row-level security
 * rejects the writes for anyone who isn't an admin.
 */

/** A day's lunchbox as the editor works on it: dish ids rather than whole dishes. */
export type LunchboxContents = {
  dishIds: string[];
  sides: Lunchbox['sides'];
};

export type SavedLunchbox = LunchboxContents & {
  /** False until the day's lunchbox is first saved; customers can't see it before then. */
  posted: boolean;
};

/** Every dish in the library, by name. */
export function useDishLibrary() {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: async (): Promise<Dish[]> => {
      const { data, error } = await supabase.from('dishes').select(DISH_COLUMNS).order('name');
      if (error) throw error;
      return data.map(toDish);
    },
  });
}

/**
 * The day's saved lunchbox. A day that hasn't been posted yet starts with no dishes
 * and the sides of the latest earlier lunchbox, since those rarely change.
 */
export function useSavedLunchbox(date: CalendarDate | null) {
  const day = date && toIsoDate(date);
  return useQuery({
    queryKey: ['lunchbox-editor', day],
    enabled: day !== null,
    queryFn: async (): Promise<SavedLunchbox> => {
      const { data, error } = await supabase
        .from('lunchboxes')
        .select('sides_en, sides_zh, lunchbox_dishes(dish_id, position)')
        .eq('delivery_date', day!)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        return {
          posted: true,
          dishIds: [...data.lunchbox_dishes]
            .sort((a, b) => a.position - b.position)
            .map((row) => row.dish_id),
          sides: { en: data.sides_en, 'zh-Hans': data.sides_zh },
        };
      }

      const { data: previous, error: previousError } = await supabase
        .from('lunchboxes')
        .select('sides_en, sides_zh')
        .lt('delivery_date', day!)
        .order('delivery_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (previousError) throw previousError;
      return {
        posted: false,
        dishIds: [],
        sides: { en: previous?.sides_en ?? '', 'zh-Hans': previous?.sides_zh ?? '' },
      };
    },
  });
}

/** Saves (and posts, if new) a day's lunchbox in one transaction on the server. */
export function useSaveLunchbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ date, contents }: { date: CalendarDate; contents: LunchboxContents }) => {
      const { error } = await supabase.rpc('save_lunchbox', {
        day: toIsoDate(date),
        dish_ids: contents.dishIds,
        sides_en: contents.sides.en.trim(),
        sides_zh: contents.sides['zh-Hans'].trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_data, { date }) => {
      const day = toIsoDate(date);
      // Returning the promise keeps the mutation pending until the editor has the
      // saved version, so it doesn't flash "unsaved changes" in between.
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lunchbox-editor', day] }),
        queryClient.invalidateQueries({ queryKey: ['lunchbox', day] }),
      ]);
    },
  });
}

export type NewDish = {
  name: string;
  description: Dish['description'];
};

/** Adds a dish to the library. A photo can be added later. */
export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dish: NewDish): Promise<Dish> => {
      const { data, error } = await supabase
        .from('dishes')
        .insert({
          name: dish.name.trim(),
          description_en: dish.description.en.trim(),
          description_zh: dish.description['zh-Hans'].trim(),
        })
        .select(DISH_COLUMNS)
        .single();
      if (error) throw error;
      return toDish(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dishes'] }),
  });
}

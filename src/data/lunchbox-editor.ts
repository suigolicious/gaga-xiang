import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  DISH_COLUMNS,
  DISH_PHOTOS_BUCKET,
  toDish,
  type Dish,
  type Lunchbox,
} from '@/data/lunchbox';
import { dishPhotoPath } from '@/lib/dish-photo';
import { fromIsoDate, toIsoDate, type CalendarDate } from '@/lib/ordering-window';
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

/** Every dish in the library, by name. Deleted dishes are left out. */
export function useDishLibrary() {
  return useQuery({
    queryKey: ['dishes'],
    queryFn: async (): Promise<Dish[]> => {
      const { data, error } = await supabase
        .from('dishes')
        .select(DISH_COLUMNS)
        .is('deleted_at', null)
        .order('name');
      if (error) throw error;
      return data.map(toDish);
    },
  });
}

/**
 * The days from `today` on whose lunchbox includes the dish, earliest first. A dish
 * can't be deleted while this isn't empty.
 */
export function useUpcomingDishUses(dishId: string, today: CalendarDate) {
  const from = toIsoDate(today);
  return useQuery({
    queryKey: ['dish-upcoming-uses', dishId, from],
    // Checked fresh each time: it decides whether deleting is allowed.
    staleTime: 0,
    queryFn: async (): Promise<CalendarDate[]> => {
      const { data, error } = await supabase
        .from('lunchbox_dishes')
        .select('delivery_date')
        .eq('dish_id', dishId)
        .gte('delivery_date', from)
        .order('delivery_date');
      if (error) throw error;
      return data.map((row) => fromIsoDate(row.delivery_date));
    },
  });
}

/**
 * Deletes a dish from the library for good. The server refuses while the dish is in
 * today's or a later lunchbox, and keeps a hidden copy if past lunchboxes used it.
 */
export function useDeleteDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dishId: string) => {
      const { data: photoPath, error } = await supabase.rpc('delete_dish', { dish_id: dishId });
      if (error) throw error;
      // Erased entirely: remove its photo too. Best effort, since the dish is already
      // gone; a leftover file only takes up space.
      if (photoPath) await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([photoPath]);
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dishes'] }),
        queryClient.invalidateQueries({ queryKey: ['dish-upcoming-uses'] }),
      ]),
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
  /** A local JPEG from `toDishPhoto`, if a photo was chosen. */
  photoUri?: string;
};

/** Uploads a photo to dish-photos storage and returns its path there. */
async function uploadDishPhoto(uri: string, dishName: string) {
  const path = dishPhotoPath(dishName);
  // React Native can't upload a local file by its URI directly; read it into memory.
  const body = await (await fetch(uri)).arrayBuffer();
  const { error } = await supabase.storage
    .from(DISH_PHOTOS_BUCKET)
    .upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

/** Adds a dish to the library, uploading its photo first if it has one. */
export function useCreateDish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dish: NewDish): Promise<Dish> => {
      const name = dish.name.trim();
      const photoPath = dish.photoUri ? await uploadDishPhoto(dish.photoUri, name) : null;
      const { data, error } = await supabase
        .from('dishes')
        .insert({
          name,
          description_en: dish.description.en.trim(),
          description_zh: dish.description['zh-Hans'].trim(),
          photo_path: photoPath,
        })
        .select(DISH_COLUMNS)
        .single();
      if (error) {
        // Don't leave a photo behind that no dish uses. Best effort: the insert error
        // is the one worth reporting.
        if (photoPath) await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([photoPath]);
        throw error;
      }
      return toDish(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dishes'] }),
  });
}

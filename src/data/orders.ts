import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toIsoDate, type CalendarDate } from '@/lib/ordering-window';
import { supabase } from '@/lib/supabase';

/**
 * TEST CHECKOUT (temporary, until payment exists): places a confirmed order with no
 * payment. The server only accepts it from admins. To put the prep sheet back to 0
 * afterwards, run supabase/dev/clear-orders.sql in the Supabase SQL editor.
 */
export function usePlaceTestOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: { date: CalendarDate; locationId: string; quantity: number }) => {
      const { error } = await supabase.rpc('place_test_order', {
        day: toIsoDate(order.date),
        location_id: order.locationId,
        quantity: order.quantity,
      });
      if (error) throw error;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['lunchboxes-remaining'] }),
        queryClient.invalidateQueries({ queryKey: ['prep-count'] }),
      ]),
  });
}

/** True when the server refused an order because there weren't enough lunchboxes left. */
export function isNotEnoughLeft(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23514';
}

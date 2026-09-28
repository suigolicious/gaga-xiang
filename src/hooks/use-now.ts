import { useSyncExternalStore } from 'react';

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const interval = setInterval(onChange, MINUTE / 4);
  return () => clearInterval(interval);
}

// Rounded to the minute so the snapshot stays the same between ticks.
const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/**
 * The current time, updated every minute. Returns null while a web page is being
 * pre-rendered, so time-dependent text isn't baked in at build time.
 */
export function useNow(): Date | null {
  const now = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return now === null ? null : new Date(now);
}

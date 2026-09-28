/**
 * English UI strings. This file defines the translation keys; every other
 * language must provide the same keys (enforced by the `Translations` type).
 *
 * Dish names and descriptions are menu data, not UI strings, and are not
 * translated here.
 */
const en = {
  tabs: {
    menu: 'Menu',
    cart: 'Cart',
    orders: 'Orders',
    account: 'Account',
  },
  menu: {
    title: "Tomorrow's menu",
    description:
      'Browse the dishes for the next delivery day. Orders close at 2PM New York time the day before.',
  },
  cart: {
    title: 'Cart',
    description: 'Review your order for tomorrow and pay before the cutoff.',
  },
  orders: {
    title: 'Your orders',
    description: 'Upcoming and past orders, with confirmation and delivery updates.',
  },
  account: {
    title: 'Account',
    description: 'Sign in, delivery address, and notification settings.',
    openAdmin: 'Open admin (dev only)',
  },
  language: {
    label: 'Language',
  },
  admin: {
    title: 'Admin',
    customerApp: 'Customer app',
    prepSheet: {
      title: 'Prep sheet',
      summary: 'What to cook tomorrow',
      description: 'Total quantity of each dish to cook for tomorrow.',
    },
    packing: {
      title: 'Packing list',
      summary: 'Per-customer orders',
      description: "What goes into each customer's order.",
    },
    orders: {
      title: 'Orders',
      summary: 'Manage orders and refunds',
      description: 'Manage orders and issue refunds.',
    },
    menu: {
      title: 'Menu & capacity',
      summary: 'Dishes and the daily cap',
      description: "Set tomorrow's dishes and the daily cap of 100 dishes.",
    },
    deliveries: {
      title: 'Deliveries',
      summary: 'Morning stop list',
      description: 'Stop list for the morning delivery run.',
    },
  },
};

type DeepStrings<T> = { [K in keyof T]: T[K] extends string ? string : DeepStrings<T[K]> };

/** Shape every language's strings must match. */
export type Translations = DeepStrings<typeof en>;

export default en satisfies Translations;

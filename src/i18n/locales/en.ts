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
    delivery: 'Delivered {{date}}, around 7am',
    orderBy: 'Order by 2PM today',
    closed: "Orders for {{date}} have closed. Tomorrow's menu opens at midnight.",
    left_one: '{{count}} dish left for tomorrow',
    left_other: '{{count}} dishes left for tomorrow',
    soldOut: 'Sold out for tomorrow',
    lastInCart: "You have the last of tomorrow's dishes in your cart",
    add: 'Add {{name}}',
    remove: 'Remove one {{name}}',
    quantity: '{{count}} in cart',
    summary_one: '{{count}} dish · {{total}}',
    summary_other: '{{count}} dishes · {{total}}',
    viewCart: 'View cart',
  },
  cart: {
    title: 'Cart',
    empty: 'Your cart is empty',
    browse: "Browse tomorrow's menu",
    each: '{{price}} each',
    total: 'Total',
    checkout: 'Checkout',
    paymentSoon: "Payment isn't set up yet.",
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

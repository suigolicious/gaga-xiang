/**
 * English UI strings. This file defines the translation keys; every other
 * language must provide the same keys (enforced by the `Translations` type).
 *
 * Dish names and descriptions are lunchbox data, not UI strings, and are not
 * translated here.
 */
const en = {
  tabs: {
    lunchbox: 'Lunchbox',
    orders: 'Orders',
    account: 'Account',
  },
  lunchbox: {
    title: "Tomorrow's lunchbox",
    delivery: 'Delivered {{date}}, 12–1pm',
    orderBy: 'Order by 2PM today',
    notPosted: "Tomorrow's lunchbox hasn't been posted yet. Check back soon.",
    closedTitle: 'Ordering is closed for today',
    closedBody: 'Set up your order now and check out after midnight for delivery {{date}}.',
    left_one: '{{count}} lunchbox left for tomorrow',
    left_other: '{{count}} lunchboxes left for tomorrow',
    soldOut: 'Sold out for tomorrow',
    perBox: '{{price}} per lunchbox',
    dishDetails: 'Show details for {{name}}',
    close: 'Close',
    location: 'Pickup location',
    quantityLabel: 'Lunchboxes',
    add: 'Add a lunchbox',
    remove: 'Remove a lunchbox',
    quantity_one: '{{count}} lunchbox',
    quantity_other: '{{count}} lunchboxes',
    subtotal: 'Subtotal',
    tax: 'Tax ({{rate}}%)',
    total: 'Total',
    checkout: 'Checkout',
    paymentSoon: "Payment isn't set up yet.",
    chooseLocation: 'Choose a pickup location to check out.',
    soldOutCheckout: "Tomorrow's lunchboxes are sold out.",
    closedCheckout:
      'Ordering closed at 2PM. Your choices are saved, and you can check out after midnight for delivery {{date}}.',
  },
  orders: {
    title: 'Your orders',
    description: 'Upcoming and past orders, with confirmation and delivery updates.',
  },
  account: {
    title: 'Account',
    description: 'Sign in with your phone number, and text message settings.',
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

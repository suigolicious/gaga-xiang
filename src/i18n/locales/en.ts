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
    loadError: "Couldn't load the lunchbox. Check your connection and try again.",
    retry: 'Try again',
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
    signInToCheckout: 'Sign in to check out',
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
    signedOutIntro: 'Sign in with your phone number to order lunchboxes and get a text when they arrive.',
    signIn: 'Sign in',
    signOut: 'Sign out',
    nameLabel: 'Name',
    phoneLabel: 'Phone',
    adminTitle: 'Admin',
    adminSummary: 'Prep sheet, orders, and deliveries',
  },
  signIn: {
    title: 'Sign in',
    phoneIntro: "Enter your phone number and we'll text you a 6-digit code.",
    phoneLabel: 'Phone number',
    sendCode: 'Send code',
    sending: 'Sending…',
    consent:
      "By continuing, you agree to get texts from 嘎嘎香 GaGa-Xiang about your orders, like when your lunchbox arrives. Message and data rates may apply. Reply STOP to opt out.",
    codeIntro: 'Enter the code we sent to {{phone}}.',
    codeLabel: '6-digit code',
    verify: 'Verify',
    verifying: 'Verifying…',
    changeNumber: 'Change number',
    resend: 'Resend code',
    resendIn: 'Resend code in {{seconds}}s',
    nameIntro: 'What should we call you? This is how we match you with your lunchbox at pickup.',
    nameLabel: 'Your name',
    saveName: 'Continue',
    wrongCode: "That code didn't work. Check it, or send a new one.",
    tooMany: 'Too many tries. Wait a minute, then try again.',
    genericError: 'Something went wrong. Please try again.',
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

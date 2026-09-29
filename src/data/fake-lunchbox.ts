import type { Language } from '@/i18n';

/**
 * Placeholder data for designing the lunchbox screen before a backend exists.
 * Everything here is entered by the family, not translated by the app. A dish name
 * holds both names ("回锅肉 Twice-cooked pork") and reads the same in every
 * language; other text is written once per language.
 */

/** A dish in the family's library, entered once and reused on any day's lunchbox. */
export type Dish = {
  id: string;
  name: string;
  description: Record<Language, string>;
  /** A photo bundled with the app (`require(...)`) or a web URL. */
  image?: number | string;
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

export const FakeDishes = {
  garlicLettuce: {
    id: 'garlic-lettuce',
    name: '蒜香生菜 Garlic Lettuce',
    description: {
      en: 'Romaine lettuce stir-fried with fresh garlic.',
      'zh-Hans': '生菜配蒜末清炒，爽脆鲜香。',
    },
    image: require('@/assets/images/dishes/garlic-lettuce.jpg'),
  },
  wokFriedCauliflower: {
    id: 'wok-fried-cauliflower',
    name: '爆炒菜花 Wok-Fried Cauliflower',
    description: {
      en: 'Cauliflower florets and bell peppers, fried over high heat.',
      'zh-Hans': '菜花配彩椒大火爆炒，焦香爽脆。',
    },
    image: require('@/assets/images/dishes/wok-fried-cauliflower.jpg'),
  },
  woodEarEggs: {
    id: 'wood-ear-eggs',
    name: '木耳炒鸡蛋 Stir-Fried Eggs with Wood Ear Mushrooms',
    description: {
      en: 'Scrambled eggs with crunchy wood ear mushrooms.',
      'zh-Hans': '滑嫩鸡蛋配爽脆木耳和葱花翻炒。',
    },
    image: require('@/assets/images/dishes/wood-ear-eggs.jpg'),
  },
} satisfies Record<string, Dish>;

/** Tomorrow's lunchbox, or null if the family hasn't posted it yet. */
export const FakeLunchbox: Lunchbox | null = {
  dishes: [FakeDishes.woodEarEggs, FakeDishes.garlicLettuce],
  sides: {
    en: 'Served with steamed rice',
    'zh-Hans': '配白米饭',
  },
};

/** Placeholder addresses and pickup notes until the real ones are known. */
export const FakeLocations: PickupLocation[] = [
  {
    id: 'wfirm',
    name: { en: 'WFIRM', 'zh-Hans': 'WFIRM' },
    address: '123 Placeholder Ave, Winston-Salem, NC',
    pickupNote: {
      en: 'Silver minivan in the visitor lot by the main entrance',
      'zh-Hans': '正门旁访客停车场的银色面包车',
    },
  },
  {
    id: 'courthouse',
    name: { en: 'Courthouse', 'zh-Hans': '法院' },
    address: '456 Placeholder St, Winston-Salem, NC',
    pickupNote: {
      en: 'Silver minivan at the side-street loading zone',
      'zh-Hans': '侧街装卸区的银色面包车',
    },
  },
];

/** Lunchboxes other customers have already ordered for tomorrow, to show the low-capacity state. */
export const FakeOrderedCount = 88;

import type { Language } from '@/i18n';

/**
 * Placeholder menu for designing the menu screen before a backend exists.
 * Everything here is entered by the family, not translated by the app: the name
 * holds both names ("回锅肉 Twice-cooked pork") and reads the same in every
 * language, while the description is written once per language.
 */

export type MenuItem = {
  id: string;
  name: string;
  description: Record<Language, string>;
  /** Price in US cents, to avoid floating-point rounding. */
  priceCents: number;
  /** A photo bundled with the app (`require(...)`) or a web URL. */
  image?: number | string;
};

export const FakeMenu: MenuItem[] = [
  {
    id: 'garlic-lettuce',
    name: '蒜香生菜 Garlic Lettuce',
    description: {
      en: 'Romaine lettuce stir-fried with fresh garlic.',
      'zh-Hans': '生菜配蒜末清炒，爽脆鲜香。',
    },
    priceCents: 1000,
    image: require('@/assets/images/dishes/garlic-lettuce.jpg'),
  },
  {
    id: 'wok-fried-cauliflower',
    name: '爆炒菜花 Wok-Fried Cauliflower',
    description: {
      en: 'Cauliflower florets and bell peppers, fried over high heat.',
      'zh-Hans': '菜花配彩椒大火爆炒，焦香爽脆。',
    },
    priceCents: 1100,
    image: require('@/assets/images/dishes/wok-fried-cauliflower.jpg'),
  },
  {
    id: 'wood-ear-eggs',
    name: '木耳炒鸡蛋 Stir-Fried Eggs with Wood Ear Mushrooms',
    description: {
      en: 'Scrambled eggs with crunchy wood ear mushrooms.',
      'zh-Hans': '滑嫩鸡蛋配爽脆木耳和葱花翻炒。',
    },
    priceCents: 1000,
    image: require('@/assets/images/dishes/wood-ear-eggs.jpg'),
  },
  {
    id: 'fish-fragrant-pork',
    name: '鱼香肉丝 Yu xiang shredded pork',
    description: {
      en: 'Sweet, sour, and garlicky, with wood ear mushrooms.',
      'zh-Hans': '酸甜蒜香，配木耳丝。',
    },
    priceCents: 1400,
  },
  {
    id: 'dry-fried-green-beans',
    name: '干煸四季豆 Dry-fried green beans',
    description: {
      en: 'Blistered green beans with pork and preserved vegetables.',
      'zh-Hans': '四季豆煸至起皱，配肉末和芽菜。',
    },
    priceCents: 1200,
  },
  {
    id: 'hot-sour-potato',
    name: '酸辣土豆丝 Hot and sour potato',
    description: {
      en: 'Crisp shredded potato with vinegar and chili.',
      'zh-Hans': '爽脆土豆丝，酸辣开胃。',
    },
    priceCents: 900,
  },
  {
    id: 'braised-beef',
    name: '红烧牛肉 Red-braised beef',
    description: {
      en: 'Beef shank slow-braised with star anise and soy.',
      'zh-Hans': '牛腱子肉配八角和酱油慢炖。',
    },
    priceCents: 1800,
  },
];

/** Dishes already ordered for the next delivery day, to show the low-capacity state. */
export const FakeOrderedCount = 88;

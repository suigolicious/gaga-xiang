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
    id: 'mapo-tofu',
    name: '麻婆豆腐 Mapo tofu',
    description: {
      en: 'Soft tofu in a numbing, spicy sauce with minced beef.',
      'zh-Hans': '嫩豆腐配牛肉末，麻辣鲜香。',
    },
    priceCents: 1300,
  },
  {
    id: 'kung-pao-chicken',
    name: '宫保鸡丁 Kung pao chicken',
    description: {
      en: 'Diced chicken with peanuts and dried chilies.',
      'zh-Hans': '鸡丁配花生米和干辣椒。',
    },
    priceCents: 1500,
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

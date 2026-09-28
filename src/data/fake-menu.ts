/**
 * Placeholder menu for designing the menu screen before a backend exists.
 * Dish names and descriptions are entered by the family and shown as written —
 * they are not translated by the app.
 */

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  /** Price in US cents, to avoid floating-point rounding. */
  priceCents: number;
  imageUrl?: string;
};

export const FakeMenu: MenuItem[] = [
  {
    id: 'twice-cooked-pork',
    name: '回锅肉 Twice-cooked pork',
    description: 'Pork belly stir-fried with leeks and doubanjiang.',
    priceCents: 1600,
  },
  {
    id: 'mapo-tofu',
    name: '麻婆豆腐 Mapo tofu',
    description: 'Soft tofu in a numbing, spicy sauce with minced beef.',
    priceCents: 1300,
  },
  {
    id: 'kung-pao-chicken',
    name: '宫保鸡丁 Kung pao chicken',
    description: 'Diced chicken with peanuts and dried chilies.',
    priceCents: 1500,
  },
  {
    id: 'fish-fragrant-pork',
    name: '鱼香肉丝 Yu xiang shredded pork',
    description: 'Sweet, sour, and garlicky, with wood ear mushrooms.',
    priceCents: 1400,
  },
  {
    id: 'dry-fried-green-beans',
    name: '干煸四季豆 Dry-fried green beans',
    description: 'Blistered green beans with pork and preserved vegetables.',
    priceCents: 1200,
  },
  {
    id: 'hot-sour-potato',
    name: '酸辣土豆丝 Hot and sour potato',
    description: 'Crisp shredded potato with vinegar and chili.',
    priceCents: 900,
  },
  {
    id: 'braised-beef',
    name: '红烧牛肉 Red-braised beef',
    description: 'Beef shank slow-braised with star anise and soy.',
    priceCents: 1800,
  },
];

/** Dishes already ordered for the next delivery day, to show the low-capacity state. */
export const FakeOrderedCount = 88;

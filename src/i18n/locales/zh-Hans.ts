import type { Translations } from './en';

/** Simplified Chinese UI strings. */
const zhHans: Translations = {
  tabs: {
    menu: '菜单',
    cart: '购物车',
    orders: '订单',
    account: '我的',
  },
  menu: {
    title: '明日菜单',
    delivery: '{{date}} 早上 7 点左右送达',
    orderBy: '请在今天下午 2 点前下单',
    closedTitle: '今日已截止下单',
    closedBody: '可先加菜，午夜后结账，{{date}}送达。',
    // Chinese has no plural forms; both keys exist to match the English shape.
    left_one: '明日还剩 {{count}} 份',
    left_other: '明日还剩 {{count}} 份',
    soldOut: '明日已售罄',
    lastInCart: '明日最后几份已在你的购物车中',
    add: '添加{{name}}',
    remove: '减少一份{{name}}',
    quantity: '已加入 {{count}} 份',
    summary_one: '{{count}} 份 · {{total}}',
    summary_other: '{{count}} 份 · {{total}}',
    viewCart: '查看购物车',
  },
  cart: {
    title: '购物车',
    empty: '购物车是空的',
    browse: '浏览明日菜单',
    subtotal: '小计',
    tax: '税费（{{rate}}%）',
    total: '合计',
    checkout: '去结算',
    paymentSoon: '付款功能尚未开通。',
    closedCheckout: '{{date}}的订单已于下午 2 点截止。购物车已保存，午夜后可为下一次配送结账。',
  },
  orders: {
    title: '我的订单',
    description: '查看待配送和历史订单，以及订单确认和配送动态。',
  },
  account: {
    title: '我的账户',
    description: '登录、配送地址和通知设置。',
    openAdmin: '打开管理后台（仅开发模式）',
  },
  language: {
    label: '语言',
  },
  admin: {
    title: '管理后台',
    customerApp: '顾客端',
    prepSheet: {
      title: '备菜单',
      summary: '明天要做的菜',
      description: '明天每道菜需要制作的总数量。',
    },
    packing: {
      title: '打包清单',
      summary: '按顾客分装订单',
      description: '每位顾客订单中需要打包的菜品。',
    },
    orders: {
      title: '订单管理',
      summary: '管理订单和退款',
      description: '管理订单并处理退款。',
    },
    menu: {
      title: '菜单与份数上限',
      summary: '菜品和每日上限',
      description: '设置明天的菜品，以及每日 100 份的上限。',
    },
    deliveries: {
      title: '配送',
      summary: '早间配送站点',
      description: '早间配送路线的站点清单。',
    },
  },
};

export default zhHans;

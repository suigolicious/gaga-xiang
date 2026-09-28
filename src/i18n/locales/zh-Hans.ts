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
    description: '浏览下一个配送日的菜品。订单截止时间为配送前一天纽约时间下午 2 点。',
  },
  cart: {
    title: '购物车',
    description: '查看明天的订单，并在截止时间前完成付款。',
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

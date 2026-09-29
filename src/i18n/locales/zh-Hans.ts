import type { Translations } from './en';

/** Simplified Chinese UI strings. */
const zhHans: Translations = {
  tabs: {
    lunchbox: '盒饭',
    orders: '订单',
    account: '我的',
  },
  lunchbox: {
    title: '明日盒饭',
    delivery: '{{date}} 中午 12 点至 1 点送达',
    orderBy: '请在今天下午 2 点前下单',
    notPosted: '明日盒饭还没公布，请稍后再来看看。',
    closedTitle: '今日已截止下单',
    closedBody: '可先选好份数和取餐地点，午夜后结账，{{date}}送达。',
    // Chinese has no plural forms; both keys exist to match the English shape.
    left_one: '明日还剩 {{count}} 份',
    left_other: '明日还剩 {{count}} 份',
    soldOut: '明日已售罄',
    perBox: '每份 {{price}}',
    dishDetails: '查看{{name}}详情',
    close: '关闭',
    location: '取餐地点',
    quantityLabel: '份数',
    add: '加一份',
    remove: '减一份',
    quantity_one: '{{count}} 份',
    quantity_other: '{{count}} 份',
    subtotal: '小计',
    tax: '税费（{{rate}}%）',
    total: '合计',
    checkout: '去结算',
    paymentSoon: '付款功能尚未开通。',
    chooseLocation: '请选择取餐地点后再结账。',
    soldOutCheckout: '明日盒饭已售罄。',
    closedCheckout: '今日下午 2 点已截止下单。你的选择已保存，午夜后即可结账，{{date}}送达。',
  },
  orders: {
    title: '我的订单',
    description: '查看待配送和历史订单，以及订单确认和配送动态。',
  },
  account: {
    title: '我的账户',
    description: '用手机号登录，以及短信通知设置。',
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

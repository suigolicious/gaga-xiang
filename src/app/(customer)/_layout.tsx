import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';

import { CartProvider, useCart } from '@/cart/cart-provider';
import { useTheme } from '@/hooks/use-theme';

export default function CustomerLayout() {
  return (
    <CartProvider>
      <CustomerTabs />
    </CartProvider>
  );
}

function CustomerTabs() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { count } = useCart();

  return (
    <NativeTabs
      tintColor={theme.tint}
      backgroundColor={theme.background}
      indicatorColor={theme.backgroundSelected}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabs.menu')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant_menu" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>{t('tabs.cart')}</NativeTabs.Trigger.Label>
        {/* `hidden` only applies when there's no text; a badge with neither shows as a dot. */}
        <NativeTabs.Trigger.Badge hidden={count === 0}>
          {count > 0 ? String(count) : undefined}
        </NativeTabs.Trigger.Badge>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'cart', selected: 'cart.fill' }}
          md="shopping_cart"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>{t('tabs.orders')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="receipt_long" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Label>{t('tabs.account')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

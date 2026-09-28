import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MenuItemCard } from '@/components/menu/menu-item-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyDishCap } from '@/constants/business';
import { MaxContentWidth, Radius, Spacing, TopTabInset } from '@/constants/theme';
import { FakeMenu, FakeOrderedCount } from '@/data/fake-menu';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate, formatPrice } from '@/lib/format';
import { getOrderingWindow, type OrderingWindow } from '@/lib/ordering-window';

/** Show the "only N left" warning once remaining capacity drops to this. */
const LOW_CAPACITY_THRESHOLD = 20;

export default function MenuScreen() {
  const { t } = useTranslation();
  const now = useNow();
  const window = now && getOrderingWindow(now);

  // Local for now; moves to a shared cart when the Cart screen is built.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const changeQuantity = (id: string, delta: number) =>
    setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + delta) }));

  const cartCount = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const cartTotal = FakeMenu.reduce(
    (sum, item) => sum + item.priceCents * (quantities[item.id] ?? 0),
    0,
  );
  // The cap covers every customer's order for the day. The server re-checks this at checkout.
  const remaining = DailyDishCap - FakeOrderedCount - cartCount;
  const isOpen = window?.isOpen ?? false;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={FakeMenu}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <MenuHeader window={window} remaining={remaining} cartCount={cartCount} />
          }
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              quantity={quantities[item.id] ?? 0}
              canIncrement={isOpen && remaining > 0}
              onIncrement={() => changeQuantity(item.id, 1)}
              onDecrement={() => changeQuantity(item.id, -1)}
            />
          )}
        />
        {isOpen && cartCount > 0 && (
          <CartSummaryBar
            label={t('menu.summary', {
              count: cartCount,
              total: formatPrice(cartTotal),
            })}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

type MenuHeaderProps = {
  window: OrderingWindow | null;
  remaining: number;
  cartCount: number;
};

function MenuHeader({ window, remaining, cartCount }: MenuHeaderProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const date = window && formatCalendarDate(window.deliveryDate, language);

  // What the customer most needs to know about ordering right now.
  let status: string | null = null;
  let alert = false;
  if (window && !window.isOpen) {
    status = t('menu.closed', { date });
    alert = true;
  } else if (window && remaining <= 0) {
    status = cartCount > 0 ? t('menu.lastInCart') : t('menu.soldOut');
    alert = true;
  } else if (window && remaining <= LOW_CAPACITY_THRESHOLD) {
    status = t('menu.left', { count: remaining });
    alert = true;
  }

  return (
    <View style={styles.header}>
      <ThemedText type="subtitle">{t('menu.title')}</ThemedText>
      {/* Needs the current time, so it's skipped during web pre-rendering. While closed,
          the status message names the delivery date instead. */}
      {window?.isOpen && (
        <View style={styles.headerDetails}>
          <ThemedText themeColor="textSecondary">{t('menu.delivery', { date })}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('menu.orderBy')}
          </ThemedText>
        </View>
      )}
      {status && (
        <ThemedView type="backgroundSelected" style={styles.status}>
          <ThemedText type="smallBold" style={alert && { color: theme.tint }}>
            {status}
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

function CartSummaryBar({ label }: { label: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={styles.summaryContainer}>
      <Pressable
        onPress={() => router.navigate('/cart')}
        role="button"
        style={({ pressed }) => [
          styles.summaryBar,
          { backgroundColor: theme.primary },
          pressed && styles.pressed,
        ]}>
        <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
          {label}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.onPrimary }}>
          {t('menu.viewCart')} →
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingTop: TopTabInset + Spacing.three,
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  headerDetails: {
    gap: Spacing.half,
  },
  status: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  summaryContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.8,
  },
});

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '@/cart/cart-provider';
import { MenuItemCard } from '@/components/menu/menu-item-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TopTabInset } from '@/constants/theme';
import { FakeMenu } from '@/data/fake-menu';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate, formatPrice } from '@/lib/format';
import { addDays, type OrderingWindow } from '@/lib/ordering-window';

/** Show the "only N left" warning once remaining capacity drops to this. */
const LOW_CAPACITY_THRESHOLD = 20;

/** Room left under the last dish so it can scroll clear of the floating cart bar. */
const SUMMARY_BAR_SPACE = 88;

export default function MenuScreen() {
  const { t } = useTranslation();
  const cart = useCart();
  const insets = useSafeAreaInsets();
  const showSummary = cart.count > 0;

  return (
    <ThemedView style={styles.container}>
      {/* No bottom edge: the list scrolls under the tab bar and the floating cart bar. */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <FlatList
          data={FakeMenu}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + Spacing.three + (showSummary ? SUMMARY_BAR_SPACE : 0) },
          ]}
          ListHeaderComponent={
            <MenuHeader window={cart.window} remaining={cart.remaining} cartCount={cart.count} />
          }
          renderItem={({ item }) => (
            <MenuItemCard
              item={item}
              quantity={cart.quantityOf(item.id)}
              canIncrement={cart.canAdd}
              onIncrement={() => cart.increment(item.id)}
              onDecrement={() => cart.decrement(item.id)}
            />
          )}
        />
        {showSummary && (
          <CartSummaryBar
            label={t('menu.summary', {
              count: cart.count,
              total: formatPrice(cart.subtotalCents),
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

  // What the customer most needs to know about ordering right now. After the cutoff,
  // the closed notice covers it.
  let status: string | null = null;
  let alert = false;
  const isOpen = window?.isOpen ?? false;
  if (isOpen && remaining <= 0) {
    status = cartCount > 0 ? t('menu.lastInCart') : t('menu.soldOut');
    alert = true;
  } else if (isOpen && remaining <= LOW_CAPACITY_THRESHOLD) {
    status = t('menu.left', { count: remaining });
    alert = true;
  }

  return (
    <View style={styles.header}>
      <ThemedText type="subtitle">{t('menu.title')}</ThemedText>
      {/* Needs the current time, so it's skipped during web pre-rendering. While closed,
          the closed card names the next delivery date instead. */}
      {window && !window.isOpen && <ClosedNotice window={window} />}
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

/** After the cutoff: customers can keep filling their cart for the following delivery. */
function ClosedNotice({ window }: { window: OrderingWindow }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const nextDelivery = formatCalendarDate(addDays(window.deliveryDate, 1), language);

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.closedNotice, { borderLeftColor: theme.primary }]}>
      <ThemedText type="smallBold">{t('menu.closedTitle')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('menu.closedBody', { date: nextDelivery })}
      </ThemedText>
    </ThemedView>
  );
}

/** Floats over the list, so dishes scroll underneath it. */
function CartSummaryBar({ label }: { label: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.summaryContainer, { bottom: insets.bottom + Spacing.three }]}>
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
  closedNotice: {
    gap: Spacing.half,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderLeftWidth: 4,
  },
  summaryContainer: {
    position: 'absolute',
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    // Taps on either side of the bar reach the list underneath.
    pointerEvents: 'box-none',
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.pill,
    // Lifts the bar off the dishes scrolling beneath it.
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  pressed: {
    opacity: 0.8,
  },
});

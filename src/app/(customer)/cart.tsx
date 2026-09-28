import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart, type CartLine } from '@/cart/cart-provider';
import { DishImage } from '@/components/menu/menu-item-card';
import { QuantityStepper } from '@/components/menu/quantity-stepper';
import { TextLink } from '@/components/text-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TopTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate, formatPrice } from '@/lib/format';
import { SalesTaxPercent } from '@/lib/tax';

export default function CartScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const cart = useCart();
  const date = cart.window && formatCalendarDate(cart.window.deliveryDate, language);

  if (cart.count === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.empty]}>
          <ThemedText type="subtitle">{t('cart.empty')}</ThemedText>
          <TextLink href="/">{t('cart.browse')}</TextLink>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          data={cart.lines}
          keyExtractor={(line) => line.item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="subtitle">{t('cart.title')}</ThemedText>
              {cart.window?.isOpen && (
                <ThemedText themeColor="textSecondary">{t('menu.delivery', { date })}</ThemedText>
              )}
            </View>
          }
          renderItem={({ item: line }) => <CartLineRow line={line} />}
        />

        <View style={styles.checkout}>
          <View style={styles.totals}>
            <View style={styles.totalRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('cart.subtotal')}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatPrice(cart.subtotalCents)}
              </ThemedText>
            </View>
            <View style={styles.totalRow}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('cart.tax', { rate: SalesTaxPercent })}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatPrice(cart.taxCents)}
              </ThemedText>
            </View>
            <View style={styles.totalRow}>
              <ThemedText type="smallBold">{t('cart.total')}</ThemedText>
              <ThemedText type="smallBold">{formatPrice(cart.totalCents)}</ThemedText>
            </View>
          </View>
          {/* Grayed out after the cutoff (with the reason), and until payment exists: an order is
              only confirmed once the server verifies payment. */}
          <Pressable
            disabled
            role="button"
            aria-disabled
            style={[
              styles.checkoutButton,
              cart.isOpen
                ? [styles.disabled, { backgroundColor: theme.primary }]
                : { backgroundColor: theme.backgroundSelected },
            ]}>
            <ThemedText
              type="smallBold"
              style={{ color: cart.isOpen ? theme.onPrimary : theme.textSecondary }}>
              {t('cart.checkout')}
            </ThemedText>
          </Pressable>
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            {cart.window && !cart.isOpen
              ? t('cart.closedCheckout', { date })
              : t('cart.paymentSoon')}
          </ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const { t } = useTranslation();
  const cart = useCart();
  const { item, quantity } = line;

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <DishImage item={item} size={56} />
      <View style={styles.rowDetails}>
        <ThemedText type="smallBold">{item.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('cart.each', { price: formatPrice(item.priceCents) })}
        </ThemedText>
        <View style={styles.rowFooter}>
          <QuantityStepper
            quantity={quantity}
            canIncrement={cart.canAdd}
            onIncrement={() => cart.increment(item.id)}
            onDecrement={() => cart.decrement(item.id)}
            addLabel={t('menu.add', { name: item.name })}
            removeLabel={t('menu.remove', { name: item.name })}
            quantityLabel={t('menu.quantity', { count: quantity })}
          />
          <ThemedText type="smallBold">{formatPrice(item.priceCents * quantity)}</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
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
  row: {
    flexDirection: 'row',
    padding: Spacing.three,
    gap: Spacing.three,
    borderRadius: Radius.large,
  },
  rowDetails: {
    flex: 1,
    gap: Spacing.half,
  },
  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
  },
  checkout: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  totals: {
    gap: Spacing.one,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
  },
  checkoutButton: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Radius.pill,
  },
  disabled: {
    opacity: 0.5,
  },
  note: {
    textAlign: 'center',
  },
});

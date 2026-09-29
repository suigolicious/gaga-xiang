import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LunchboxCard } from '@/components/lunchbox/lunchbox-card';
import { PickupLocationPicker } from '@/components/lunchbox/pickup-location-picker';
import { QuantityStepper } from '@/components/quantity-stepper';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TopTabInset } from '@/constants/theme';
import { FakeLocations, FakeLunchbox } from '@/data/fake-lunchbox';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate, formatPrice } from '@/lib/format';
import { addDays, type OrderingWindow } from '@/lib/ordering-window';
import { SalesTaxPercent } from '@/lib/tax';
import { useOrder } from '@/order/order-provider';

/** Show the "N left" warning once remaining capacity drops to this. */
const LOW_CAPACITY_THRESHOLD = 20;

export default function LunchboxScreen() {
  const { t } = useTranslation();
  const order = useOrder();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Header window={order.window} available={order.available} />
          {FakeLunchbox ? (
            <>
              <LunchboxCard lunchbox={FakeLunchbox} />
              <Section title={t('lunchbox.location')}>
                <PickupLocationPicker
                  locations={FakeLocations}
                  selectedId={order.location?.id ?? null}
                  onSelect={order.selectLocation}
                />
              </Section>
              <QuantityRow />
              <Checkout />
            </>
          ) : (
            <ThemedText themeColor="textSecondary">{t('lunchbox.notPosted')}</ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Header({ window, available }: { window: OrderingWindow | null; available: number }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const date = window && formatCalendarDate(window.deliveryDate, language);

  // What the customer most needs to know about ordering right now. After the cutoff,
  // the closed notice covers it.
  let status: string | null = null;
  if (window?.isOpen && available <= 0) {
    status = t('lunchbox.soldOut');
  } else if (window?.isOpen && available <= LOW_CAPACITY_THRESHOLD) {
    status = t('lunchbox.left', { count: available });
  }

  return (
    <View style={styles.header}>
      <ThemedText type="subtitle">{t('lunchbox.title')}</ThemedText>
      {/* Needs the current time, so it's skipped during web pre-rendering. While closed,
          the closed notice names the next delivery date instead. */}
      {window && !window.isOpen && <ClosedNotice window={window} />}
      {window?.isOpen && (
        <View style={styles.headerDetails}>
          <ThemedText themeColor="textSecondary">{t('lunchbox.delivery', { date })}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('lunchbox.orderBy')}
          </ThemedText>
        </View>
      )}
      {status && (
        <ThemedView type="backgroundSelected" style={styles.status}>
          <ThemedText type="smallBold" style={{ color: theme.tint }}>
            {status}
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

/** After the cutoff: customers can keep setting up their order for the following delivery. */
function ClosedNotice({ window }: { window: OrderingWindow }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const nextDelivery = formatCalendarDate(addDays(window.deliveryDate, 1), language);

  return (
    <ThemedView
      type="backgroundElement"
      style={[styles.closedNotice, { borderLeftColor: theme.primary }]}>
      <ThemedText type="smallBold">{t('lunchbox.closedTitle')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('lunchbox.closedBody', { date: nextDelivery })}
      </ThemedText>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function QuantityRow() {
  const { t } = useTranslation();
  const order = useOrder();

  return (
    <ThemedView type="backgroundElement" style={styles.quantityRow}>
      <ThemedText type="smallBold">{t('lunchbox.quantityLabel')}</ThemedText>
      <QuantityStepper
        quantity={order.quantity}
        canIncrement={order.canIncrement}
        canDecrement={order.canDecrement}
        onIncrement={order.increment}
        onDecrement={order.decrement}
        addLabel={t('lunchbox.add')}
        removeLabel={t('lunchbox.remove')}
        quantityLabel={t('lunchbox.quantity', { count: order.quantity })}
      />
    </ThemedView>
  );
}

function Checkout() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const order = useOrder();

  // Why checkout isn't available yet, most important first.
  let note = t('lunchbox.paymentSoon');
  if (order.window && !order.isOpen) {
    const nextDelivery = formatCalendarDate(addDays(order.window.deliveryDate, 1), language);
    note = t('lunchbox.closedCheckout', { date: nextDelivery });
  } else if (order.soldOut) {
    note = t('lunchbox.soldOutCheckout');
  } else if (!order.location) {
    note = t('lunchbox.chooseLocation');
  }
  // Everything the customer controls is in place; only payment is missing.
  const ready = order.isOpen && !order.soldOut && order.location !== null;

  return (
    <View style={styles.checkout}>
      <View style={styles.totals}>
        <TotalRow label={t('lunchbox.subtotal')} cents={order.subtotalCents} />
        <TotalRow label={t('lunchbox.tax', { rate: SalesTaxPercent })} cents={order.taxCents} />
        <TotalRow label={t('lunchbox.total')} cents={order.totalCents} bold />
      </View>
      {/* Grayed out with the reason, and disabled until payment exists: an order is only
          confirmed once the server verifies payment. */}
      <Pressable
        disabled
        role="button"
        aria-disabled
        style={[
          styles.checkoutButton,
          ready
            ? [styles.disabled, { backgroundColor: theme.primary }]
            : { backgroundColor: theme.backgroundSelected },
        ]}>
        <ThemedText
          type="smallBold"
          style={{ color: ready ? theme.onPrimary : theme.textSecondary }}>
          {t('lunchbox.checkout')}
        </ThemedText>
      </Pressable>
      <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
        {note}
      </ThemedText>
    </View>
  );
}

function TotalRow({ label, cents, bold }: { label: string; cents: number; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={bold ? 'smallBold' : 'small'} themeColor={bold ? 'text' : 'textSecondary'}>
        {formatPrice(cents)}
      </ThemedText>
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
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingTop: TopTabInset + Spacing.three,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
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
  section: {
    gap: Spacing.two,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  checkout: {
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
    marginTop: Spacing.two,
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

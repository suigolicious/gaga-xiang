import { useTranslation } from 'react-i18next';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { TextLink } from '@/components/text-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useLunchbox } from '@/data/lunchbox';
import { usePrepCount } from '@/data/prep-sheet';
import { useOrderingWindow } from '@/hooks/use-ordering-window';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate } from '@/lib/format';
import { addDays } from '@/lib/ordering-window';

/**
 * How many lunchboxes to make. Shows the latest day whose ordering has closed: today
 * before the cutoff (what's being cooked this morning), tomorrow after it (the final
 * count, for shopping). While customers can still order for tomorrow, its count so
 * far is shown below.
 */
export default function PrepSheetScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { window } = useOrderingWindow();
  const today = window && addDays(window.deliveryDate, -1);
  const cookingDay = window && (window.isOpen ? today : window.deliveryDate);
  const openDay = window?.isOpen ? window.deliveryDate : null;

  const count = usePrepCount(cookingDay);
  const soFar = usePrepCount(openDay);
  const lunchbox = useLunchbox(cookingDay);
  const queries = openDay ? [count, soFar, lunchbox] : [count, lunchbox];
  const refetchAll = () => {
    for (const query of queries) query.refetch();
  };

  let body;
  if (queries.some((query) => query.isError)) {
    body = (
      <View style={styles.section}>
        <ThemedText themeColor="textSecondary">{t('admin.prepSheet.loadError')}</ThemedText>
        <Button label={t('lunchbox.retry')} onPress={refetchAll} style={styles.alignStart} />
      </View>
    );
  } else if (!cookingDay || !count.data || lunchbox.data === undefined) {
    // Also covers web pre-rendering, where the time (and so the day) isn't known yet.
    body = <ActivityIndicator style={styles.loading} />;
  } else {
    const date = formatCalendarDate(cookingDay, language);
    body = (
      <>
        <ThemedView type="backgroundElement" style={styles.totalCard}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {window?.isOpen
              ? t('admin.prepSheet.cookingToday', { date })
              : t('admin.prepSheet.cookingTomorrow', { date })}
          </ThemedText>
          <ThemedText style={styles.total}>{count.data.total}</ThemedText>
          <ThemedText type="smallBold">
            {t('admin.prepSheet.lunchboxes', { count: count.data.total })}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
            {t('admin.prepSheet.final')}
          </ThemedText>
        </ThemedView>

        {count.data.byLocation.length > 0 && (
          <Section title={t('admin.prepSheet.byLocation')}>
            {count.data.byLocation.map((place) => (
              <ThemedView key={place.id} type="backgroundElement" style={styles.row}>
                <ThemedText style={styles.grow}>{place.name[language]}</ThemedText>
                <ThemedText type="smallBold">{place.quantity}</ThemedText>
              </ThemedView>
            ))}
          </Section>
        )}

        <Section title={t('admin.prepSheet.inTheBox')}>
          {lunchbox.data ? (
            <>
              {lunchbox.data.dishes.map((dish) => (
                <ThemedView key={dish.id} type="backgroundElement" style={styles.row}>
                  <DishPhoto dish={dish} style={styles.photo} />
                  <ThemedText style={styles.grow}>{dish.name}</ThemedText>
                </ThemedView>
              ))}
              {lunchbox.data.sides[language] !== '' && (
                <ThemedText themeColor="textSecondary">{lunchbox.data.sides[language]}</ThemedText>
              )}
            </>
          ) : (
            <ThemedText themeColor="textSecondary">{t('admin.prepSheet.notPosted')}</ThemedText>
          )}
        </Section>

        {openDay && soFar.data && (
          <ThemedView type="backgroundElement" style={styles.soFar}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t('admin.prepSheet.tomorrow', { date: formatCalendarDate(openDay, language) })}
            </ThemedText>
            <ThemedText type="smallBold">
              {t('admin.prepSheet.soFar', { count: soFar.data.total })}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {t('admin.prepSheet.soFarNote')}
            </ThemedText>
          </ThemedView>
        )}

        <TextLink href="/admin/history" style={styles.center}>
          {t('admin.history.title')}
        </TextLink>
      </>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Pull down to refresh: React Native's built-in gesture for reloading a list. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={queries.some((query) => query.isRefetching)}
            onRefresh={refetchAll}
          />
        }>
        {body}
      </ScrollView>
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

const PHOTO_SIZE = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingBottom: Spacing.six,
    gap: Spacing.four,
  },
  totalCard: {
    alignItems: 'center',
    padding: Spacing.four,
    borderRadius: Radius.large,
    gap: Spacing.one,
  },
  total: {
    fontSize: 72,
    lineHeight: 80,
    fontWeight: 700,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
  },
  photo: {
    width: PHOTO_SIZE,
    borderRadius: Radius.small,
  },
  grow: {
    flex: 1,
  },
  soFar: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.half,
  },
  center: {
    textAlign: 'center',
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  loading: {
    marginTop: Spacing.five,
  },
});

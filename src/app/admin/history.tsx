import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useSalesHistory, type DaySales } from '@/data/prep-sheet';
import { useOrderingWindow } from '@/hooks/use-ordering-window';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate } from '@/lib/format';
import { addDays, toIsoDate } from '@/lib/ordering-window';

/** Every lunchbox up to today, newest first: what was in it, how many made and delivered. */
export default function SalesHistoryScreen() {
  const { t } = useTranslation();
  const { window } = useOrderingWindow();
  const today = window && addDays(window.deliveryDate, -1);
  const history = useSalesHistory(today);
  const days = history.data?.pages.flat() ?? [];

  let empty;
  if (history.isError) {
    empty = (
      <View style={styles.message}>
        <ThemedText themeColor="textSecondary">{t('admin.history.loadError')}</ThemedText>
        <Button label={t('lunchbox.retry')} onPress={() => history.refetch()} />
      </View>
    );
  } else if (!history.isSuccess) {
    empty = <ActivityIndicator style={styles.loading} />;
  } else {
    empty = (
      <ThemedText themeColor="textSecondary" style={styles.message}>
        {t('admin.history.empty')}
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* FlatList only renders the rows near the screen, so years of days stay fast. It
          asks for the next page as the end comes into view. */}
      <FlatList
        data={days}
        keyExtractor={(day) => toIsoDate(day.date)}
        renderItem={({ item }) => <DayRow day={item} />}
        ListEmptyComponent={empty}
        ListFooterComponent={
          history.isFetchingNextPage ? <ActivityIndicator style={styles.loading} /> : undefined
        }
        onEndReached={() => {
          if (history.hasNextPage && !history.isFetchingNextPage) history.fetchNextPage();
        }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      />
    </ThemedView>
  );
}

function DayRow({ day }: { day: DaySales }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const sides = day.sides[language];

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="smallBold">
        {formatCalendarDate(day.date, language, { withYear: true })}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {[day.dishNames.join(' + '), sides].filter(Boolean).join(' · ')}
      </ThemedText>
      <View style={styles.counts}>
        <ThemedText type="small">{t('admin.history.made', { count: day.sold })}</ThemedText>
        <ThemedText type="small">{t('admin.history.delivered', { count: day.pickedUp })}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    gap: Spacing.half,
  },
  counts: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  message: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  loading: {
    marginTop: Spacing.five,
  },
});

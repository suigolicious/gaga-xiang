import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
// Gesture Handler's version, so dragging a dish and scrolling the page don't fight.
import { ScrollView } from 'react-native-gesture-handler';

import { DishLibrary } from '@/components/admin/dish-library';
import { LunchboxDishList } from '@/components/admin/lunchbox-dish-list';
import { Button, IconButton } from '@/components/button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useBusinessSettings, type Dish } from '@/data/lunchbox';
import {
  useDishLibrary,
  useSaveLunchbox,
  useSavedLunchbox,
  type LunchboxContents,
} from '@/data/lunchbox-editor';
import { useNow } from '@/hooks/use-now';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate } from '@/lib/format';
import {
  addDays,
  getOrderingWindow,
  toIsoDate,
  type CalendarDate,
  type OrderingWindow,
} from '@/lib/ordering-window';

function sameContents(a: LunchboxContents, b: LunchboxContents) {
  return (
    a.dishIds.join() === b.dishIds.join() &&
    a.sides.en === b.sides.en &&
    a.sides['zh-Hans'] === b.sides['zh-Hans']
  );
}

/** Set the dishes and sides for a delivery day, or change a lunchbox already posted. */
export default function AdminLunchboxScreen() {
  const { t } = useTranslation();
  const now = useNow();
  const settings = useBusinessSettings().data;
  const window =
    now && settings
      ? getOrderingWindow(now, { timeZone: settings.timeZone, cutoffHour: settings.orderCutoffHour })
      : null;

  // Starts on the day customers are ordering for: tomorrow until the cutoff, then the
  // day after.
  const [picked, setPicked] = useState<CalendarDate | null>(null);
  const date = picked ?? window?.orderDate ?? null;
  const saved = useSavedLunchbox(date);
  const library = useDishLibrary();
  const save = useSaveLunchbox();

  // Edits on top of the saved lunchbox; null until something changes.
  const [draft, setDraft] = useState<LunchboxContents | null>(null);
  const contents = draft ?? saved.data ?? null;
  const dirty = draft !== null && saved.data !== undefined && !sameContents(draft, saved.data);

  const edit = (changes: Partial<LunchboxContents>) => {
    if (contents) setDraft({ ...contents, ...changes });
  };
  const changeDay = (offset: number) => {
    if (!date) return;
    setPicked(addDays(date, offset));
    setDraft(null);
    save.reset();
  };

  let body;
  if (saved.isError || library.isError) {
    body = (
      <View style={styles.section}>
        <ThemedText themeColor="textSecondary">{t('lunchbox.loadError')}</ThemedText>
        <Button
          label={t('lunchbox.retry')}
          onPress={() => {
            if (saved.isError) saved.refetch();
            if (library.isError) library.refetch();
          }}
          style={styles.alignStart}
        />
      </View>
    );
  } else if (!date || !window || !contents || !saved.data || !library.data) {
    body = <ActivityIndicator style={styles.loading} />;
  } else {
    const dishesById = new Map(library.data.map((dish) => [dish.id, dish]));
    const dishes = contents.dishIds
      .map((id) => dishesById.get(id))
      .filter((dish): dish is Dish => dish !== undefined);

    let note: string | null = null;
    if (dishes.length === 0) note = t('admin.lunchbox.needsDish');
    else if (save.isError) note = t('admin.lunchbox.saveError');
    else if (save.isSuccess && !dirty) note = t('admin.lunchbox.saved');

    body = (
      <>
        <Section title={t('admin.lunchbox.dishes')}>
          <LunchboxDishList
            dishes={dishes}
            onChange={(next) => edit({ dishIds: next.map((dish) => dish.id) })}
          />
        </Section>
        <Section title={t('admin.lunchbox.sides')}>
          <TextField
            label={t('admin.lunchbox.sidesEn')}
            placeholder={t('admin.lunchbox.sidesEnPlaceholder')}
            value={contents.sides.en}
            onChangeText={(en) => edit({ sides: { ...contents.sides, en } })}
          />
          <TextField
            label={t('admin.lunchbox.sidesZh')}
            placeholder={t('admin.lunchbox.sidesZhPlaceholder')}
            value={contents.sides['zh-Hans']}
            onChangeText={(zh) => edit({ sides: { ...contents.sides, 'zh-Hans': zh } })}
          />
        </Section>
        <View style={styles.saveBar}>
          <View style={styles.saveButtons}>
            {dirty && (
              <Button
                label={t('admin.lunchbox.discard')}
                onPress={() => setDraft(null)}
                disabled={save.isPending}
              />
            )}
            <Button
              variant="primary"
              label={
                save.isPending
                  ? t('admin.lunchbox.saving')
                  : saved.data.posted
                    ? t('admin.lunchbox.save')
                    : t('admin.lunchbox.post')
              }
              onPress={() =>
                save.mutate(
                  // Leaves out any dish deleted from the library since it was added.
                  { date, contents: { ...contents, dishIds: dishes.map((dish) => dish.id) } },
                  { onSuccess: () => setDraft(null) },
                )
              }
              disabled={!dirty || dishes.length === 0 || save.isPending}
            />
          </View>
          {note && (
            <ThemedText
              type="small"
              themeColor={save.isError ? 'tint' : 'textSecondary'}
              style={styles.note}>
              {note}
            </ThemedText>
          )}
        </View>
        <Section title={t('admin.lunchbox.library')}>
          <DishLibrary
            dishes={library.data}
            excludedIds={contents.dishIds}
            onAdd={(dish) => edit({ dishIds: [...contents.dishIds, dish.id] })}
            today={addDays(window.deliveryDate, -1)}
          />
        </Section>
      </>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* "handled" lets a tap on a button go through while the keyboard is up, instead
          of only dismissing the keyboard (React Native's default). */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={styles.content}>
        {date && window && (
          <DaySwitcher
            date={date}
            window={window}
            posted={saved.data?.posted ?? null}
            locked={dirty}
            onChange={changeDay}
          />
        )}
        {body}
      </ScrollView>
    </ThemedView>
  );
}

type DaySwitcherProps = {
  date: CalendarDate;
  window: OrderingWindow;
  /** Null while loading. */
  posted: boolean | null;
  /** True while there are unsaved changes, which belong to this day. */
  locked: boolean;
  onChange: (offset: number) => void;
};

/** The day being edited, with arrows to the days before and after. */
function DaySwitcher({ date, window, posted, locked, onChange }: DaySwitcherProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();
  const day = toIsoDate(date);
  const tomorrow = toIsoDate(window.deliveryDate);
  const orderDay = toIsoDate(window.orderDate);

  // Whether customers can order this lunchbox right now. Earlier days are already
  // being cooked, so the editor starts at tomorrow.
  let ordering: string | null = null;
  if (day === orderDay) ordering = t('admin.lunchbox.orderingOpen');
  else if (day < orderDay) ordering = t('admin.lunchbox.orderingClosed');

  return (
    <View style={styles.daySwitcher}>
      <View style={styles.dayRow}>
        <IconButton
          symbol="‹"
          onPress={() => onChange(-1)}
          disabled={locked || day <= tomorrow}
          accessibilityLabel={t('admin.lunchbox.previousDay')}
        />
        <View style={styles.dayText}>
          <ThemedText type="smallBold">
            {day === tomorrow
              ? t('admin.lunchbox.tomorrow', { date: formatCalendarDate(date, language) })
              : formatCalendarDate(date, language)}
          </ThemedText>
          {ordering && (
            <ThemedText type="small" themeColor="textSecondary">
              {ordering}
            </ThemedText>
          )}
        </View>
        <IconButton
          symbol="›"
          onPress={() => onChange(1)}
          disabled={locked}
          accessibilityLabel={t('admin.lunchbox.nextDay')}
        />
      </View>
      {posted !== null && (
        <ThemedView type="backgroundSelected" style={styles.status}>
          <ThemedText type="smallBold" style={{ color: posted ? theme.tint : theme.textSecondary }}>
            {posted ? t('admin.lunchbox.posted') : t('admin.lunchbox.notPosted')}
          </ThemedText>
        </ThemedView>
      )}
      {locked && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
          {t('admin.lunchbox.unsaved')}
        </ThemedText>
      )}
    </View>
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
  daySwitcher: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.three,
  },
  dayText: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.half,
  },
  status: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
  },
  section: {
    gap: Spacing.two,
  },
  saveBar: {
    gap: Spacing.two,
  },
  saveButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  note: {
    textAlign: 'center',
  },
  alignStart: {
    alignSelf: 'flex-start',
  },
  loading: {
    marginTop: Spacing.five,
  },
});

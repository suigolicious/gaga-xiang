import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Button } from '@/components/button';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { SlideToConfirm } from '@/components/slide-to-confirm';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { Dish } from '@/data/lunchbox';
import { useDeleteDish, useUpcomingDishUses } from '@/data/lunchbox-editor';
import { useLanguage } from '@/i18n/language-provider';
import { formatCalendarDate } from '@/lib/format';
import type { CalendarDate } from '@/lib/ordering-window';

type DishSheetProps = {
  /** The dish to show, or null when closed. */
  dish: Dish | null;
  /** Today in the business's time zone: lunchboxes from today on block deleting. */
  today: CalendarDate;
  onClose: () => void;
};

/** A library dish's details, with deleting it behind two confirmations. */
export function DishSheet({ dish, today, onClose }: DishSheetProps) {
  const { t } = useTranslation();
  return (
    // `onRequestClose` handles Android's back button.
    <Modal visible={dish !== null} transparent animationType="fade" onRequestClose={onClose}>
      {/* A modal opens outside the app's root view, so gestures inside it (the delete
          slider) need a root view of their own. */}
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} aria-label={t('admin.lunchbox.close')}>
          {dish && (
            // Swallows taps so pressing the card itself doesn't close it.
            <Pressable onPress={() => {}} style={styles.cardPressable}>
              {/* Keyed so each dish starts back at its details. */}
              <DishSheetCard key={dish.id} dish={dish} today={today} onClose={onClose} />
            </Pressable>
          )}
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

type Step = 'details' | 'confirm' | 'slide';

function DishSheetCard({ dish, today, onClose }: { dish: Dish; today: CalendarDate; onClose: () => void }) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [step, setStep] = useState<Step>('details');
  const uses = useUpcomingDishUses(dish.id, today);
  const deleteDish = useDeleteDish();

  const dates = (uses.data ?? [])
    .map((date) => formatCalendarDate(date, language))
    .join(t('admin.lunchbox.dateSeparator'));
  const inUse = (uses.data?.length ?? 0) > 0;

  let content;
  if (step === 'details') {
    content = (
      <>
        <DishPhoto dish={dish} style={styles.photo} />
        <ThemedText type="smallBold">{dish.name}</ThemedText>
        {dish.description[language] !== '' && (
          <ThemedText themeColor="textSecondary">{dish.description[language]}</ThemedText>
        )}
        {uses.isPending ? (
          <ActivityIndicator style={styles.usesLoading} />
        ) : uses.isError ? (
          <ThemedText type="small" themeColor="tint">
            {t('admin.lunchbox.usesError')}
          </ThemedText>
        ) : (
          inUse && (
            <ThemedText type="small" themeColor="textSecondary">
              {t('admin.lunchbox.inUse', { dates })}
            </ThemedText>
          )
        )}
        <View style={styles.actions}>
          <Button
            label={t('admin.lunchbox.deleteDish')}
            onPress={() => setStep('confirm')}
            disabled={!uses.isSuccess || inUse}
          />
          <Button label={t('admin.lunchbox.close')} onPress={onClose} />
        </View>
      </>
    );
  } else if (step === 'confirm') {
    content = (
      <>
        <ThemedText type="smallBold">{t('admin.lunchbox.confirmTitle', { name: dish.name })}</ThemedText>
        <ThemedText themeColor="textSecondary">{t('admin.lunchbox.confirmBody')}</ThemedText>
        <View style={styles.actions}>
          <Button label={t('admin.lunchbox.cancel')} onPress={() => setStep('details')} />
          <Button
            variant="primary"
            label={t('admin.lunchbox.confirmYes')}
            onPress={() => setStep('slide')}
          />
        </View>
      </>
    );
  } else {
    // The server refuses if the dish went into an upcoming lunchbox meanwhile.
    const refusedInUse = deleteDish.error && 'code' in deleteDish.error && deleteDish.error.code === '23503';
    content = (
      <>
        <ThemedText type="smallBold">{t('admin.lunchbox.slideTitle', { name: dish.name })}</ThemedText>
        <SlideToConfirm
          label={deleteDish.isPending ? t('admin.lunchbox.deleting') : t('admin.lunchbox.slideToDelete')}
          onConfirm={() => deleteDish.mutate(dish.id, { onSuccess: onClose })}
          disabled={deleteDish.isPending}
        />
        {deleteDish.isError && (
          <ThemedText type="small" themeColor="tint">
            {refusedInUse ? t('admin.lunchbox.deleteInUse') : t('admin.lunchbox.deleteError')}
          </ThemedText>
        )}
        <View style={styles.actions}>
          <Button
            label={t('admin.lunchbox.cancel')}
            onPress={() => {
              deleteDish.reset();
              setStep('details');
            }}
            disabled={deleteDish.isPending}
          />
        </View>
      </>
    );
  }

  return (
    <ThemedView style={styles.card}>
      <ScrollView contentContainerStyle={styles.cardContent}>{content}</ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cardPressable: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '100%',
    cursor: 'auto',
  },
  card: {
    borderRadius: Radius.large,
    overflow: 'hidden',
  },
  cardContent: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  photo: {
    width: '100%',
  },
  usesLoading: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});

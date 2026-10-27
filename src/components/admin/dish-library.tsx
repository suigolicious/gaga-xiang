import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { DishPhoto } from '@/components/lunchbox/dish-photo';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { useCreateDish } from '@/data/lunchbox-editor';
import type { Dish } from '@/data/lunchbox';
import { useTheme } from '@/hooks/use-theme';

type DishLibraryProps = {
  dishes: Dish[];
  /** Dishes already in the lunchbox, left out of the list. */
  excludedIds: string[];
  onAdd: (dish: Dish) => void;
};

/** Search the dish library and add dishes to the lunchbox, or create a new dish. */
export function DishLibrary({ dishes, excludedIds, onAdd }: DishLibraryProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);

  const term = search.trim().toLowerCase();
  const available = dishes.filter(
    (dish) => !excludedIds.includes(dish.id) && dish.name.toLowerCase().includes(term),
  );

  let emptyMessage = t('admin.lunchbox.allAdded');
  if (dishes.length === 0) emptyMessage = t('admin.lunchbox.libraryEmpty');
  else if (term) emptyMessage = t('admin.lunchbox.noMatches');

  return (
    <View style={styles.container}>
      {dishes.length > 0 && (
        <TextField
          label={t('admin.lunchbox.search')}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      )}
      {available.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {emptyMessage}
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {available.map((dish) => (
            <ThemedView key={dish.id} type="backgroundElement" style={styles.row}>
              <DishPhoto dish={dish} style={styles.photo} />
              <ThemedText type="small" style={styles.name}>
                {dish.name}
              </ThemedText>
              <Button
                label={t('admin.lunchbox.add')}
                accessibilityLabel={t('admin.lunchbox.addDish', { name: dish.name })}
                onPress={() => onAdd(dish)}
              />
            </ThemedView>
          ))}
        </View>
      )}
      {creating ? (
        <NewDishForm
          // A search that found nothing is usually the new dish's name.
          initialName={search.trim()}
          onCreated={(dish) => {
            onAdd(dish);
            setCreating(false);
            setSearch('');
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <Button
          label={t('admin.lunchbox.newDish')}
          onPress={() => setCreating(true)}
          style={styles.newDishButton}
        />
      )}
    </View>
  );
}

type NewDishFormProps = {
  initialName: string;
  onCreated: (dish: Dish) => void;
  onCancel: () => void;
};

function NewDishForm({ initialName, onCreated, onCancel }: NewDishFormProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const createDish = useCreateDish();
  const [name, setName] = useState(initialName);
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');

  const submit = () =>
    createDish.mutate(
      { name, description: { en: descriptionEn, 'zh-Hans': descriptionZh } },
      { onSuccess: onCreated },
    );

  return (
    // On the page background, with a border: the fields inside are `backgroundElement`.
    <ThemedView style={[styles.form, { borderColor: theme.border }]}>
      <ThemedText type="smallBold">{t('admin.lunchbox.newDish')}</ThemedText>
      <TextField
        label={t('admin.lunchbox.dishName')}
        placeholder={t('admin.lunchbox.dishNamePlaceholder')}
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <TextField
        label={t('admin.lunchbox.descriptionEn')}
        value={descriptionEn}
        onChangeText={setDescriptionEn}
        multiline
        style={styles.multiline}
      />
      <TextField
        label={t('admin.lunchbox.descriptionZh')}
        value={descriptionZh}
        onChangeText={setDescriptionZh}
        multiline
        style={styles.multiline}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {t('admin.lunchbox.photoLater')}
      </ThemedText>
      {createDish.isError && (
        <ThemedText type="small" themeColor="tint">
          {t('admin.lunchbox.createError')}
        </ThemedText>
      )}
      <View style={styles.formActions}>
        <Button label={t('admin.lunchbox.cancel')} onPress={onCancel} />
        <Button
          variant="primary"
          label={createDish.isPending ? t('admin.lunchbox.creating') : t('admin.lunchbox.create')}
          onPress={submit}
          disabled={!name.trim() || createDish.isPending}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radius.medium,
  },
  photo: {
    width: 44,
  },
  name: {
    flex: 1,
  },
  newDishButton: {
    alignSelf: 'flex-start',
  },
  form: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
  },
  multiline: {
    paddingVertical: Spacing.two,
    // Android centers multiline text vertically unless told otherwise.
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});

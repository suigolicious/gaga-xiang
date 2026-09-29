import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import type { PickupLocation } from '@/data/lunchbox';
import { useTheme } from '@/hooks/use-theme';
import { useLanguage } from '@/i18n/language-provider';

type PickupLocationPickerProps = {
  locations: PickupLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/** Radio buttons for where to pick up the order, each showing the location's address. */
export function PickupLocationPicker({ locations, selectedId, onSelect }: PickupLocationPickerProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const theme = useTheme();

  return (
    <View style={styles.group} role="radiogroup" aria-label={t('lunchbox.location')}>
      {locations.map((location) => {
        const selected = location.id === selectedId;
        return (
          <Pressable
            key={location.id}
            onPress={() => onSelect(location.id)}
            role="radio"
            aria-checked={selected}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView
              type="backgroundElement"
              style={[styles.option, { borderColor: selected ? theme.tint : 'transparent' }]}>
              <View style={[styles.radio, { borderColor: selected ? theme.tint : theme.border }]}>
                {selected && <View style={[styles.radioDot, { backgroundColor: theme.tint }]} />}
              </View>
              <View style={styles.text}>
                <ThemedText type="smallBold">{location.name[language]}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {location.address}
                </ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        );
      })}
    </View>
  );
}

const RADIO_SIZE = 22;

const styles = StyleSheet.create({
  group: {
    gap: Spacing.two,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 2,
  },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: RADIO_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: RADIO_SIZE / 2,
    height: RADIO_SIZE / 2,
    borderRadius: RADIO_SIZE / 4,
  },
  text: {
    flex: 1,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.8,
  },
});

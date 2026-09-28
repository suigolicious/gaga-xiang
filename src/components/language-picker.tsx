import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { LanguageNames, Languages } from '@/i18n';
import { useLanguagePreference, type LanguagePreference } from '@/i18n/language-provider';

/** Segmented control: follow the phone's language, or pick one explicitly. */
export function LanguagePicker() {
  const { t } = useTranslation();
  const { preference, setPreference } = useLanguagePreference();

  const options: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('language.system') },
    ...Languages.map((language) => ({ value: language, label: LanguageNames[language] })),
  ];

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('language.label')}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.segments} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              style={styles.segmentPressable}>
              <ThemedView
                type={selected ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.segment}>
                <ThemedText
                  type={selected ? 'smallBold' : 'small'}
                  themeColor={selected ? 'text' : 'textSecondary'}>
                  {option.label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  segments: {
    flexDirection: 'row',
    padding: Spacing.one,
    borderRadius: Radius.medium,
  },
  segmentPressable: {
    flex: 1,
  },
  segment: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.small,
  },
});

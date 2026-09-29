import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Spacing } from '@/constants/theme';
import { LanguageNames, Languages } from '@/i18n';
import { useLanguage } from '@/i18n/language-provider';

/**
 * Toggle between the app's languages. The one the app is currently shown in is
 * selected — the phone's language until the user picks one.
 */
export function LanguagePicker() {
  const { t } = useTranslation();
  const { language: current, setLanguage } = useLanguage();

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('language.label')}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.segments} role="radiogroup">
        {Languages.map((language) => {
          const selected = language === current;
          return (
            <Pressable
              key={language}
              onPress={() => setLanguage(language)}
              role="radio"
              aria-checked={selected}
              style={styles.segmentPressable}>
              <ThemedView
                type={selected ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.segment}>
                <ThemedText
                  type={selected ? 'smallBold' : 'small'}
                  themeColor={selected ? 'text' : 'textSecondary'}>
                  {LanguageNames[language]}
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

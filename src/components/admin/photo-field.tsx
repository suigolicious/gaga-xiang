import { Image } from 'expo-image';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { toDishPhoto } from '@/lib/dish-photo';

type PhotoFieldProps = {
  /** Local URI of the prepared photo, or null for none. */
  uri: string | null;
  onChange: (uri: string | null) => void;
  disabled?: boolean;
};

/**
 * Pick a dish photo from the photo library. It's cropped square and shrunk right
 * away, so the preview shows exactly what will be uploaded.
 */
export function PhotoField({ uri, onChange, disabled }: PhotoFieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [preparing, setPreparing] = useState(false);
  const [failed, setFailed] = useState(false);

  const pick = async () => {
    // Opens the system photo picker, which needs no permission prompt. On iOS and
    // Android it lets the user crop to a square first; on web we crop the center.
    const result = await launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled) return;
    setPreparing(true);
    setFailed(false);
    try {
      onChange(await toDishPhoto(result.assets[0].uri));
    } catch {
      setFailed(true);
    } finally {
      setPreparing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {t('admin.lunchbox.photo')}
      </ThemedText>
      <View style={styles.row}>
        <View style={[styles.preview, { backgroundColor: theme.backgroundElement }]}>
          {preparing ? (
            <ActivityIndicator />
          ) : (
            uri && (
              <Image
                source={uri}
                style={styles.image}
                contentFit="cover"
                accessibilityLabel={t('admin.lunchbox.photoPreview')}
              />
            )
          )}
        </View>
        <View style={styles.actions}>
          <Button
            label={uri ? t('admin.lunchbox.changePhoto') : t('admin.lunchbox.addPhoto')}
            onPress={pick}
            disabled={disabled || preparing}
          />
          {uri && (
            <Button
              label={t('admin.lunchbox.removePhoto')}
              onPress={() => onChange(null)}
              disabled={disabled || preparing}
            />
          )}
        </View>
      </View>
      {failed && (
        <ThemedText type="small" themeColor="tint">
          {t('admin.lunchbox.photoError')}
        </ThemedText>
      )}
    </View>
  );
}

const PREVIEW_SIZE = 96;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  preview: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: Radius.medium,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flex: 1,
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
});

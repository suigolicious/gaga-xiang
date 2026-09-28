import { Link, type LinkProps } from 'expo-router';
import { Pressable, StyleSheet, type StyleProp, type TextStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';

type TextLinkProps = Omit<LinkProps, 'asChild' | 'children' | 'style'> & {
  children: string;
  style?: StyleProp<TextStyle>;
};

/**
 * A tappable text link. Wraps the text in a Pressable instead of letting Link
 * render a pressable Text, which iOS shades with a gray box while held down.
 */
export function TextLink({ children, style, ...linkProps }: TextLinkProps) {
  return (
    <Link {...linkProps} asChild>
      <Pressable style={({ pressed }) => pressed && styles.pressed}>
        <ThemedText type="linkPrimary" style={style}>
          {children}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
});

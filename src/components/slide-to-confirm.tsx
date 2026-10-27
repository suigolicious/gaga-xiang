import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SlideToConfirmProps = {
  /** Shown in the track, e.g. "Slide to delete". */
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
};

const THUMB_SIZE = 52;
const PADDING = Spacing.one;
/** How far along the thumb has to be when let go, as a share of the track. */
const CONFIRM_AT = 0.95;

/**
 * A thumb that has to be dragged all the way across to confirm, for actions that
 * can't be undone. Letting go early springs it back, so a stray tap or swipe does
 * nothing. Screen readers get an "activate" action instead, since they can't drag.
 */
export function SlideToConfirm({ label, onConfirm, disabled }: SlideToConfirmProps) {
  const theme = useTheme();
  // How far the thumb can travel; known once the track has been laid out.
  const [travel, setTravel] = useState(0);
  const offset = useSharedValue(0);
  const dragStart = useSharedValue(0);

  const pan = usePanGesture({
    enabled: !disabled && travel > 0,
    activeCursor: 'grabbing',
    onActivate: () => {
      'worklet';
      dragStart.set(offset.get());
    },
    onUpdate: (event) => {
      'worklet';
      offset.set(clamp(dragStart.get() + event.translationX, 0, travel));
    },
    onFinalize: () => {
      'worklet';
      if (offset.get() >= travel * CONFIRM_AT) {
        offset.set(withSpring(travel, { duration: 150 }));
        scheduleOnRN(onConfirm);
      } else {
        offset.set(withSpring(0, { duration: 300 }));
      }
    },
  });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.get() }],
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: offset.get() + THUMB_SIZE,
  }));
  // The label fades as the thumb covers it.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: travel > 0 ? interpolate(offset.get(), [0, travel * 0.6], [1, 0], 'clamp') : 1,
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: theme.backgroundSelected }, disabled && styles.disabled]}
      onLayout={(event) => setTravel(event.nativeEvent.layout.width - THUMB_SIZE - PADDING * 2)}
      accessible
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      accessibilityActions={[{ name: 'activate', label }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate' && !disabled) onConfirm();
      }}>
      <Animated.View style={[styles.fill, { backgroundColor: theme.primary }, fillStyle]} />
      <Animated.View style={[styles.labelContainer, labelStyle]} pointerEvents="none">
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      </Animated.View>
      {/* `touchAction` stops the browser from scrolling the page while sliding on web. */}
      <GestureDetector gesture={pan} touchAction="none">
        <Animated.View style={[styles.thumb, { backgroundColor: theme.primary }, thumbStyle]}>
          <ThemedText style={[styles.arrow, { color: theme.onPrimary }]}>→</ThemedText>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE + PADDING * 2,
    padding: PADDING,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: PADDING,
    top: PADDING,
    bottom: PADDING,
    borderRadius: Radius.pill,
    opacity: 0.35,
  },
  labelContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: THUMB_SIZE,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 700,
  },
  disabled: {
    opacity: 0.5,
  },
});

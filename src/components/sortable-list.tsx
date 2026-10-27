import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Each key's index in the list, e.g. { a: 0, b: 1 }. */
type Positions = Record<string, number>;

function positionsOf(keys: string[]): Positions {
  return Object.fromEntries(keys.map((key, index) => [key, index]));
}

/** Moves `key` to index `to`, shifting the rows in between by one. */
function moveTo(positions: Positions, key: string, to: number): Positions {
  'worklet';
  const from = positions[key];
  const next: Positions = {};
  for (const other in positions) {
    const index = positions[other];
    if (other === key) next[other] = to;
    else if (from < to && index > from && index <= to) next[other] = index - 1;
    else if (from > to && index >= to && index < from) next[other] = index + 1;
    else next[other] = index;
  }
  return next;
}

type SortableListProps<T> = {
  items: T[];
  keyOf: (item: T) => string;
  /**
   * Every row is this tall. Rows are placed by index while dragging, so they can't
   * size themselves to their content.
   */
  rowHeight: number;
  /** Everything in the row after its drag handle. */
  renderItem: (item: T) => ReactNode;
  onReorder: (items: T[]) => void;
  labels: {
    /** e.g. "Reorder Garlic Lettuce" */
    handle: (item: T) => string;
    moveUp: (item: T) => string;
    moveDown: (item: T) => string;
  };
};

const GAP = Spacing.two;

/**
 * A list reordered by dragging each row's handle. The rows are positioned absolutely
 * and moved on the UI thread with Reanimated, so dragging stays smooth; the new order
 * is reported once the row is dropped. Screen readers get "move up" and "move down"
 * actions on the handle instead, since they can't drag.
 */
export function SortableList<T>({
  items,
  keyOf,
  rowHeight,
  renderItem,
  onReorder,
  labels,
}: SortableListProps<T>) {
  const keys = items.map(keyOf);
  const order = keys.join('\n');
  const positions = useSharedValue(positionsOf(keys));

  // Follow changes from outside, like a dish added or a draft discarded.
  useEffect(() => {
    positions.set(positionsOf(order ? order.split('\n') : []));
  }, [order, positions]);

  const reorder = (orderedKeys: string[]) => {
    const byKey = new Map(items.map((item) => [keyOf(item), item]));
    const next = orderedKeys.map((key) => byKey.get(key)!);
    if (orderedKeys.join('\n') !== order) onReorder(next);
  };

  const slot = rowHeight + GAP;

  return (
    <View style={{ height: Math.max(0, items.length * slot - GAP) }}>
      {items.map((item, index) => {
        const key = keyOf(item);
        return (
          <SortableRow
            key={key}
            id={key}
            index={index}
            count={items.length}
            positions={positions}
            rowHeight={rowHeight}
            slot={slot}
            onDrop={reorder}
            onMove={(offset) => {
              const next = [...keys];
              next.splice(index, 1);
              next.splice(index + offset, 0, key);
              reorder(next);
            }}
            handleLabel={labels.handle(item)}
            moveUpLabel={labels.moveUp(item)}
            moveDownLabel={labels.moveDown(item)}>
            {renderItem(item)}
          </SortableRow>
        );
      })}
    </View>
  );
}

type SortableRowProps = {
  id: string;
  /** Where the row is in `items`, as of the last drop. */
  index: number;
  count: number;
  positions: SharedValue<Positions>;
  rowHeight: number;
  slot: number;
  onDrop: (orderedKeys: string[]) => void;
  /** For screen readers: -1 moves the row up one, 1 down one. */
  onMove: (offset: -1 | 1) => void;
  handleLabel: string;
  moveUpLabel: string;
  moveDownLabel: string;
  children: ReactNode;
};

function SortableRow({
  id,
  index,
  count,
  positions,
  rowHeight,
  slot,
  onDrop,
  onMove,
  handleLabel,
  moveUpLabel,
  moveDownLabel,
  children,
}: SortableRowProps) {
  const theme = useTheme();
  const top = useSharedValue(index * slot);
  const dragging = useSharedValue(false);
  const dragStart = useSharedValue(0);

  // Slide into place when another row is dragged past this one.
  useAnimatedReaction(
    () => positions.get()[id],
    (position, previous) => {
      if (position !== undefined && position !== previous && !dragging.get()) {
        top.set(withTiming(position * slot, { duration: 150 }));
      }
    },
  );

  // Gesture callbacks run on the UI thread as worklets, alongside the animation.
  const pan = usePanGesture({
    activeCursor: 'grabbing',
    onActivate: () => {
      'worklet';
      dragging.set(true);
      dragStart.set(top.get());
    },
    onUpdate: (event) => {
      'worklet';
      top.set(clamp(dragStart.get() + event.translationY, 0, (count - 1) * slot));
      const to = clamp(Math.round(top.get() / slot), 0, count - 1);
      if (to !== positions.get()[id]) positions.set(moveTo(positions.get(), id, to));
    },
    onFinalize: () => {
      'worklet';
      if (!dragging.get()) return;
      dragging.set(false);
      top.set(withSpring(positions.get()[id] * slot, { duration: 250 }));
      const current = positions.get();
      scheduleOnRN(
        onDrop,
        Object.keys(current).sort((a, b) => current[a] - current[b]),
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: top.get() }, { scale: withTiming(dragging.get() ? 1.03 : 1) }],
    zIndex: dragging.get() ? 1 : 0,
    boxShadow: dragging.get() ? '0 6px 16px rgba(0, 0, 0, 0.25)' : 'none',
  }));

  return (
    <Animated.View
      style={[
        styles.row,
        { height: rowHeight, backgroundColor: theme.backgroundElement },
        animatedStyle,
      ]}>
      {/* A lone row has nowhere to move, so it gets no handle. `touchAction` stops the
          browser from scrolling the page while dragging on web. */}
      {count > 1 && (
        <GestureDetector gesture={pan} touchAction="none">
          <View
            style={styles.handle}
            accessible
            aria-label={handleLabel}
            accessibilityActions={[
              ...(index > 0 ? [{ name: 'moveUp', label: moveUpLabel }] : []),
              ...(index < count - 1 ? [{ name: 'moveDown', label: moveDownLabel }] : []),
            ]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'moveUp') onMove(-1);
              if (event.nativeEvent.actionName === 'moveDown') onMove(1);
            }}>
            <Grip color={theme.textSecondary} />
          </View>
        </GestureDetector>
      )}
      <View style={[styles.content, count < 2 && styles.contentWithoutHandle]}>{children}</View>
    </Animated.View>
  );
}

/** Two columns of three dots: the usual sign that something can be dragged. */
function Grip({ color }: { color: string }) {
  return (
    <View style={styles.grip}>
      {Array.from({ length: 6 }, (_, dot) => (
        <View key={dot} style={[styles.dot, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const DOT_SIZE = 4;

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.medium,
  },
  handle: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  grip: {
    width: DOT_SIZE * 2 + Spacing.one,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingRight: Spacing.two,
  },
  contentWithoutHandle: {
    paddingLeft: Spacing.two,
  },
});

import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import {
  Colors,
  SpringConfig,
  BorderRadius,
  GlossGradient,
} from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const HORIZONTAL_MARGIN = 20;
const PILL_WIDTH = SCREEN_W - HORIZONTAL_MARGIN * 2;

export const FLOATING_TAB_BAR_HEIGHT = 72;

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  home:     { active: 'home',              inactive: 'home-outline' },
  browse:   { active: 'search',            inactive: 'search-outline' },
  sessions: { active: 'calendar',          inactive: 'calendar-outline' },
  schedule: { active: 'calendar',          inactive: 'calendar-outline' },
  requests: { active: 'notifications',     inactive: 'notifications-outline' },
  profile:  { active: 'person',            inactive: 'person-outline' },
};

interface AnimatedTabBarProps extends BottomTabBarProps {
  badges?: Record<string, number>;
}

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 1)).current;
  const icons = TAB_ICONS[routeName] ?? TAB_ICONS.home;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.12 : 1,
      ...SpringConfig.tab,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={22}
        color={focused ? Colors.ink : Colors.body}
      />
    </Animated.View>
  );
}

export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  badges = {},
}: AnimatedTabBarProps) {
  const insets = useSafeAreaInsets();
  const tabCount = state.routes.length;
  const tabWidth = PILL_WIDTH / tabCount;
  const indicatorX = useRef(new Animated.Value(state.index * tabWidth)).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: state.index * tabWidth,
      ...SpringConfig.tab,
    }).start();
  }, [state.index, tabWidth, indicatorX]);

  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.outer, { paddingBottom: bottomPad }]}>
      <View style={styles.pill}>
        <LinearGradient
          colors={[...GlossGradient.card]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View
          style={[
            styles.activePill,
            {
              width: tabWidth - 8,
              transform: [{ translateX: Animated.add(indicatorX, 4) }],
            },
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title ?? route.name;
          const focused = state.index === index;
          const badge = badges[route.name] ?? 0;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab}>
              <View style={styles.tabInner}>
                <TabIcon routeName={route.name} focused={focused} />
                {badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: HORIZONTAL_MARGIN,
    backgroundColor: Colors.background,
  },
  pill: {
    flexDirection: 'row',
    height: FLOATING_TAB_BAR_HEIGHT,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  },
  activePill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
  },
  tabInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.white,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.body,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: Colors.ink,
    fontWeight: '700',
  },
});

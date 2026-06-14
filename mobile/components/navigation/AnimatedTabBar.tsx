import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';
import {
  Colors,
  SpringConfig,
} from '../../constants/theme';

export const FLOATING_TAB_BAR_HEIGHT = 56;

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
      toValue: focused ? 1.08 : 1,
      ...SpringConfig.tab,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
      <Ionicons
        name={focused ? icons.active : icons.inactive}
        size={24}
        color={focused ? Colors.primary : Colors.muted}
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
  const bottomPad = Math.max(insets.bottom, 4);

  return (
    <View style={[styles.outer, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
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
              {focused && <View style={styles.activeIndicator} />}
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
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#3C4043',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  bar: {
    flexDirection: 'row',
    height: FLOATING_TAB_BAR_HEIGHT,
    alignItems: 'stretch',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingTop: 6,
    position: 'relative',
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
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.statusRed,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.white,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.1,
  },
  labelActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

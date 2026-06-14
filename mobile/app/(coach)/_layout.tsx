import { Tabs } from 'expo-router';
import AnimatedTabBar, { FLOATING_TAB_BAR_HEIGHT } from '../../components/navigation/AnimatedTabBar';
import { Colors } from '../../constants/theme';
import { useCoachPendingCount } from '../../hooks/usePendingCounts';
import { useCoachRoleGuard } from '../../hooks/useRoleGuard';

const TAB_BAR_PAD = FLOATING_TAB_BAR_HEIGHT + 24;

export default function CoachLayout() {
  useCoachRoleGuard();
  const pendingCount = useCoachPendingCount();

  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          badges={{ requests: pendingCount }}
        />
      )}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: TAB_BAR_PAD,
        },
        sceneStyle: {
          paddingBottom: TAB_BAR_PAD,
          backgroundColor: Colors.background,
          overflow: 'hidden',
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule' }} />
      <Tabs.Screen name="requests" options={{ title: 'Requests' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

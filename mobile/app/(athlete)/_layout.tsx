import { Tabs } from 'expo-router';
import AnimatedTabBar, { FLOATING_TAB_BAR_HEIGHT } from '../../components/navigation/AnimatedTabBar';
import { Colors } from '../../constants/theme';
import { useAthletePendingCount } from '../../hooks/usePendingCounts';
import { useAthleteRoleGuard } from '../../hooks/useRoleGuard';

const TAB_BAR_PAD = FLOATING_TAB_BAR_HEIGHT + 24;

export default function AthleteLayout() {
  useAthleteRoleGuard();
  const pendingCount = useAthletePendingCount();

  return (
    <Tabs
      tabBar={(props) => (
        <AnimatedTabBar
          {...props}
          badges={{ sessions: pendingCount }}
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
      <Tabs.Screen name="browse" options={{ title: 'Browse' }} />
      <Tabs.Screen name="sessions" options={{ title: 'Sessions' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GlossGradient } from '../../constants/theme';

interface AppCanvasProps {
  children: React.ReactNode;
  style?: ViewStyle;
  /** Colored header zone like Google Health sheet motif */
  headerTint?: 'blue' | 'teal' | 'purple' | 'none';
}

const HEADER_COLORS = {
  blue: ['#E8F0FE', '#F8F9FA', '#F8F9FA'] as const,
  teal: ['#E0F2F1', '#F8F9FA', '#F8F9FA'] as const,
  purple: ['#F3E8FD', '#F8F9FA', '#F8F9FA'] as const,
  none: [...GlossGradient.ambient] as const,
};

export default function AppCanvas({ children, style, headerTint = 'blue' }: AppCanvasProps) {
  return (
    <View style={[styles.canvas, style]}>
      <LinearGradient
        colors={[...HEADER_COLORS[headerTint]]}
        locations={[0, 0.35, 0.7]}
        style={styles.headerZone}
        pointerEvents="none"
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerZone: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
    width: '100%',
    overflow: 'hidden',
  },
});

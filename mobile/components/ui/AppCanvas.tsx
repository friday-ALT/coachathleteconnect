import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, GlossGradient } from '../../constants/theme';

interface AppCanvasProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function AppCanvas({ children, style }: AppCanvasProps) {
  return (
    <View style={[styles.canvas, style]}>
      <LinearGradient
        colors={[...GlossGradient.ambient]}
        locations={[0, 0.4, 0.85]}
        style={styles.ambient}
        pointerEvents="none"
      />
      <View style={styles.glowGreen} pointerEvents="none" />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  ambient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 360,
    zIndex: 0,
  },
  glowGreen: {
    position: 'absolute',
    top: -40,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(34, 197, 94, 0.14)',
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

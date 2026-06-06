import { View, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, GlossGradient } from '../../constants/theme';

interface GlossCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean;
  padding?: number;
}

/** Revolut-style glossy elevated card */
export default function GlossCard({ children, style, accent = false, padding = 16 }: GlossCardProps) {
  return (
    <View style={[styles.wrap, accent && styles.wrapAccent, style]}>
      <LinearGradient
        colors={[...GlossGradient.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[...GlossGradient.cardShine]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.shine}
        pointerEvents="none"
      />
      <View style={[styles.inner, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  wrapAccent: {
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '55%',
    height: '100%',
    opacity: 0.7,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
  },
});

import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow } from '../../constants/theme';

interface GlossCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accent?: boolean;
  padding?: number;
  /** @deprecated Health UI uses flat cards; ignored */
  glossy?: boolean;
}

export default function GlossCard({
  children,
  style,
  accent = false,
  padding = 16,
}: GlossCardProps) {
  return (
    <View style={[styles.wrap, accent && styles.wrapAccent, Shadow.sm, style]}>
      <View style={[styles.inner, { padding }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  wrapAccent: {
    borderColor: 'rgba(26, 115, 232, 0.3)',
    backgroundColor: Colors.primaryLight,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
  },
});

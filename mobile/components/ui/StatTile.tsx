import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSizes, GlossGradient } from '../../constants/theme';

interface StatTileProps {
  value: string | number;
  label: string;
  color?: string;
}

export default function StatTile({ value, label, color = Colors.ink }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <LinearGradient
        colors={[...GlossGradient.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Text style={[styles.value, { color }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
  },
  value: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    letterSpacing: -0.8,
    marginBottom: 4,
    zIndex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.body,
    zIndex: 1,
  },
});

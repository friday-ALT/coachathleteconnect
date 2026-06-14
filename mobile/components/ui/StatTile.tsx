import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, FontSizes, GlossGradient } from '../../constants/theme';

interface StatTileProps {
  value: string | number;
  label: string;
  color?: string;
  glossy?: boolean;
}

export default function StatTile({ value, label, color = Colors.ink, glossy = false }: StatTileProps) {
  return (
    <View style={styles.tile}>
      {glossy && (
        <>
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
        </>
      )}
      <Text style={[styles.value, { color }]} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: BorderRadius.md,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  value: {
    fontSize: FontSizes['2xl'],
    fontWeight: '500',
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
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '55%',
    height: '100%',
    opacity: 0.7,
  },
});

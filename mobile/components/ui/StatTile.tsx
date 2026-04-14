import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSizes, Shadow } from '../../constants/theme';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  color?: string;
}

export default function StatTile({ icon, value, label, color = Colors.primary }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.value} numberOfLines={1}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    ...Shadow.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: FontSizes.lg,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 2,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '500',
    color: Colors.muted,
    textAlign: 'center',
  },
});

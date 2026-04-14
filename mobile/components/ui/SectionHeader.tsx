import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';

interface SectionHeaderProps {
  label: string;
  color?: string;
  count?: number;
}

export default function SectionHeader({ label, color = Colors.muted, count }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.bar, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>
        {label}{count !== undefined ? ` (${count})` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  bar: {
    width: 3,
    height: 14,
    borderRadius: 2,
    marginRight: 8,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

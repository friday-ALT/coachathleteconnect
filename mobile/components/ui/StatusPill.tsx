import { View, Text, StyleSheet } from 'react-native';
import { BorderRadius, FontSizes } from '../../constants/theme';

interface StatusPillProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

export default function StatusPill({ label, color, size = 'md' }: StatusPillProps) {
  const bg = `${color}20`;
  return (
    <View style={[styles.pill, { backgroundColor: bg }, size === 'sm' && styles.pillSm]}>
      <Text style={[styles.label, { color }, size === 'sm' && styles.labelSm]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  pillSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  labelSm: {
    fontSize: FontSizes.xs,
  },
});

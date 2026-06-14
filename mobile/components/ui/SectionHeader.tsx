import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing } from '../../constants/theme';

interface SectionHeaderProps {
  label: string;
  color?: string;
  count?: number;
  linkLabel?: string;
  onPress?: () => void;
}

export default function SectionHeader({
  label,
  count,
  linkLabel = 'See all',
  onPress,
}: SectionHeaderProps) {
  const title =
    count !== undefined && count > 0 ? `${label} (${count})` : label;

  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {onPress && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.link}>
          <Text style={styles.linkText} numberOfLines={1}>{linkLabel}</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    marginTop: Spacing.xl,
    gap: Spacing.md,
    width: '100%',
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: FontSizes.lg,
    fontWeight: '500',
    letterSpacing: -0.2,
    color: Colors.ink,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
    maxWidth: '42%',
  },
  linkText: {
    fontSize: FontSizes.sm,
    color: Colors.accent,
    fontWeight: '600',
  },
});

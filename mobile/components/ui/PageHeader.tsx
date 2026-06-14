import { type ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';

interface PageHeaderProps {
  label?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ label, title, subtitle, actions }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.copy}>
        {label && <Text style={styles.label} numberOfLines={1}>{label}</Text>}
        {title && <Text style={styles.title} numberOfLines={2}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontWeight: '500',
    letterSpacing: -0.5,
    color: Colors.ink,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    fontSize: FontSizes.base,
    color: Colors.body,
    fontWeight: '400',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: 4,
    flexShrink: 0,
  },
});

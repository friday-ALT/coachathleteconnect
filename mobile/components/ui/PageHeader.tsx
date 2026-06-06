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
        {label && <Text style={styles.label}>{label}</Text>}
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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
  },
  copy: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 6,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
    letterSpacing: -1,
    color: Colors.ink,
    lineHeight: 40,
  },
  subtitle: {
    marginTop: 8,
    fontSize: FontSizes.base,
    color: Colors.body,
    fontWeight: '500',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: 8,
  },
});

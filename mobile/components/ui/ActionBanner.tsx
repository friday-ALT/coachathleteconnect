import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSizes, Spacing } from '../../constants/theme';
import PressableScale from './PressableScale';
import GlossCard from './GlossCard';

interface ActionBannerProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onPress?: () => void;
  glossy?: boolean;
}

export default function ActionBanner({
  title,
  description,
  actionLabel,
  onPress,
  glossy = false,
}: ActionBannerProps) {
  return (
    <PressableScale onPress={onPress} disabled={!onPress} scaleTo={0.98}>
      <GlossCard accent glossy={glossy} padding={0} style={styles.wrap}>
        <View style={styles.body}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.desc}>{description}</Text>}
          {actionLabel && onPress && (
            <Text style={styles.action}>{actionLabel} →</Text>
          )}
        </View>
      </GlossCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
  },
  body: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.2,
  },
  desc: {
    marginTop: 4,
    fontSize: FontSizes.sm,
    color: Colors.body,
    lineHeight: 20,
  },
  action: {
    marginTop: 10,
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.accent,
  },
});

import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes, Spacing } from '../../constants/theme';
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
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          {description && (
            <Text style={styles.desc} numberOfLines={3}>{description}</Text>
          )}
          {actionLabel && onPress && (
            <Text style={styles.action} numberOfLines={1}>{actionLabel} →</Text>
          )}
        </View>
      </GlossCard>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  body: {
    padding: Spacing.md,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.ink,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  desc: {
    marginTop: 6,
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

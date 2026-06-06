import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSizes } from '../../constants/theme';

interface MetricRingProps {
  value: string | number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

/** WHOOP-style hero metric ring */
export default function MetricRing({
  value,
  label,
  sublabel,
  color = Colors.primary,
  size = 200,
}: MetricRingProps) {
  const stroke = 7;
  const inner = size - stroke * 2 - 8;

  return (
    <View style={styles.wrap}>
      <View style={[styles.ringOuter, { width: size, height: size, borderRadius: size / 2 }]}>
        <View
          style={[
            styles.ringArc,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: stroke,
              borderColor: Colors.ringTrack,
              borderTopColor: color,
              borderRightColor: color,
            },
          ]}
        />
        <View
          style={[
            styles.ringInner,
            {
              width: inner,
              height: inner,
              borderRadius: inner / 2,
            },
          ]}
        >
          <Text style={[styles.value, { fontSize: size * 0.28 }]}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  ringOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringArc: {
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  value: {
    fontWeight: '300',
    color: Colors.ink,
    letterSpacing: -2,
    lineHeight: 52,
  },
  label: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: Colors.muted,
    marginTop: 2,
  },
  sublabel: {
    fontSize: FontSizes.xs,
    color: Colors.body,
    marginTop: 4,
    fontWeight: '500',
  },
});

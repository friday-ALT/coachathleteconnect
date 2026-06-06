import { type ViewStyle } from 'react-native';
import GlossCard from './GlossCard';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
  accent?: boolean;
  padding?: number;
}

export default function Card({ children, style, accent = false, padding = 16 }: CardProps) {
  return (
    <GlossCard style={style} accent={accent} padding={padding}>
      {children}
    </GlossCard>
  );
}

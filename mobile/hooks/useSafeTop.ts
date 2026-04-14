import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns a top padding value that accounts for the device's safe area inset.
 * Use this instead of hardcoded paddingTop values in screen headers.
 *
 * @param extra  Additional padding on top of the safe area (default 16)
 */
export function useSafeTop(extra = 16): number {
  const { top } = useSafeAreaInsets();
  return top + extra;
}

import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../lib/api';
import { SCREENSHOT_MODE } from '../constants/config';

export function useUnreadMessages() {
  const { data } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: messagesApi.getUnreadCount,
    refetchInterval: 15_000,
    enabled: !SCREENSHOT_MODE,
  });
  return data?.unread ?? 0;
}

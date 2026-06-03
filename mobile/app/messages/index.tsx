import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useSafeTop } from '../../hooks/useSafeTop';
import { timeAgo } from '../../utils/timeAgo';

export default function MessagesListScreen() {
  const router = useRouter();
  const safeTop = useSafeTop();
  const [search, setSearch] = useState('');

  const { data: convs = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.listConversations,
    refetchInterval: 10_000,
  });

  const filtered = (convs as any[]).filter(
    (c) => !search || c.otherUser?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={Colors.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor={Colors.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.muted} />
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySub}>
            Start a conversation from a coach&apos;s profile after you connect.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }: { item: any }) => {
            const hasUnread = item.unreadCount > 0;
            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() => router.push(`/messages/${item.id}`)}
                activeOpacity={0.7}
              >
                <Avatar name={item.otherUser?.name || '?'} uri={item.otherUser?.avatarUrl} size={48} />
                <View style={styles.rowBody}>
                  <View style={styles.rowTop}>
                    <Text style={[styles.rowName, hasUnread && styles.rowNameBold]}>
                      {item.otherUser?.name || 'Unknown'}
                    </Text>
                    {item.latestMessage && (
                      <Text style={styles.rowTime}>{timeAgo(item.latestMessage.createdAt)}</Text>
                    )}
                  </View>
                  <Text style={styles.rowPreview} numberOfLines={1}>
                    {item.latestMessage?.content || 'Start the conversation'}
                  </Text>
                </View>
                {hasUnread && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink },
  headerSpacer: { width: 40 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSizes.base, color: Colors.ink },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyTitle: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.ink, marginTop: Spacing.md },
  emptySub: { fontSize: FontSizes.sm, color: Colors.muted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  rowName: { fontSize: FontSizes.base, fontWeight: '500', color: Colors.ink },
  rowNameBold: { fontWeight: '800' },
  rowTime: { fontSize: FontSizes.xs, color: Colors.muted },
  rowPreview: { fontSize: FontSizes.sm, color: Colors.muted },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});

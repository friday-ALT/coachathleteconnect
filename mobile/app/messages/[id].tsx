import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../../components/ui/Avatar';
import { Colors, Spacing, BorderRadius, FontSizes } from '../../constants/theme';
import { useSafeTop } from '../../hooks/useSafeTop';
import { timeAgo } from '../../utils/timeAgo';

export default function MessageThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const safeTop = useSafeTop();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const { data: convs = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: messagesApi.listConversations,
  });
  const conv = (convs as any[]).find((c) => c.id === id);

  const { data: msgs = [], isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => messagesApi.getMessages(id!),
    enabled: !!id,
    refetchInterval: 5_000,
  });

  useEffect(() => {
    if ((msgs as any[]).length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [msgs]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => messagesApi.sendMessage(id!, content),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unread-messages'] });
    },
  });

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.ink} />
        </TouchableOpacity>
        {conv && (
          <View style={styles.headerUser}>
            <Avatar name={conv.otherUser?.name} uri={conv.otherUser?.avatarUrl} size={32} />
            <Text style={styles.headerName}>{conv.otherUser?.name}</Text>
          </View>
        )}
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <FlatList
          ref={listRef}
          data={msgs as any[]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => {
            const isMine = item.senderId === user?.id;
            return (
              <View style={[styles.bubbleWrap, isMine ? styles.bubbleWrapMine : styles.bubbleWrapTheirs]}>
                <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.content}</Text>
                  <Text style={[styles.bubbleTime, isMine && styles.bubbleTimeMine]}>{timeAgo(item.createdAt)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyThread}>
              <Text style={styles.emptyThreadText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={Colors.muted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sendMutation.isPending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primaryOn} />
          ) : (
            <Ionicons name="send" size={18} color={Colors.primaryOn} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, justifyContent: 'center' },
  headerName: { fontSize: FontSizes.base, fontWeight: '700', color: Colors.ink },
  headerSpacer: { width: 40 },
  messagesList: { padding: Spacing.lg, paddingBottom: Spacing.md },
  bubbleWrap: { marginBottom: Spacing.sm },
  bubbleWrapMine: { alignItems: 'flex-end' },
  bubbleWrapTheirs: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  bubbleMine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: Colors.surfaceSection, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: FontSizes.base, color: Colors.ink, lineHeight: 20 },
  bubbleTextMine: { color: Colors.primaryOn },
  bubbleTime: { fontSize: 10, color: Colors.muted, marginTop: 4 },
  bubbleTimeMine: { color: 'rgba(10,10,10,0.55)', textAlign: 'right' },
  emptyThread: { alignItems: 'center', paddingVertical: 48 },
  emptyThreadText: { fontSize: FontSizes.sm, color: Colors.muted },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSizes.base,
    color: Colors.ink,
    backgroundColor: Colors.background,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
});

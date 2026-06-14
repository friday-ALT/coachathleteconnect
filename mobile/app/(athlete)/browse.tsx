import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Layout, screenScrollStyle } from '../../constants/theme';
import { coachApi } from '../../lib/api';
import CoachAtlasCard from '../../components/CoachAtlasCard';
import AppCanvas from '../../components/ui/AppCanvas';
import PressableScale from '../../components/ui/PressableScale';
import { useSafeTop } from '../../hooks/useSafeTop';

const SKILL_LEVELS = ['', 'Beginner', 'Intermediate', 'Advanced'];

const SKILL_COLORS: Record<string, string> = {
  Beginner:     Colors.statusBlue,
  Intermediate: Colors.statusOrange,
  Advanced:     Colors.statusPurple,
};

export default function Browse() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const safeTop = useSafeTop();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ['coaches', debouncedQuery, skillLevel],
    queryFn: () => coachApi.searchCoaches({ q: debouncedQuery, skillLevel }),
  });

  const isSearching = searchQuery !== debouncedQuery;

  return (
    <AppCanvas>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: safeTop }]}>
        <Text style={styles.headerTitle}>Find Coaches</Text>
        <Text style={styles.headerSub} numberOfLines={2}>
          {isSearching || isLoading ? 'Searching...' : coaches ? `${coaches.length} coaches found` : 'Find your perfect coach'}
        </Text>
      </View>

      {/* Search + filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or location..."
            placeholderTextColor={Colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {SKILL_LEVELS.map((level) => {
            const isActive = skillLevel === level;
            const accent = level ? SKILL_COLORS[level] : Colors.accent;
            return (
              <PressableScale
                key={level || 'all'}
                scaleTo={0.96}
                onPress={() => setSkillLevel(level)}
                style={[
                  styles.filterPill,
                  isActive && {
                    backgroundColor: level ? `${accent}22` : Colors.accentLight,
                    borderColor: accent,
                  },
                ]}
              >
                <Text style={[styles.filterText, isActive && { color: accent, fontWeight: '700' }]}>
                  {level || 'All Levels'}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.scroll} contentContainerStyle={screenScrollStyle()} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loaderText}>Finding coaches...</Text>
          </View>
        ) : coaches?.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={Colors.muted} />
            <Text style={styles.emptyTitle}>No coaches found</Text>
            <Text style={styles.emptySub}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          coaches?.map((coach: any, index: number) => (
            <CoachAtlasCard
              key={coach.userId}
              coach={coach}
              gradientIndex={index}
              onPress={() => {
                queryClient.prefetchQuery({
                  queryKey: ['coach', coach.userId],
                  queryFn: () => coachApi.getCoach(coach.userId),
                  staleTime: 60_000,
                });
                router.push(`/coach/${coach.userId}`);
              }}
            />
          ))
        )}
      </ScrollView>
    </AppCanvas>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Layout.screenPaddingX,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '500',
    letterSpacing: -0.5,
    color: Colors.ink,
    lineHeight: 34,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    marginTop: 6,
    fontWeight: '500',
  },
  searchSection: {
    paddingHorizontal: Layout.screenPaddingX,
    paddingBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.ink,
  },
  filtersRow: {
    gap: Spacing.sm,
    paddingBottom: 2,
    paddingRight: Layout.screenPaddingX,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.body,
  },
  scroll: {
    flex: 1,
  },
  loaderWrap: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  loaderText: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptySub: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
  },
});

import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { coachApi } from '../../lib/api';
import CoachAtlasCard from '../../components/CoachAtlasCard';
import { AtlasColors } from '../../constants/atlasTheme';
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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: safeTop }]}>
        <Text style={styles.headerTitle}>Find Coaches</Text>
        <Text style={styles.headerSub}>
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {SKILL_LEVELS.map((level) => {
            const isActive = skillLevel === level;
            const color = level ? SKILL_COLORS[level] : Colors.primary;
            return (
              <TouchableOpacity
                key={level || 'all'}
                style={[styles.filterPill, isActive && { backgroundColor: color, borderColor: color }]}
                onPress={() => setSkillLevel(level)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {level || 'All Levels'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: '#F5F5F7',
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    letterSpacing: -0.5,
    color: AtlasColors.ink,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  searchSection: {
    backgroundColor: '#F5F5F7',
    paddingHorizontal: Spacing.lg,
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
    borderWidth: 0,
    gap: Spacing.sm,
    ...Shadow.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.ink,
  },
  filtersRow: {
    gap: Spacing.sm,
    paddingBottom: 2,
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
  filterTextActive: {
    color: Colors.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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

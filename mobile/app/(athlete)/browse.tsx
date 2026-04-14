import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors, Spacing, BorderRadius, FontSizes, Shadow } from '../../constants/theme';
import { coachApi } from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import StatusPill from '../../components/ui/StatusPill';
import { formatPrice } from '../../utils/format';
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
          coaches?.map((coach: any) => (
            <TouchableOpacity
              key={coach.userId}
              style={styles.coachCard}
              onPress={() => {
                // Prefetch coach profile before navigation for instant load
                queryClient.prefetchQuery({
                  queryKey: ['coach', coach.userId],
                  queryFn: () => coachApi.getCoach(coach.userId),
                  staleTime: 60_000,
                });
                router.push(`/coach/${coach.userId}`);
              }}
              activeOpacity={0.85}
            >
              {/* Left accent bar based on skill */}
              <View style={[styles.cardAccent, { backgroundColor: coach.skillLevel ? SKILL_COLORS[coach.skillLevel] ?? Colors.primary : Colors.primary }]} />

              <View style={styles.cardBody}>
                {/* Top row */}
                <View style={styles.cardTop}>
                  <Avatar name={coach.name} uri={coach.avatarUrl} size={52} />
                  <View style={styles.coachInfo}>
                    <Text style={styles.coachName}>{coach.name}</Text>
                    <View style={styles.coachMeta}>
                      <Ionicons name="location-outline" size={12} color={Colors.muted} />
                      <Text style={styles.coachLocation}>{coach.locationCity}, {coach.locationState}</Text>
                    </View>
                    {coach.rating && (
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={12} color="#FDAB3D" />
                        <Text style={styles.ratingText}>
                          {coach.rating.toFixed(1)} · {coach.reviewCount || 0} reviews
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceCol}>
                    <Text style={styles.price}>{formatPrice(coach.pricePerHour)}</Text>
                    <Text style={styles.priceLabel}>/hr</Text>
                  </View>
                </View>

                {/* Bio */}
                {coach.experience && (
                  <Text style={styles.bio} numberOfLines={2}>{coach.experience}</Text>
                )}

                {/* Footer */}
                <View style={styles.cardFooter}>
                  {coach.skillLevel && (
                    <StatusPill
                      label={coach.skillLevel}
                      color={SKILL_COLORS[coach.skillLevel] ?? Colors.primary}
                      size="sm"
                    />
                  )}
                  <View style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View Profile</Text>
                    <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    color: Colors.ink,
  },
  headerSub: {
    fontSize: FontSizes.sm,
    color: Colors.muted,
    marginTop: 2,
    fontWeight: '500',
  },
  searchSection: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 46,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
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

  // Coach card
  coachCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  cardAccent: {
    width: 4,
  },
  cardBody: {
    flex: 1,
    padding: Spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  coachInfo: {
    flex: 1,
    gap: 3,
  },
  coachName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.ink,
  },
  coachMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  coachLocation: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
    fontWeight: '600',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSizes.xl,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceLabel: {
    fontSize: FontSizes.xs,
    color: Colors.muted,
  },
  bio: {
    fontSize: FontSizes.sm,
    color: Colors.body,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    color: Colors.primary,
  },
});

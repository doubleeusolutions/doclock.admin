import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VideosHeader } from '@/components/videos/VideosHeader';
import { VideoSubjectCard } from '@/components/videos/VideoSubjectCard';
import {
  VIDEO_SUBJECTS,
  VIDEO_FILTER_CHIPS,
  VideoSubject,
} from '@/data/videosData';
import { SubjectCategory } from '@/data/qbankData';
import { Colors } from '@/theme';

export default function VideosScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState<'all' | SubjectCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter video subjects based on category chip and search query
  const filteredSubjects = useMemo(() => {
    return VIDEO_SUBJECTS.filter((subject: VideoSubject) => {
      const matchesCategory =
        selectedFilter === 'all' || subject.categories.includes(selectedFilter);

      const matchesSearch =
        searchQuery.trim() === '' ||
        subject.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedFilter, searchQuery]);

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Top App Header with transparent border and 64px height */}
      <VideosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBookmarkPress={() => { }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Hero Section matching Qbank header style */}
          {/* <View style={styles.heroSection}>
            <View style={styles.heroTopRow}>
              <Text style={styles.examPrepTag}>FMGE Exam Prep</Text>
              <View style={styles.subjectsCountBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.subjectsCountText}>
                  19 Subjects • 340+ Videos
                </Text>
              </View>
            </View>

            <Text style={styles.mainHeading}>FMGE Video Lectures</Text>
            <Text style={styles.subHeading}>
              Foreign Medical Graduate Exam • High-Yield Whiteboard &amp; 3D Clinical Lessons
            </Text>
          </View> */}

          {/* Filter Chips Bar */}
          <View style={styles.filterChipsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsScroll}
            >
              {VIDEO_FILTER_CHIPS.map((chip) => {
                const isActive = selectedFilter === chip.id;
                return (
                  <Pressable
                    key={chip.id}
                    onPress={() => setSelectedFilter(chip.id)}
                    style={[
                      styles.filterChip,
                      isActive ? styles.filterChipActive : styles.filterChipInactive,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isActive
                          ? styles.filterChipTextActive
                          : styles.filterChipTextInactive,
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Video Subjects List */}
          <View style={styles.subjectsList}>
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((subject) => (
                <VideoSubjectCard
                  key={subject.id}
                  subject={subject}
                  onPress={() => {
                    router.push(`/videos/${subject.id}` as any);
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateTitle}>No videos found</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Try clearing your search or selecting another category filter.
                </Text>
              </View>
            )}
          </View>

          {/* Bottom spacing for clearance over global bottom navigation bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingTop: 12,
  },
  centerWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
    gap: 16,
  },
  heroSection: {
    gap: 2,
    paddingTop: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  examPrepTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  subjectsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainerHigh,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  subjectsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
  },
  mainHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.onSurfaceVariant,
    lineHeight: 18,
  },
  filterChipsContainer: {
    marginHorizontal: -16,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: 'rgba(18, 28, 43, 0.03)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  filterChipTextActive: {
    fontWeight: '700',
    color: '#ffffff',
  },
  filterChipTextInactive: {
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  subjectsList: {
    gap: 8,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 88,
  },
});

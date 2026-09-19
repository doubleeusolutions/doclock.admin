import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native';
import {
  BookmarkItem,
  BookmarkType,
} from '@/data/quickResourcesData';
import { Colors, Motion } from '@/theme';
import { useStudyLocker } from '@/hooks/useStudyLocker';
import { useAlert } from '@/contexts/AlertContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SUBJECT_FILTERS = [
  'All Subjects',
  'Pharmacology',
  'Anatomy',
  'Pathology',
  'Microbiology',
  'Surgery',
];

export default function BookmarksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { bookmarks, removeBookmark, loading } = useStudyLocker();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | BookmarkType>('all');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const items = bookmarks;

  // Back button animation
  const backBtnScale = useSharedValue(1);
  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchType =
        activeTypeTab === 'all' ? true : item.type === activeTypeTab;
      const matchSubject =
        selectedSubject === 'All Subjects'
          ? true
          : item.subject.toLowerCase() === selectedSubject.toLowerCase();
      const matchQuery =
        searchQuery.trim() === ''
          ? true
          : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.subject.toLowerCase().includes(searchQuery.toLowerCase());

      return matchType && matchSubject && matchQuery;
    });
  }, [items, activeTypeTab, selectedSubject, searchQuery]);

  const handleToggleBookmark = (id: string, title: string) => {
    showAlert({
      title: 'Remove Bookmark',
      message: `Remove "${title}" from your saved high-yield study locker?`,
      type: 'destructive',
      icon: 'bookmark-remove',
      confirmText: 'Remove',
      cancelText: 'Keep Bookmark',
      onConfirm: () => {
        removeBookmark(id);
      },
    });
  };

  const handleOpenItem = (item: BookmarkItem) => {
    if (item.targetRoute) {
      router.push(item.targetRoute as any);
    } else {
      showAlert({
        title: item.title,
        message: item.snippet,
        type: 'info',
        icon: 'bookmark',
        badgeText: item.subject,
        confirmText: 'Done',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.onSurfaceVariant, fontSize: 13 }}>
          Loading saved bookmarks...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* 1. STANDARDIZED 64px DOCLOCK TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <AnimatedPressable
            onPress={() => router.back()}
            onPressIn={() => {
              backBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              backBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.backBtn, backBtnAnimStyle]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
          </AnimatedPressable>

          <View style={styles.headerTitleGroup}>
            <Text style={styles.headerTitle}>Saved Bookmarks</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowSearch((prev) => !prev)}
            style={[styles.iconBtn, showSearch && styles.iconBtnActive]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Search bookmarks"
          >
            <MaterialIcons
              name="search"
              size={20}
              color={showSearch ? '#0059b9' : '#424752'}
            />
          </Pressable>
        </View>
      </View>

      {/* 2. SEARCH BAR (COLLAPSIBLE) */}
      {showSearch && (
        <View style={styles.searchBarWrapper}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color="#727782" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search drug names, clinical signs, questions..."
              placeholderTextColor="#8a92a6"
              style={styles.searchInput}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
                <MaterialIcons name="close" size={16} color="#727782" />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* 3. HORIZONTAL SCROLLABLE CATEGORY TABS */}
      <View style={styles.typeTabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeTabsContent}
        >
          <TypeTabPill
            label={`All Items (${items.length})`}
            icon="bookmark"
            isActive={activeTypeTab === 'all'}
            onPress={() => setActiveTypeTab('all')}
          />
          <TypeTabPill
            label="Clinical MCQs"
            icon="quiz"
            isActive={activeTypeTab === 'mcq'}
            onPress={() => setActiveTypeTab('mcq')}
          />
          <TypeTabPill
            label="Video Lectures"
            icon="play-circle"
            isActive={activeTypeTab === 'video'}
            onPress={() => setActiveTypeTab('video')}
          />
          <TypeTabPill
            label="High-Yield Pearls"
            icon="lightbulb"
            isActive={activeTypeTab === 'pearl'}
            onPress={() => setActiveTypeTab('pearl')}
          />
          <TypeTabPill
            label="Flashcards"
            icon="style"
            isActive={activeTypeTab === 'flashcard'}
            onPress={() => setActiveTypeTab('flashcard')}
          />
        </ScrollView>
      </View>

      {/* 4. HORIZONTAL SUBJECT PILLS */}
      <View style={styles.subjectPillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectPillsContent}
        >
          {SUBJECT_FILTERS.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <Pressable
                key={sub}
                onPress={() => setSelectedSubject(sub)}
                style={[
                  styles.subjectPill,
                  isSelected && styles.subjectPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.subjectPillText,
                    isSelected && styles.subjectPillTextActive,
                  ]}
                >
                  {sub}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 5. BOOKMARKS LIST */}
      <ScrollView
        style={styles.listScrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="bookmark-border" size={36} color="#0059b9" />
            </View>
            <Text style={styles.emptyTitle}>No bookmarks found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search query or subject filters.
            </Text>
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedSubject('All Subjects');
                setActiveTypeTab('all');
              }}
              style={styles.clearBtn}
            >
              <Text style={styles.clearBtnText}>Reset Filters</Text>
            </Pressable>
          </View>
        ) : (
          filteredItems.map((item) => (
            <BookmarkCard
              key={item.id}
              item={item}
              onOpen={() => handleOpenItem(item)}
              onRemove={() => handleToggleBookmark(item.id, item.title)}
            />
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const TypeTabPill: React.FC<{
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, icon, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.typeTab, isActive && styles.typeTabActive]}
  >
    <MaterialIcons
      name={icon}
      size={14}
      color={isActive ? '#0059b9' : '#575f6e'}
    />
    <Text style={[styles.typeTabText, isActive && styles.typeTabTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const BookmarkCard: React.FC<{
  item: BookmarkItem;
  onOpen: () => void;
  onRemove: () => void;
}> = ({ item, onOpen, onRemove }) => {
  const isMcq = item.type === 'mcq';
  const isVideo = item.type === 'video';
  const isPearl = item.type === 'pearl';

  return (
    <View style={styles.card}>
      {/* Top Meta Row */}
      <View style={styles.cardTopRow}>
        <View style={styles.tagGroup}>
          <View
            style={[
              styles.typeBadge,
              isMcq
                ? styles.badgeMcq
                : isVideo
                ? styles.badgeVideo
                : isPearl
                ? styles.badgePearl
                : styles.badgeFlashcard,
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                isMcq
                  ? styles.badgeMcqText
                  : isVideo
                  ? styles.badgeVideoText
                  : isPearl
                  ? styles.badgePearlText
                  : styles.badgeFlashcardText,
              ]}
            >
              {item.badgeText}
            </Text>
          </View>

          <Text style={styles.cardSubjectTag}>
            {item.subject} • {item.chapter}
          </Text>
        </View>

        <Pressable
          onPress={onRemove}
          hitSlop={8}
          style={styles.savedIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Remove bookmark"
        >
          <MaterialIcons name="bookmark" size={20} color="#0059b9" />
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle}>{item.title}</Text>

      {/* Snippet / Vignette */}
      <Text style={styles.cardSnippet} numberOfLines={3}>
        {item.snippet}
      </Text>

      {/* Footer Info & Action */}
      <View style={styles.cardFooterRow}>
        <View style={styles.footerLeft}>
          <Text style={styles.dateSavedText}>{item.dateSaved}</Text>
          {item.difficulty && (
            <View style={styles.difficultyPill}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
          )}
        </View>

        <Pressable
          onPress={onOpen}
          style={styles.openBtn}
          accessibilityRole="button"
        >
          <Text style={styles.openBtnText}>
            {isVideo ? 'Watch Class' : isMcq ? 'Solve MCQ' : 'Review'}
          </Text>
          <MaterialIcons name="arrow-forward" size={13} color="#0059b9" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* 1. Standardized 64px Header */
  topHeader: {
    height: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e7f2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerTitleGroup: {
    flex: 1,
    gap: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181c22',
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#575f6e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f4fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#e7eeff',
  },

  /* 2. Search Bar */
  searchBarWrapper: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f4fb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#181c22',
  },

  /* 3. Type Tabs */
  typeTabsWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
    paddingVertical: 8,
  },
  typeTabsContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  typeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#f1f4fb',
  },
  typeTabActive: {
    backgroundColor: '#e7eeff',
    borderWidth: 1,
    borderColor: '#0059b9',
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#575f6e',
  },
  typeTabTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },

  /* 4. Subject Pills */
  subjectPillsWrapper: {
    backgroundColor: '#f9f9ff',
    paddingVertical: 8,
  },
  subjectPillsContent: {
    paddingHorizontal: 14,
    gap: 6,
  },
  subjectPill: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e7f2',
  },
  subjectPillActive: {
    backgroundColor: '#0059b9',
    borderColor: '#0059b9',
  },
  subjectPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#575f6e',
  },
  subjectPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  /* 5. List Area */
  listScrollView: {
    flex: 1,
  },
  listContent: {
    padding: 14,
    gap: 12,
  },

  /* Bookmark Card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  badgeMcq: {
    backgroundColor: '#e0f2fe',
  },
  badgeVideo: {
    backgroundColor: '#e7eeff',
  },
  badgePearl: {
    backgroundColor: '#fef3c7',
  },
  badgeFlashcard: {
    backgroundColor: '#eef2ff',
  },
  typeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  badgeMcqText: {
    color: '#0369a1',
  },
  badgeVideoText: {
    color: '#0059b9',
  },
  badgePearlText: {
    color: '#b45309',
  },
  badgeFlashcardText: {
    color: '#4338ca',
  },
  cardSubjectTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#727782',
  },
  savedIconBtn: {
    padding: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c22',
    lineHeight: 19,
  },
  cardSnippet: {
    fontSize: 12.5,
    lineHeight: 17,
    color: '#575f6e',
  },

  /* Card Footer */
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f4fb',
    marginTop: 2,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateSavedText: {
    fontSize: 11,
    color: '#8a92a6',
  },
  difficultyPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eef4ff',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  openBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0059b9',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e7eeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181c22',
  },
  emptySub: {
    fontSize: 12.5,
    color: '#727782',
    textAlign: 'center',
    maxWidth: 240,
  },
  clearBtn: {
    marginTop: 6,
    backgroundColor: '#0059b9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Switch,
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
  DownloadedItem,
  DownloadType,
} from '@/data/quickResourcesData';
import { Colors, Motion } from '@/theme';
import { useStudyLocker } from '@/hooks/useStudyLocker';
import { useAlert } from '@/contexts/AlertContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DownloadsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { downloads, removeDownload, clearAllDownloads, loading } = useStudyLocker();

  const items = downloads;
  const [activeTypeTab, setActiveTypeTab] = useState<'all' | DownloadType>('all');
  const [wifiOnly, setWifiOnly] = useState(true);

  // Back button animation
  const backBtnScale = useSharedValue(1);
  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const totalSizeMb = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.fileSizeMb, 0);
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeTypeTab === 'all') return items;
    return items.filter((item) => item.type === activeTypeTab);
  }, [items, activeTypeTab]);

  const handleDeleteItem = (id: string, title: string) => {
    showAlert({
      title: 'Delete Offline Download',
      message: `Remove "${title}" from your device storage? You can re-download it anytime over Wi-Fi.`,
      type: 'destructive',
      icon: 'delete-outline',
      confirmText: 'Delete Download',
      cancelText: 'Keep File',
      onConfirm: () => {
        removeDownload(id);
      },
    });
  };

  const handleClearAll = () => {
    showAlert({
      title: 'Clear All Offline Downloads',
      message:
        'Free up internal device storage? All downloaded video lectures, high-yield audio, and PDF notes will be removed.',
      type: 'destructive',
      icon: 'delete-sweep',
      confirmText: 'Clear All Downloads',
      cancelText: 'Cancel',
      onConfirm: () => clearAllDownloads(),
    });
  };

  const handlePlayItem = (item: DownloadedItem) => {
    if (item.targetRoute) {
      router.push(item.targetRoute as any);
    } else {
      showAlert({
        title: 'Offline Playback',
        message: `Now playing "${item.title}" from your high-speed offline cache.`,
        type: 'info',
        icon: 'play-circle',
        confirmText: 'Got It',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.onSurfaceVariant, fontSize: 13 }}>
          Loading offline downloads...
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
            <Text style={styles.headerTitle}>Offline Downloads</Text>
            <Text style={styles.headerSubtitle}>
              {items.length} files • {(totalSizeMb / 1024).toFixed(1)} GB stored
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {items.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              style={styles.clearHeaderBtn}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Clear downloads"
            >
              <MaterialIcons name="delete-sweep" size={20} color="#b91c1c" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. STORAGE MANAGEMENT HERO CARD */}
        <View style={styles.storageCard}>
          <View style={styles.storageCardHeader}>
            <View style={styles.storageTitleGroup}>
              <MaterialIcons name="storage" size={20} color="#0059b9" />
              <Text style={styles.storageTitle}>Device Storage Status</Text>
            </View>
            <Text style={styles.storageValueText}>
              {(totalSizeMb / 1024).toFixed(1)} GB of 64 GB
            </Text>
          </View>

          {/* Tri-color Storage Bar */}
          <View style={styles.storageBarBg}>
            <View style={[styles.storageBarApp, { width: `${Math.min(30, (totalSizeMb / 1024) * 8)}%` }]} />
            <View style={[styles.storageBarSystem, { width: '28%' }]} />
            <View style={[styles.storageBarFree, { width: '56%' }]} />
          </View>

          {/* Storage Legend */}
          <View style={styles.storageLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0059b9' }]} />
              <Text style={styles.legendText}>DocLock ({totalSizeMb > 1000 ? `${(totalSizeMb / 1024).toFixed(1)} GB` : `${totalSizeMb} MB`})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#94a3b8' }]} />
              <Text style={styles.legendText}>Other (18 GB)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Free (44 GB)</Text>
            </View>
          </View>

          {/* Wi-Fi Only Switch */}
          <View style={styles.wifiToggleRow}>
            <View style={styles.wifiInfo}>
              <MaterialIcons name="wifi" size={16} color="#0059b9" />
              <Text style={styles.wifiText}>Download over Wi-Fi only</Text>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
              thumbColor={wifiOnly ? '#0059b9' : '#ffffff'}
            />
          </View>
        </View>

        {/* 3. TYPE FILTER TABS */}
        <View style={styles.typeTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeTabsContent}
          >
            <DownloadTabPill
              label={`All Downloads (${items.length})`}
              icon="folder"
              isActive={activeTypeTab === 'all'}
              onPress={() => setActiveTypeTab('all')}
            />
            <DownloadTabPill
              label="Video Classes"
              icon="play-circle"
              isActive={activeTypeTab === 'video'}
              onPress={() => setActiveTypeTab('video')}
            />
            <DownloadTabPill
              label="Slide Decks"
              icon="description"
              isActive={activeTypeTab === 'slides'}
              onPress={() => setActiveTypeTab('slides')}
            />
            <DownloadTabPill
              label="Audio Podcasts"
              icon="graphic-eq"
              isActive={activeTypeTab === 'audio'}
              onPress={() => setActiveTypeTab('audio')}
            />
          </ScrollView>
        </View>

        {/* 4. DOWNLOADED ITEMS LIST */}
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="cloud-download" size={36} color="#0059b9" />
            </View>
            <Text style={styles.emptyTitle}>No offline downloads</Text>
            <Text style={styles.emptySub}>
              Download recorded lectures and slides to continue studying without internet access.
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/videos' as any)}
              style={styles.browseBtn}
            >
              <Text style={styles.browseBtnText}>Browse Video Lectures</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {filteredItems.map((item) => (
              <DownloadCard
                key={item.id}
                item={item}
                onPlay={() => handlePlayItem(item)}
                onDelete={() => handleDeleteItem(item.id, item.title)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const DownloadTabPill: React.FC<{
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, icon, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.tabPill, isActive && styles.tabPillActive]}
  >
    <MaterialIcons
      name={icon}
      size={14}
      color={isActive ? '#0059b9' : '#575f6e'}
    />
    <Text style={[styles.tabPillText, isActive && styles.tabPillTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const DownloadCard: React.FC<{
  item: DownloadedItem;
  onPlay: () => void;
  onDelete: () => void;
}> = ({ item, onPlay, onDelete }) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardMainRow}>
        {/* Left Thumbnail with Badge */}
        <View style={styles.thumbWrapper}>
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbImg}
            resizeMode="cover"
          />
          <View style={styles.downloadedBadge}>
            <MaterialIcons name="check" size={11} color="#ffffff" />
          </View>
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{item.durationOrPages}</Text>
          </View>
        </View>

        {/* Right Info */}
        <View style={styles.cardDetails}>
          <View style={styles.cardTopMeta}>
            <Text style={styles.cardSubjectTag}>
              {item.subject.toUpperCase()}
            </Text>
            <View style={styles.qualityPill}>
              <Text style={styles.qualityPillText}>{item.qualityBadge}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.fileSizeText}>
            {item.fileSizeMb} MB • {item.downloadDate}
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View style={styles.cardActionRow}>
        <Pressable
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Delete download"
        >
          <MaterialIcons name="delete-outline" size={16} color="#b91c1c" />
          <Text style={styles.deleteBtnText}>Remove</Text>
        </Pressable>

        <Pressable
          onPress={onPlay}
          style={styles.playBtn}
          accessibilityRole="button"
          accessibilityLabel="Play offline"
        >
          <MaterialIcons name="play-arrow" size={16} color="#ffffff" />
          <Text style={styles.playBtnText}>
            {item.type === 'slides' ? 'View Slides' : 'Play Offline'}
          </Text>
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
  },
  clearHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Main Scroll */
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 14,
    gap: 14,
  },

  /* 2. Storage Card */
  storageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  storageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storageTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storageTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181c22',
  },
  storageValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0059b9',
  },

  /* Storage Bar */
  storageBarBg: {
    height: 10,
    backgroundColor: '#f1f4fb',
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    gap: 2,
  },
  storageBarApp: {
    height: '100%',
    backgroundColor: '#0059b9',
    borderRadius: 4,
  },
  storageBarSystem: {
    height: '100%',
    backgroundColor: '#94a3b8',
    borderRadius: 4,
  },
  storageBarFree: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },

  storageLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#575f6e',
  },

  wifiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f4fb',
  },
  wifiInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wifiText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2d333e',
  },

  /* 3. Type Tabs */
  typeTabsWrapper: {
    marginHorizontal: -14,
  },
  typeTabsContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e7f2',
  },
  tabPillActive: {
    backgroundColor: '#e7eeff',
    borderColor: '#0059b9',
  },
  tabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#575f6e',
  },
  tabPillTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },

  /* 4. Cards List */
  cardsList: {
    gap: 12,
  },
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
    gap: 12,
  },
  cardMainRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbWrapper: {
    width: 96,
    height: 72,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#121c2b',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  downloadedBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPill: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  cardDetails: {
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  cardTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSubjectTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0059b9',
    letterSpacing: 0.3,
  },
  qualityPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  qualityPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181c22',
    lineHeight: 18,
  },
  fileSizeText: {
    fontSize: 11,
    color: '#727782',
    marginTop: 2,
  },

  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f4fb',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0059b9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  playBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
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
    maxWidth: 260,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: '#0059b9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  browseBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});

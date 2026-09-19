import React, { useState } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HomeTopHeader } from '@/components/home/HomeTopHeader';
import { QuickStudyResources } from '@/components/home/QuickStudyResources';
import { HomeActivityCarousel } from '@/components/home/HomeActivityCarousel';
import { LiveClassModal } from '@/components/home/LiveClassModal';
import { MCQCard } from '@/components/home/MCQCard';
import { DesktopSyncBanner } from '@/components/home/DesktopSyncBanner';
import { LiveClassSession } from '@/data/liveClassesData';
import { CarouselActivityItem } from '@/data/homeCarouselData';
import { Colors } from '@/theme';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useAuth();
  const candidateName = profile?.full_name?.split(' ')[0] || 'Alex';

  const [activeLiveSession, setActiveLiveSession] =
    useState<LiveClassSession | null>(null);

  const handleSelectActivity = (activity: CarouselActivityItem) => {
    if (activity.type === 'live' && activity.liveSessionData) {
      setActiveLiveSession(activity.liveSessionData);
    } else if (activity.targetRoute) {
      router.push(activity.targetRoute as any);
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {/* Top App Header (64px height, matching Qbank & Videos) */}
      <HomeTopHeader
        userName={candidateName}
        subtitle="Ready for today's revision?"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Quick study resources (2x2 Grid) */}
          <QuickStudyResources />

          {/* Adaptable Learning Activities Carousel (Live, Resume Video, Resume Test, Resume QBank) */}
          <HomeActivityCarousel onSelectActivity={handleSelectActivity} />

          {/* Quick practice (Interactive MCQ Question) */}
          <MCQCard />

          {/* Desktop Sync Promo Banner */}
          <DesktopSyncBanner />

          {/* Bottom spacing for bottom navigation bar clearance */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>

      {/* Interactive Live Classroom Stream Modal */}
      <LiveClassModal
        visible={!!activeLiveSession}
        session={activeLiveSession}
        onClose={() => setActiveLiveSession(null)}
      />
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
    gap: 20,
  },
  bottomSpacer: {
    height: 88,
  },
});

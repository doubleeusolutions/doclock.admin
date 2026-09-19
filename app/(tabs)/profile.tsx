import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useStudyLocker } from '@/hooks/useStudyLocker';
import { supabase } from '@/lib/supabase';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ResourceItemData {
  id: string;
  name: string;
  count: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tint: string;
  iconColor: string;
}

interface SettingItemData {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tint: string;
  iconColor: string;
  badge?: string;
  badgeType?: 'active' | 'link';
  onPress: () => void;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { user, profile, settings, signOut, updateSettings } = useAuth();
  const { bookmarks, flashcards, downloads } = useStudyLocker();
  const [avatarError, setAvatarError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    mcqsSolved: 0,
    accuracy: 0,
    streakDays: 0,
    gtRank: null as number | null,
    totalCandidates: 0,
    videoHours: 0,
    videoSubjectsStarted: 0,
  });

  useEffect(() => {
    if (!user) return;

    // Fetch quiz stats
    supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const totalSolved = data.reduce((sum, a) => sum + (a.total_questions || 0), 0);
          const totalCorrect = data.reduce((sum, a) => sum + (a.score || 0), 0);
          const acc = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
          setStats((prev) => ({ ...prev, mcqsSolved: totalSolved, accuracy: acc }));
        }
      });

    // Fetch study streak
    supabase
      .from('user_study_activity_logs')
      .select('id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setStats((prev) => ({ ...prev, streakDays: data.length }));
        }
      });
  }, [user]);

  const studyResources: ResourceItemData[] = useMemo(
    () => [
      {
        id: 'bookmarks',
        name: 'Bookmarks',
        count: `${bookmarks.length} ${bookmarks.length === 1 ? 'item' : 'items'}`,
        icon: 'bookmark',
        tint: '#eaf0ff',
        iconColor: Colors.primary,
      },
      {
        id: 'flashcards',
        name: 'Flashcards',
        count: `${flashcards.length} ${flashcards.length === 1 ? 'card' : 'cards'}`,
        icon: 'style',
        tint: '#eef2ff',
        iconColor: '#4f46e5',
      },
      {
        id: 'downloads',
        name: 'Downloads',
        count: `${downloads.length} ${downloads.length === 1 ? 'file' : 'files'}`,
        icon: 'download-for-offline',
        tint: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        id: 'notes',
        name: 'My Notes',
        count: '0 notes',
        icon: 'sticky-note-2',
        tint: '#fffbeb',
        iconColor: '#d97706',
      },
    ],
    [bookmarks.length, flashcards.length, downloads.length]
  );

  const editBtnScale = useSharedValue(1);
  const editBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editBtnScale.value }],
  }));

  const handleEditProfile = () => {
    showAlert({
      title: 'Candidate Profile',
      message: 'Candidate credentials, enrolled exam batch, and personal details.',
      type: 'info',
      icon: 'account-circle',
      badgeText: profile?.role === 'candidate' ? 'Verified Candidate' : 'Faculty',
      details: [
        { label: 'Name', value: profile?.full_name || 'Candidate' },
        { label: 'Candidate ID', value: profile?.candidate_id || 'DOC-2026-9821' },
        { label: 'Email', value: profile?.email || 'alex.mercer@doclock.org' },
      ],
      confirmText: 'Done',
    });
  };

  const handleDetailedReport = () => {
    showAlert({
      title: 'Academic Analytics',
      message: 'Comprehensive performance breakdown based on real Supabase drill attempts.',
      type: 'info',
      icon: 'insights',
      badgeText: 'Live Cloud Sync',
      badgeBgColor: '#d7e2ff',
      badgeColor: Colors.primary,
      details: [
        { label: 'Study Streak', value: `${stats.streakDays} Days Continuous` },
        { label: 'Overall Accuracy', value: `${stats.accuracy}%` },
        { label: 'MCQs Solved', value: `${stats.mcqsSolved} Questions` },
        { label: 'Video Lecture Time', value: `${stats.videoHours} Hours` },
      ],
      confirmText: 'Close Report',
    });
  };

  const handleResourcePress = (item: ResourceItemData) => {
    if (item.id === 'bookmarks') router.push('/bookmarks');
    else if (item.id === 'flashcards') router.push('/flashcards');
    else if (item.id === 'downloads') router.push('/downloads');
    else {
      showAlert({
        title: item.name,
        message: `Opening your personal ${item.name} study locker and offline resources.`,
        type: 'info',
        icon: item.icon,
        confirmText: 'Got It',
      });
    }
  };

  const handleChangeExam = () => {
    showAlert({
      title: 'Target Medical Exam',
      message:
        'Select your target examination. QBank filters, grand mocks, countdowns, and recall drills will synchronize accordingly.',
      type: 'select',
      icon: 'school',
      badgeText: 'Curriculum Filter',
      options: [
        {
          label: 'FMGE (Dec 2026)',
          value: 'FMGE (Dec 2026)',
          badge: 'Recommended',
          subtitle: 'Foreign Medical Graduate Screening Examination',
        },
        {
          label: 'NEET PG 2026',
          value: 'NEET PG 2026',
          subtitle: 'National Eligibility cum Entrance Test (Postgraduate)',
        },
        {
          label: 'USMLE Step 1',
          value: 'USMLE Step 1',
          subtitle: 'United States Medical Licensing Examination',
        },
        {
          label: 'INICET (Nov 2026)',
          value: 'INICET (Nov 2026)',
          subtitle: 'Institute of National Importance Combined Entrance Test',
        },
      ],
      selectedOptionValue: settings?.target_exam_name || 'FMGE (Dec 2026)',
      confirmText: 'Set Target Exam',
      cancelText: 'Cancel',
      onConfirm: (selectedExam) => {
        if (selectedExam) {
          updateSettings({ target_exam_name: selectedExam });
        }
      },
    });
  };

  const handleSubscription = () => {
    showAlert({
      title: 'DocLock Pro Pass',
      message:
        'Full access to all 19 medical subjects, National Grand Mocks, 50,000+ MCQs, clinical pearls, and offline video streaming.',
      type: 'info',
      icon: 'workspace-premium',
      iconColor: '#5b4aba',
      iconBgColor: '#e5deff',
      badgeText: 'Active Pro Member',
      badgeBgColor: '#e5deff',
      badgeColor: '#5b4aba',
      details: [
        { label: 'Status', value: 'Active • Pro Member' },
        { label: 'Valid Through', value: 'December 31, 2026' },
        { label: 'Offline Downloads', value: 'Unlimited Access' },
        { label: 'Faculty Support', value: '24/7 Doubt Resolution' },
      ],
      confirmText: 'Done',
    });
  };

  const handleReminders = () => {
    showAlert({
      title: 'Daily Study Reminders',
      message:
        'Automated revision notifications are active to help maintain your daily recall rhythm and study streak.',
      type: 'info',
      icon: 'alarm',
      iconColor: '#006780',
      iconBgColor: '#b9eaff',
      details: [
        { label: 'Morning High-Yield Drill', value: '07:30 AM' },
        { label: 'Evening MCQ Revision', value: '09:00 PM' },
        { label: 'Status', value: 'Push Notifications Enabled' },
      ],
      confirmText: 'Got It',
    });
  };

  const handleLinkedDevices = () => {
    showAlert({
      title: 'Linked Devices & Sync',
      message:
        'Your progress, bookmarks, flashcard reviews, and notes are encrypted and synchronized in real time.',
      type: 'info',
      icon: 'devices',
      details: [
        { label: 'Current Device', value: 'Android Device (Active Now)' },
        { label: 'Web Session', value: 'Chrome Desktop (Synced 10m ago)' },
        { label: 'Cloud Sync', value: 'Supabase PostgreSQL' },
      ],
      confirmText: 'Done',
    });
  };

  const handleSupport = () => {
    showAlert({
      title: 'Academic Doubt Support',
      message:
        'Connect directly with AIIMS & CMC faculty educators to resolve conceptual doubts, review ambiguous questions, and discuss golden pearls.',
      type: 'info',
      icon: 'support-agent',
      details: [
        { label: 'Response Time', value: '< 2 Hours' },
        { label: 'Faculty Active', value: 'Clinical & Pre-Clinical Chairs' },
        { label: 'Channel', value: 'In-App Medical Helpdesk' },
      ],
      confirmText: 'Contact Faculty',
    });
  };

  const handleStorage = () => {
    showAlert({
      title: 'Storage & Cache',
      message:
        '1.8 GB of offline videos, high-yield audio pearls, and PDF notes are cached locally on this device.',
      type: 'destructive',
      icon: 'cleaning-services',
      details: [
        { label: 'Cached Media', value: '1.8 GB' },
        { label: 'Offline Videos', value: '12 Classes' },
        { label: 'High-Yield PDFs', value: '38 Chapters' },
      ],
      confirmText: 'Clear Cache',
      cancelText: 'Cancel',
      onConfirm: () => {
        showAlert({
          title: 'Cache Cleared',
          message:
            'All local cached media has been freed. Offline files can be re-downloaded anytime over Wi-Fi.',
          type: 'success',
          icon: 'check-circle',
          confirmText: 'Done',
        });
      },
    });
  };

  const handleSignOut = () => {
    showAlert({
      title: 'Log Out of DocLock',
      message:
        'Are you sure you want to log out? Your study streak, mock exam rankings, and saved bookmarks remain safely stored in your cloud account.',
      type: 'destructive',
      icon: 'logout',
      confirmText: 'Log Out',
      cancelText: 'Stay Logged In',
      onConfirm: async () => {
        await signOut();
        router.replace('/auth/login' as any);
      },
    });
  };

  // Preference items list
  const accountPreferences: SettingItemData[] = useMemo(
    () => [
      {
        id: 'target_exam',
        title: 'Target Exam',
        subtitle: settings?.target_exam_name || 'FMGE (Foreign Medical Graduate Exam)',
        icon: 'school',
        tint: '#eaf0ff',
        iconColor: Colors.primary,
        badge: 'Change',
        badgeType: 'link',
        onPress: handleChangeExam,
      },
      {
        id: 'subscription',
        title: 'Subscription & Billing',
        subtitle: 'DocLock Pro Pass • Renews Dec 2026',
        icon: 'workspace-premium',
        tint: '#fffbeb',
        iconColor: '#d97706',
        badge: 'Active',
        badgeType: 'active',
        onPress: handleSubscription,
      },
      {
        id: 'reminders',
        title: 'Daily Study Reminders',
        subtitle: 'Scheduled for 07:30 AM & 09:00 PM',
        icon: 'notifications-active',
        tint: '#faf5ff',
        iconColor: '#9333ea',
        onPress: handleReminders,
      },
      {
        id: 'devices',
        title: 'Linked Devices',
        subtitle: 'MacBook Pro • Chrome Web Active',
        icon: 'devices',
        tint: '#ecfeff',
        iconColor: '#0891b2',
        onPress: handleLinkedDevices,
      },
    ],
    []
  );

  const supportSettings: SettingItemData[] = useMemo(
    () => [
      {
        id: 'help',
        title: 'Academic Doubt Support & FAQ',
        subtitle: '24/7 instant faculty clarification',
        icon: 'support-agent',
        tint: '#fff1f2',
        iconColor: '#e11d48',
        onPress: handleSupport,
      },
      {
        id: 'storage',
        title: 'Storage & Cache',
        subtitle: '1.8 GB used of offline video content',
        icon: 'storage',
        tint: '#f1f5f9',
        iconColor: '#475569',
        onPress: handleStorage,
      },
    ],
    []
  );

  // Filter items if searching
  const query = searchQuery.trim().toLowerCase();
  const filteredResources = useMemo(() => {
    if (!query) return studyResources;
    return studyResources.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.count.toLowerCase().includes(query)
    );
  }, [query, studyResources]);

  const filteredAccountPreferences = useMemo(() => {
    if (!query) return accountPreferences;
    return accountPreferences.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.subtitle.toLowerCase().includes(query)
    );
  }, [query, accountPreferences]);

  const filteredSupportSettings = useMemo(() => {
    if (!query) return supportSettings;
    return supportSettings.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.subtitle.toLowerCase().includes(query)
    );
  }, [query, supportSettings]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Top App Header (64px height, matching Home, Qbank, Videos, and Tests) */}
      <ProfileHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSettingsPress={() =>
          showAlert({
            title: 'DocLock Medical App',
            message:
              'High-yield exam preparation platform for FMGE, NEET-PG, and medical licensing.',
            type: 'info',
            icon: 'verified',
            details: [
              { label: 'Version', value: 'v2.4.1 (Build 2026.09)' },
              { label: 'Candidate', value: profile?.full_name || 'Alex Mercer' },
              { label: 'Database', value: 'Supabase PostgreSQL' },
            ],
            confirmText: 'Close',
          })
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centerWrapper}>
          {/* Profile Hero Card (Matching Home Featured Carousel & DocLock Theme) */}
          <View style={styles.heroCardWrapper}>
            <LinearGradient
              colors={['#0059b9', '#004591', '#002f6c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              {/* Subtle ambient lighting glows */}
              <View style={styles.ambientGlowTop} />
              <View style={styles.ambientGlowBottom} />

              <View style={styles.heroContent}>
                {/* Top Row: Target Exam badge + Edit Profile button */}
                <View style={styles.targetRow}>
                  <View style={styles.targetBadge}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.targetBadgeText}>
                      {settings?.target_exam_name || 'Medical Entrance Target'}
                    </Text>
                  </View>

                  <AnimatedPressable
                    onPress={handleEditProfile}
                    onPressIn={() => {
                      editBtnScale.value = withSpring(0.92, Motion.tactileSpring);
                    }}
                    onPressOut={() => {
                      editBtnScale.value = withSpring(1, Motion.tactileSpring);
                    }}
                    style={[styles.editBtn, editBtnAnimStyle]}
                    accessibilityRole="button"
                    accessibilityLabel="Edit profile"
                  >
                    <MaterialIcons name="edit" size={13} color="#ffffff" />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </AnimatedPressable>
                </View>

                {/* Candidate Info Row */}
                <View style={styles.userRow}>
                  <View style={styles.avatarWrapper}>
                    {profile?.avatar_url && !avatarError ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        style={styles.avatarImage}
                        resizeMode="cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <View style={[styles.avatarImage, styles.avatarFallback]}>
                        <MaterialIcons name="person" size={34} color={Colors.primary} />
                      </View>
                    )}
                    <View style={styles.onlineBadge}>
                      <MaterialIcons name="check" size={10} color="#ffffff" />
                    </View>
                  </View>

                  <View style={styles.userInfoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {profile?.full_name || 'Candidate'}
                      </Text>
                      <MaterialIcons name="verified" size={18} color="#fcd34d" />
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      {profile?.email || user?.email || 'Candidate Account'}
                    </Text>
                    <View style={styles.badgeStrip}>
                      <View style={styles.proPassPill}>
                        <Text style={styles.proPassText}>
                          {profile?.is_pro_pass_active ? 'PRO PASS ACTIVE' : 'CANDIDATE PASS'}
                        </Text>
                      </View>
                      {profile?.candidate_id ? (
                        <Text style={styles.candidateId}>
                          #{profile.candidate_id}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {/* Metric Highlights Strip inside card */}
                <View style={styles.metricsStrip}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>DAYS STREAK</Text>
                    <View style={styles.metricValRow}>
                      <MaterialIcons name="whatshot" size={16} color="#fcd34d" />
                      <Text style={styles.metricValText}>{stats.streakDays}</Text>
                    </View>
                  </View>

                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>MCQS SOLVED</Text>
                    <Text style={styles.metricValText}>{stats.mcqsSolved.toLocaleString()}</Text>
                  </View>

                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>AVG ACCURACY</Text>
                    <Text style={[styles.metricValText, styles.accuracyColor]}>{stats.accuracy}%</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Section: Preparation Performance */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Preparation performance</Text>
              <Pressable
                onPress={handleDetailedReport}
                style={styles.detailLink}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="View detailed report"
              >
                <Text style={styles.detailLinkText}>Detailed report</Text>
                <MaterialIcons name="chevron-right" size={16} color={Colors.primary} />
              </Pressable>
            </View>

            <View style={styles.card}>
              <View style={styles.analyticsGrid}>
                {/* Grand Test Rank */}
                <View style={styles.analyticsBox}>
                  <View style={styles.analyticsBoxTop}>
                    <Text style={styles.analyticsBoxLabel}>All-India GT Rank</Text>
                    <MaterialIcons name="military-tech" size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.analyticsValue}>
                    {stats.gtRank ? `#${stats.gtRank}` : '--'}{' '}
                    <Text style={styles.analyticsValueSub}>
                      {stats.totalCandidates > 0 ? `/ ${stats.totalCandidates}` : ''}
                    </Text>
                  </Text>
                  <View style={styles.greenTag}>
                    <Text style={styles.greenTagText}>
                      {stats.gtRank ? 'Ranked Candidate' : 'Take GT to Rank'}
                    </Text>
                  </View>
                </View>

                {/* Video Study Time */}
                <View style={styles.analyticsBox}>
                  <View style={styles.analyticsBoxTop}>
                    <Text style={styles.analyticsBoxLabel}>Video Study Time</Text>
                    <MaterialIcons name="play-circle" size={18} color="#4f46e5" />
                  </View>
                  <Text style={styles.analyticsValue}>
                    {stats.videoHours.toFixed(1)} <Text style={styles.analyticsValueSub}>hrs</Text>
                  </Text>
                  <View style={styles.blueTag}>
                    <Text style={styles.blueTagText}>
                      {stats.videoSubjectsStarted > 0
                        ? `${stats.videoSubjectsStarted}/19 Subjects Started`
                        : '0/19 Subjects Started'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Section: Study Resources & Locker (Matched with Home Quick Study Resources) */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Study resources & locker</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {filteredResources.length} sections
                </Text>
              </View>
            </View>

            <View style={styles.resourcesGrid}>
              {filteredResources.map((item) => (
                <ResourceItemCard
                  key={item.id}
                  item={item}
                  onPress={() => handleResourcePress(item)}
                />
              ))}
            </View>
          </View>

          {/* Section: Account & Preferences */}
          {filteredAccountPreferences.length > 0 && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Account & preferences</Text>

              <View style={styles.card}>
                <View style={styles.itemList}>
                  {filteredAccountPreferences.map((pref, index) => (
                    <SettingRow
                      key={pref.id}
                      item={pref}
                      isLast={index === filteredAccountPreferences.length - 1}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Section: Support & Application */}
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Support & application</Text>

            <View style={styles.card}>
              <View style={styles.itemList}>
                {filteredSupportSettings.map((item, index) => (
                  <SettingRow
                    key={item.id}
                    item={item}
                    isLast={false}
                  />
                ))}

                {/* Log Out Row */}
                <SettingRow
                  item={{
                    id: 'logout',
                    title: 'Log Out',
                    subtitle: `Sign out of ${profile?.full_name || 'your account'} on this device`,
                    icon: 'logout',
                    tint: '#fee2e2',
                    iconColor: '#dc2626',
                    onPress: handleSignOut,
                  }}
                  isLast={true}
                  isDestructive={true}
                />
              </View>
            </View>
          </View>

          {/* App Version Info Footer */}
          <View style={styles.versionFooter}>
            <Text style={styles.versionBrand}>DocLock Medical Exam Prep</Text>
            <Text style={styles.versionCode}>v2.4.1 (Build 890) • Cloud Synced</Text>
          </View>

          {/* Bottom spacing for bottom navigation bar clearance */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const ResourceItemCard: React.FC<{
  item: ResourceItemData;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.resourceCard, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.count}`}
    >
      <View style={[styles.resourceIconBox, { backgroundColor: item.tint }]}>
        <MaterialIcons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View style={styles.resourceTextCol}>
        <Text style={styles.resourceTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.resourceCount} numberOfLines={1}>
          {item.count}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={18} color={Colors.outlineVariant} />
    </AnimatedPressable>
  );
};

const SettingRow: React.FC<{
  item: SettingItemData;
  isLast: boolean;
  isDestructive?: boolean;
}> = ({ item, isLast, isDestructive }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={item.onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.listItem, isLast && styles.listItemLast, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.subtitle}`}
    >
      <View style={styles.listItemLeft}>
        <View style={[styles.listIconBox, { backgroundColor: item.tint }]}>
          <MaterialIcons name={item.icon} size={20} color={item.iconColor} />
        </View>
        <View style={styles.listTextCol}>
          <Text
            style={[
              styles.listItemTitle,
              isDestructive && styles.destructiveText,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.listItemRight}>
        {item.badge && item.badgeType === 'link' && (
          <Text style={styles.changeActionText}>{item.badge}</Text>
        )}
        {item.badge && item.badgeType === 'active' && (
          <View style={styles.activePill}>
            <Text style={styles.activePillText}>{item.badge}</Text>
          </View>
        )}
        <MaterialIcons
          name="chevron-right"
          size={18}
          color={isDestructive ? '#dc2626' : Colors.outlineVariant}
        />
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  screen: {
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
    gap: 20,
  },

  /* Hero Card */
  heroCardWrapper: {
    width: '100%',
    borderRadius: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(217, 227, 248, 0.5)',
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(96, 165, 250, 0.22)',
  },
  ambientGlowBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(129, 140, 248, 0.18)',
  },
  heroContent: {
    zIndex: 2,
    gap: 16,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Candidate Info Row */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  avatarFallback: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primaryFixedDim,
  },
  badgeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  proPassPill: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    backgroundColor: 'rgba(254, 240, 138, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.4)',
  },
  proPassText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#fef08a',
    letterSpacing: 0.4,
  },
  candidateId: {
    fontSize: 11.5,
    color: '#d7e2ff',
    fontWeight: '500',
  },

  /* Metric Highlights Strip */
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    gap: 8,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricColLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d7e2ff',
    letterSpacing: 0.4,
  },
  metricValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  metricValText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  accuracyColor: {
    color: '#6ee7b7',
  },

  /* Section Styles */
  sectionBlock: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },

  /* Home Culture Card */
  card: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Preparation Performance Grid */
  analyticsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  analyticsBox: {
    flex: 1,
    backgroundColor: '#f0f4fc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.25)',
    gap: 6,
  },
  analyticsBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyticsBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  analyticsValueSub: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
  },
  greenTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  greenTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  blueTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#d7e2ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  blueTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#004591',
  },

  /* Study Resources 2x2 Grid (matching QuickStudyResources culture) */
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  resourceCard: {
    width: '48.5%',
    flexGrow: 1,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  resourceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceTextCol: {
    flex: 1,
    minWidth: 0,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  resourceCount: {
    fontSize: 11.5,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },

  /* Grouped Item List (Settings & Preferences) */
  itemList: {
    gap: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(194, 198, 213, 0.2)',
  },
  listItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 4,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  listIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextCol: {
    flex: 1,
    minWidth: 0,
  },
  listItemTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  activePill: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  destructiveText: {
    color: '#dc2626',
    fontWeight: '700',
  },

  /* Version Footer */
  versionFooter: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: 12,
  },
  versionBrand: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  versionCode: {
    fontSize: 11.5,
    color: Colors.textMuted,
  },

  bottomSpacer: {
    height: 88,
  },
});

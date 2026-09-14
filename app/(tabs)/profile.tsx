import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CANDIDATE_AVATAR =
  'https://lh3.googleusercontent.com/aida/AEtjO1WrNKft3VUsykTbV1ItwjNJQmd84SMBvWBg_4iH0n9TsrPwIvUcPvVh258rHJpWT2Ijli5I7sjQJwdiXsxSPZq78Mh4ZsBn0QWPYPDuDi0n_CgmKJVd5nY6eVB8EaJxvGi9uTqipin1M6am_zaMmNizlWzJHcm3ML2XTb0SeF2TRgueUB4FbY13VvNkCyMB6KqMyld6s9RlPedJdZTVIAxTbZOHLI1yFnAeexdAZrnVHOz6fFOKo5JdJvM';

interface ResourceItemData {
  id: string;
  name: string;
  count: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tint: string;
  iconColor: string;
}

const STUDY_RESOURCES: ResourceItemData[] = [
  {
    id: 'bookmarks',
    name: 'Bookmarks',
    count: '142 items',
    icon: 'bookmark',
    tint: '#eaf0ff',
    iconColor: Colors.primary,
  },
  {
    id: 'flashcards',
    name: 'Flashcards',
    count: '580 cards',
    icon: 'style',
    tint: '#eef2ff',
    iconColor: '#4f46e5',
  },
  {
    id: 'downloads',
    name: 'Downloads',
    count: '12 videos',
    icon: 'download-for-offline',
    tint: '#ecfdf5',
    iconColor: '#059669',
  },
  {
    id: 'notes',
    name: 'My Notes',
    count: '34 topics',
    icon: 'sticky-note-2',
    tint: '#fffbeb',
    iconColor: '#d97706',
  },
];

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
  const [avatarError, setAvatarError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const editBtnScale = useSharedValue(1);
  const editBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: editBtnScale.value }],
  }));

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Opening candidate profile & preferences editor.');
  };

  const handleDetailedReport = () => {
    Alert.alert('Detailed Analytics', 'Opening comprehensive performance breakdown report.');
  };

  const handleResourcePress = (item: ResourceItemData) => {
    if (item.id === 'bookmarks') router.push('/bookmarks');
    else if (item.id === 'flashcards') router.push('/flashcards');
    else if (item.id === 'downloads') router.push('/downloads');
    else Alert.alert(item.name, `Opening ${item.name} study locker.`);
  };

  const handleChangeExam = () => {
    Alert.alert('Target Exam', 'Select target medical entrance examination.', [
      { text: 'FMGE (Dec 2026)', style: 'default' },
      { text: 'NEET PG 2026', style: 'default' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSubscription = () => {
    Alert.alert('DocLock Pro Pass', 'Active Subscription valid until December 2026.');
  };

  const handleReminders = () => {
    Alert.alert('Daily Study Reminders', 'Reminders currently scheduled for 07:30 AM & 09:00 PM.');
  };

  const handleLinkedDevices = () => {
    Alert.alert('Linked Devices', 'MacBook Pro • Chrome Web Active (Last synced 10m ago).');
  };

  const handleSupport = () => {
    Alert.alert('Academic Doubt Support', 'Connecting to 24/7 DocLock Medical Faculty Helpdesk.');
  };

  const handleStorage = () => {
    Alert.alert('Storage & Cache', '1.8 GB cached of 12 offline videos. Tap to clear cache.', [
      { text: 'Clear Cache', style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of DocLock?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive' },
    ]);
  };

  // Preference items list
  const accountPreferences: SettingItemData[] = useMemo(
    () => [
      {
        id: 'target_exam',
        title: 'Target Exam',
        subtitle: 'FMGE (Foreign Medical Graduate Exam)',
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
    if (!query) return STUDY_RESOURCES;
    return STUDY_RESOURCES.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.count.toLowerCase().includes(query)
    );
  }, [query]);

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
          Alert.alert('App Settings', 'DocLock Exam Prep v2.4.1\nCandidate: Alex Rivera')
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
                    <Text style={styles.targetBadgeText}>FMGE Target • Dec 2026</Text>
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
                    {!avatarError ? (
                      <Image
                        source={{ uri: CANDIDATE_AVATAR }}
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
                        Alex Rivera
                      </Text>
                      <MaterialIcons name="verified" size={18} color="#fcd34d" />
                    </View>
                    <Text style={styles.userEmail} numberOfLines={1}>
                      alex.rivera.med@gmail.com
                    </Text>
                    <View style={styles.badgeStrip}>
                      <View style={styles.proPassPill}>
                        <Text style={styles.proPassText}>PRO PASS ACTIVE</Text>
                      </View>
                      <Text style={styles.candidateId}>#DL-89421</Text>
                    </View>
                  </View>
                </View>

                {/* Metric Highlights Strip inside card */}
                <View style={styles.metricsStrip}>
                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>DAYS STREAK</Text>
                    <View style={styles.metricValRow}>
                      <MaterialIcons name="whatshot" size={16} color="#fcd34d" />
                      <Text style={styles.metricValText}>28</Text>
                    </View>
                  </View>

                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>MCQS SOLVED</Text>
                    <Text style={styles.metricValText}>3,420</Text>
                  </View>

                  <View style={styles.metricCol}>
                    <Text style={styles.metricColLabel}>AVG ACCURACY</Text>
                    <Text style={[styles.metricValText, styles.accuracyColor]}>76.4%</Text>
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
                    #412 <Text style={styles.analyticsValueSub}>/ 14.2k</Text>
                  </Text>
                  <View style={styles.greenTag}>
                    <Text style={styles.greenTagText}>Top 2.9% National</Text>
                  </View>
                </View>

                {/* Video Study Time */}
                <View style={styles.analyticsBox}>
                  <View style={styles.analyticsBoxTop}>
                    <Text style={styles.analyticsBoxLabel}>Video Study Time</Text>
                    <MaterialIcons name="play-circle" size={18} color="#4f46e5" />
                  </View>
                  <Text style={styles.analyticsValue}>
                    48.5 <Text style={styles.analyticsValueSub}>hrs</Text>
                  </Text>
                  <View style={styles.blueTag}>
                    <Text style={styles.blueTagText}>18/19 Subjects Started</Text>
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
                    subtitle: 'Sign out of Alex Rivera on this device',
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

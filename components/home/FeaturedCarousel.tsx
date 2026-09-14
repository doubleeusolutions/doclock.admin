import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DAILY_REVISION_BG =
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80';

const MOCK_EXAM_BG =
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80';

const GRAND_MOCK_BG =
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';

interface FeaturedCarouselProps {
  onStartSession?: () => void;
  onExploreMock?: () => void;
  onGrandMock?: () => void;
}

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  onStartSession,
  onExploreMock,
  onGrandMock,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = Math.min(windowWidth * 0.85, 360);
  const snapInterval = cardWidth + 14;

  const sessionBtnScale = useSharedValue(1);
  const exploreBtnScale = useSharedValue(1);
  const grandBtnScale = useSharedValue(1);

  const sessionBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sessionBtnScale.value }],
  }));

  const exploreBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: exploreBtnScale.value }],
  }));

  const grandBtnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: grandBtnScale.value }],
  }));

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Card 1: Daily Revision */}
        <View style={[styles.card, { width: cardWidth }]}>
          {/* Background Image */}
          <Image
            source={{ uri: DAILY_REVISION_BG }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />

          {/* Glassmorphic Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(203, 229, 254, 0.90)',
              'rgba(191, 226, 255, 0.85)',
              'rgba(216, 233, 253, 0.92)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Card Foreground Content */}
          <View style={styles.cardContent}>
            {/* Top content */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeGlass}>
                <MaterialIcons name="schedule" size={15} color={Colors.primary} />
                <Text style={styles.badgeTextPrimary}>20 MCQs · 12 min</Text>
              </View>

              <Text style={styles.cardTitle}>Daily Revision</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                Master 20 high-yield questions today
              </Text>
            </View>

            {/* Bottom actions */}
            <View style={styles.cardFooter}>
              <AnimatedPressable
                onPress={onStartSession}
                onPressIn={() => {
                  sessionBtnScale.value = withSpring(0.95, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  sessionBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.primaryButton, sessionBtnStyle]}
                accessibilityRole="button"
                accessibilityLabel="Start session"
              >
                <Text style={styles.primaryButtonText}>Start session</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
              </AnimatedPressable>

              <View style={styles.sparkleCircle}>
                <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
              </View>
            </View>
          </View>
        </View>

        {/* Card 2: Mock Exam Blitz */}
        <View style={[styles.card, { width: cardWidth }]}>
          {/* Background Image */}
          <Image
            source={{ uri: MOCK_EXAM_BG }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />

          {/* Glassmorphic Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(234, 240, 255, 0.90)',
              'rgba(223, 232, 254, 0.86)',
              'rgba(240, 243, 255, 0.92)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Card Foreground Content */}
          <View style={styles.cardContent}>
            {/* Top content */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeGlass}>
                <MaterialIcons name="bolt" size={15} color={Colors.secondary} />
                <Text style={styles.badgeTextSecondary}>50 MCQs · 30 min</Text>
              </View>

              <Text style={styles.cardTitle}>Mock Exam Blitz</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                Comprehensive timed challenge across domains
              </Text>
            </View>

            {/* Bottom actions */}
            <View style={styles.cardFooter}>
              <AnimatedPressable
                onPress={onExploreMock}
                onPressIn={() => {
                  exploreBtnScale.value = withSpring(0.95, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  exploreBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.secondaryButton, exploreBtnStyle]}
                accessibilityRole="button"
                accessibilityLabel="Explore mock exams"
              >
                <Text style={styles.secondaryButtonText}>Explore</Text>
                <MaterialIcons name="arrow-forward" size={18} color={Colors.onSurface} />
              </AnimatedPressable>
            </View>
          </View>
        </View>

        {/* Card 3: All-India Grand Mock */}
        <View style={[styles.card, { width: cardWidth }]}>
          {/* Background Image */}
          <Image
            source={{ uri: GRAND_MOCK_BG }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />

          {/* Glassmorphic Gradient Overlay */}
          <LinearGradient
            colors={[
              'rgba(229, 222, 255, 0.90)',
              'rgba(217, 227, 248, 0.86)',
              'rgba(240, 243, 255, 0.92)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Card Foreground Content */}
          <View style={styles.cardContent}>
            {/* Top content */}
            <View style={styles.cardHeader}>
              <View style={styles.badgeGlass}>
                <MaterialIcons name="stars" size={15} color="#5b4aba" />
                <Text style={[styles.badgeTextPrimary, { color: '#5b4aba' }]}>FMGE GT-14 · Live</Text>
              </View>

              <Text style={styles.cardTitle}>Grand Mock Series</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                All-India percentile ranking & exam simulation
              </Text>
            </View>

            {/* Bottom actions */}
            <View style={styles.cardFooter}>
              <AnimatedPressable
                onPress={onGrandMock}
                onPressIn={() => {
                  grandBtnScale.value = withSpring(0.95, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  grandBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[
                  styles.primaryButton,
                  { backgroundColor: '#5b4aba', shadowColor: '#5b4aba' },
                  grandBtnStyle,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Take grand mock"
              >
                <Text style={styles.primaryButtonText}>Take Mock</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    height: 196,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#cbe5fe',
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(217, 227, 248, 0.7)',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  cardHeader: {
    gap: 8,
  },
  badgeGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  badgeTextPrimary: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  badgeTextSecondary: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  primaryButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sparkleCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  secondaryButton: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  secondaryButtonText: {
    color: Colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
});

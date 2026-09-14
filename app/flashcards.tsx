import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {
  ACTIVE_FLASHCARDS,
  FLASHCARD_DECKS,
  FlashcardItem,
  FlashcardDeck,
} from '@/data/quickResourcesData';
import { Colors, Motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function FlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [cards, setCards] = useState<FlashcardItem[]>(ACTIVE_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedToday, setCompletedToday] = useState(14);

  // Back button animation
  const backBtnScale = useSharedValue(1);
  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  // 3D Flip animation
  const flipProgress = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipProgress.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: flipProgress.value >= 0.5 ? 0 : 1,
      zIndex: flipProgress.value >= 0.5 ? 0 : 2,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const spin = interpolate(flipProgress.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: flipProgress.value >= 0.5 ? 1 : 0,
      zIndex: flipProgress.value >= 0.5 ? 2 : 0,
    };
  });

  const handleFlipCard = () => {
    if (isFlipped) {
      flipProgress.value = withSpring(0, { damping: 15, stiffness: 90 });
      setIsFlipped(false);
    } else {
      flipProgress.value = withSpring(1, { damping: 15, stiffness: 90 });
      setIsFlipped(true);
    }
  };

  const handleRateCard = (quality: 'again' | 'hard' | 'good' | 'easy') => {
    setCompletedToday((prev) => prev + 1);

    // Reset card to front
    flipProgress.value = withSpring(0, { damping: 15, stiffness: 90 });
    setIsFlipped(false);

    // Advance to next card
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setCurrentIndex(0);
        Alert.alert(
          'Deck Review Complete! 🎉',
          'You reviewed all active recall flashcards in this session. Memory retention boosted!'
        );
      }
    }, 200);
  };

  const currentCard = cards[currentIndex];

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
            <Text style={styles.headerTitle}>Active Recall Flashcards</Text>
            <Text style={styles.headerSubtitle}>
              580 total • 42 due for review today
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              setCards((prev) => [...prev].reverse());
              setCurrentIndex(0);
              Alert.alert('Deck Shuffled', 'Cards randomized for spaced recall.');
            }}
            style={styles.iconBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Shuffle deck"
          >
            <MaterialIcons name="shuffle" size={20} color="#424752" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. STATS HERO STRIP */}
        <View style={styles.statsStrip}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🔥</Text>
            <View>
              <Text style={styles.statVal}>14 Days</Text>
              <Text style={styles.statLabel}>Study Streak</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <View>
              <Text style={styles.statVal}>42 Due</Text>
              <Text style={styles.statLabel}>Cards Today</Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>🏆</Text>
            <View>
              <Text style={styles.statVal}>88%</Text>
              <Text style={styles.statLabel}>Mastered</Text>
            </View>
          </View>
        </View>

        {/* 3. INTERACTIVE 3D FLIP FLASHCARD */}
        <View style={styles.flashcardSection}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                Card {currentIndex + 1} of {cards.length}
              </Text>
            </View>
            <Text style={styles.tapInstruction}>
              {isFlipped ? 'Tap card to see Question' : 'Tap card to Reveal Answer'}
            </Text>
          </View>

          {/* Flashcard Flip Stage */}
          <Pressable onPress={handleFlipCard} style={styles.flipStage}>
            {/* FRONT OF CARD (Question) */}
            <Animated.View style={[styles.cardFront, frontAnimatedStyle]}>
              <View style={styles.cardTagRow}>
                <View style={styles.subjectTag}>
                  <Text style={styles.subjectTagText}>
                    {currentCard.subject.toUpperCase()} • {currentCard.chapter.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {currentCard.category}
                  </Text>
                </View>
              </View>

              <View style={styles.questionCenter}>
                <MaterialIcons name="help-outline" size={28} color="#0059b9" />
                <Text style={styles.questionText}>{currentCard.question}</Text>
              </View>

              <View style={styles.flipPromptRow}>
                <MaterialIcons name="touch-app" size={16} color="#727782" />
                <Text style={styles.flipPromptText}>Tap to reveal answer</Text>
              </View>
            </Animated.View>

            {/* BACK OF CARD (Answer & Pearl) */}
            <Animated.View style={[styles.cardBack, backAnimatedStyle]}>
              <View style={styles.cardTagRow}>
                <View style={[styles.subjectTag, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.subjectTagText, { color: '#047857' }]}>
                    HIGH-YIELD ANSWER
                  </Text>
                </View>
                <MaterialIcons name="verified" size={18} color="#10b981" />
              </View>

              <View style={styles.answerCenter}>
                <Text style={styles.answerText}>{currentCard.answer}</Text>
                <View style={styles.pearlBox}>
                  <MaterialIcons name="lightbulb" size={16} color="#d97706" />
                  <Text style={styles.pearlText}>
                    {currentCard.highYieldPearl}
                  </Text>
                </View>
              </View>

              <View style={styles.flipPromptRow}>
                <MaterialIcons name="touch-app" size={16} color="#727782" />
                <Text style={styles.flipPromptText}>Tap to flip back</Text>
              </View>
            </Animated.View>
          </Pressable>

          {/* 4. SPACED REPETITION RATING BUTTONS */}
          {isFlipped && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>How well did you recall this?</Text>
              <View style={styles.ratingButtonsRow}>
                <Pressable
                  onPress={() => handleRateCard('again')}
                  style={[styles.rateBtn, styles.rateBtnAgain]}
                >
                  <Text style={styles.rateBtnTitle}>Again</Text>
                  <Text style={styles.rateBtnTime}>{'<1m'}</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleRateCard('hard')}
                  style={[styles.rateBtn, styles.rateBtnHard]}
                >
                  <Text style={styles.rateBtnTitle}>Hard</Text>
                  <Text style={styles.rateBtnTime}>12h</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleRateCard('good')}
                  style={[styles.rateBtn, styles.rateBtnGood]}
                >
                  <Text style={styles.rateBtnTitle}>Good</Text>
                  <Text style={styles.rateBtnTime}>1d</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleRateCard('easy')}
                  style={[styles.rateBtn, styles.rateBtnEasy]}
                >
                  <Text style={styles.rateBtnTitle}>Easy</Text>
                  <Text style={styles.rateBtnTime}>4d</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* 5. SUBJECT FLASHCARD DECKS */}
        <View style={styles.decksSection}>
          <Text style={styles.decksHeader}>Subject Flashcard Decks</Text>
          <View style={styles.decksGrid}>
            {FLASHCARD_DECKS.map((deck) => (
              <FlashcardDeckCard
                key={deck.id}
                deck={deck}
                onPractice={() => {
                  Alert.alert(
                    `${deck.subject} Deck`,
                    `Starting active recall session for ${deck.dueToday} due cards.`
                  );
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const FlashcardDeckCard: React.FC<{
  deck: FlashcardDeck;
  onPractice: () => void;
}> = ({ deck, onPractice }) => {
  return (
    <View style={styles.deckCard}>
      <View style={styles.deckTopRow}>
        <View style={[styles.deckIconBox, { backgroundColor: `${deck.accentColor}14` }]}>
          <MaterialIcons name={deck.icon} size={22} color={deck.accentColor} />
        </View>
        <View style={styles.dueBadge}>
          <Text style={styles.dueBadgeText}>{deck.dueToday} Due</Text>
        </View>
      </View>

      <Text style={styles.deckSubject}>{deck.subject}</Text>
      <Text style={styles.deckCountText}>{deck.totalCards} Total Flashcards</Text>

      {/* Progress */}
      <View style={styles.deckProgressBlock}>
        <View style={styles.deckProgressBg}>
          <View
            style={[
              styles.deckProgressFill,
              { width: `${deck.masteredPercent}%`, backgroundColor: deck.accentColor },
            ]}
          />
        </View>
        <Text style={styles.deckPercentText}>{deck.masteredPercent}% Mastered</Text>
      </View>

      <Pressable onPress={onPractice} style={styles.practiceBtn}>
        <Text style={styles.practiceBtnText}>Practice Deck</Text>
        <MaterialIcons name="arrow-forward" size={13} color="#0059b9" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* 1. Header */
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
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f4fb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Scroll Area */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 16,
  },

  /* 2. Stats Strip */
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statEmoji: {
    fontSize: 22,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c22',
  },
  statLabel: {
    fontSize: 11,
    color: '#727782',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e8ecf4',
  },

  /* 3. Flashcard Section */
  flashcardSection: {
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  counterBadge: {
    backgroundColor: '#e7eeff',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  counterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0059b9',
  },
  tapInstruction: {
    fontSize: 11.5,
    color: '#727782',
  },

  /* 3D Flip Stage */
  flipStage: {
    height: 250,
    position: 'relative',
  },
  cardFront: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#e2e7f2',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardBack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#10b981',
    justifyContent: 'space-between',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subjectTag: {
    backgroundColor: '#f1f4fb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0059b9',
    letterSpacing: 0.4,
  },
  categoryBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
  },
  questionCenter: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181c22',
    textAlign: 'center',
    lineHeight: 22,
  },
  answerCenter: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 6,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#047857',
    textAlign: 'center',
    lineHeight: 22,
  },
  pearlBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pearlText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 16,
    flex: 1,
  },
  flipPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  flipPromptText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#8a92a6',
  },

  /* 4. Rating Buttons */
  ratingSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    gap: 10,
  },
  ratingTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181c22',
    textAlign: 'center',
  },
  ratingButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rateBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  rateBtnAgain: {
    backgroundColor: '#fee2e2',
  },
  rateBtnHard: {
    backgroundColor: '#fef3c7',
  },
  rateBtnGood: {
    backgroundColor: '#e0f2fe',
  },
  rateBtnEasy: {
    backgroundColor: '#dcfce7',
  },
  rateBtnTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  rateBtnTime: {
    fontSize: 10,
    fontWeight: '600',
    color: '#575f6e',
  },

  /* 5. Decks Section */
  decksSection: {
    gap: 10,
  },
  decksHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c22',
    marginLeft: 4,
  },
  decksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  deckCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    gap: 8,
  },
  deckTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deckIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dueBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
  },
  dueBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#b91c1c',
  },
  deckSubject: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181c22',
  },
  deckCountText: {
    fontSize: 11,
    color: '#727782',
  },
  deckProgressBlock: {
    gap: 4,
  },
  deckProgressBg: {
    height: 5,
    backgroundColor: '#f1f4fb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  deckProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  deckPercentText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#575f6e',
  },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#eef4ff',
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 2,
  },
  practiceBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0059b9',
  },
});

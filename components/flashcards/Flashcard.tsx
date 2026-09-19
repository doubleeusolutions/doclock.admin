import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/theme';

export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
  high_yield_pearl: string;
  image_url?: string | null;
}

interface FlashcardProps {
  card: FlashcardData;
  isFlipped: boolean;
  onFlip: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped, onFlip }) => {
  const flipAnim = useSharedValue(0);

  useEffect(() => {
    flipAnim.value = withSpring(isFlipped ? 180 : 0, {
      mass: 1,
      damping: 15,
      stiffness: 120,
    });
  }, [isFlipped, flipAnim]);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 180], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipAnim.value, [89, 90], [1, 0], Extrapolation.CLAMP),
      zIndex: isFlipped ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 180], [-180, 0], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
      opacity: interpolate(flipAnim.value, [89, 90], [0, 1], Extrapolation.CLAMP),
      zIndex: isFlipped ? 1 : 0,
    };
  });

  return (
    <View style={styles.container}>
      {/* FRONT OF CARD */}
      <AnimatedPressable style={[styles.card, frontAnimatedStyle]} onPress={onFlip}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSideText}>QUESTION</Text>
          <MaterialIcons name="touch-app" size={16} color={Colors.outline} />
        </View>
        <View style={styles.cardContent}>
          {card.image_url && (
            <Image source={{ uri: card.image_url }} style={styles.cardImage} resizeMode="contain" />
          )}
          <Text style={styles.questionText}>{card.question}</Text>
        </View>
      </AnimatedPressable>

      {/* BACK OF CARD */}
      <AnimatedPressable style={[styles.card, styles.cardBack, backAnimatedStyle]} onPress={onFlip}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardSideText}>ANSWER</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.answerText}>{card.answer}</Text>
          
          <View style={styles.pearlBox}>
            <View style={styles.pearlHeader}>
              <MaterialIcons name="star" size={16} color="#eab308" />
              <Text style={styles.pearlTitle}>High-Yield Pearl</Text>
            </View>
            <Text style={styles.pearlText}>{card.high_yield_pearl}</Text>
          </View>
        </View>
      </AnimatedPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: 16,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: '#f8fafc',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardSideText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.outline,
    letterSpacing: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 200,
    marginBottom: 24,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 32,
  },
  answerText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  pearlBox: {
    width: '100%',
    backgroundColor: '#fefce8',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef08a',
  },
  pearlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  pearlTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854d0e',
  },
  pearlText: {
    fontSize: 15,
    color: '#713f12',
    lineHeight: 22,
  },
});

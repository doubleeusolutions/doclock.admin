import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Flashcard, FlashcardData } from '@/components/flashcards/Flashcard';
import { Colors } from '@/theme';

export default function FlashcardStudyScreen() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [cards, setCards] = useState<FlashcardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        // Ideally we fetch based on `user_flashcard_reviews.next_review_date` <= today
        // For MVP, we just fetch all cards in the deck
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('deck_id', deckId);
          
        if (error) throw error;
        setCards(data || []);
      } catch (err) {
        console.error('Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [deckId]);

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = cards[currentIndex];
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Very simplified SM-2 logic for MVP
        const intervalDays = rating === 'again' ? 0 : rating === 'hard' ? 1 : rating === 'good' ? 3 : 7;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + intervalDays);

        await supabase.from('user_flashcard_reviews').upsert({
          user_id: userData.user.id,
          flashcard_id: currentCard.id,
          rating,
          interval_days: intervalDays,
          next_review_date: nextDate.toISOString().split('T')[0],
        }, { onConflict: 'user_id,flashcard_id' });
      }
    } catch (e) {
      console.error('Rating error:', e);
    }

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150); // slight delay for flip reset
    } else {
      // Finished deck
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={[styles.screen, styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="done-all" size={64} color={Colors.outline} />
        <Text style={styles.emptyText}>You've mastered this deck!</Text>
        <Text style={styles.emptySub}>No cards due for review right now.</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerIconBtn}>
          <MaterialIcons name="close" size={24} color={Colors.onSurface} />
        </Pressable>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{currentIndex + 1} / {cards.length}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>
        <View style={styles.headerIconBtn} />
      </View>

      {/* FLASHCARD STAGE */}
      <View style={styles.stage}>
        <Flashcard
          key={currentCard.id} // force remount/reset state if needed, though state is managed here
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </View>

      {/* BOTTOM CONTROLS */}
      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        {!isFlipped ? (
          <Pressable style={styles.showAnswerBtn} onPress={() => setIsFlipped(true)}>
            <Text style={styles.showAnswerText}>Show Answer</Text>
          </Pressable>
        ) : (
          <View style={styles.ratingRow}>
            <RateButton label="Again" time="< 1m" color="#ef4444" onPress={() => handleRate('again')} />
            <RateButton label="Hard" time="1d" color="#f97316" onPress={() => handleRate('hard')} />
            <RateButton label="Good" time="3d" color="#10b981" onPress={() => handleRate('good')} />
            <RateButton label="Easy" time="7d" color="#3b82f6" onPress={() => handleRate('easy')} />
          </View>
        )}
      </View>
    </View>
  );
}

const RateButton: React.FC<{ label: string; time: string; color: string; onPress: () => void }> = ({ label, time, color, onPress }) => (
  <Pressable style={styles.rateBtn} onPress={onPress}>
    <Text style={[styles.rateLabel, { color }]}>{label}</Text>
    <Text style={styles.rateTime}>{time}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { marginTop: 16, fontSize: 20, fontWeight: '700', color: Colors.onSurface },
  emptySub: { marginTop: 8, fontSize: 14, color: Colors.onSurfaceVariant },
  backBtn: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerIconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { flex: 1, alignItems: 'center', marginHorizontal: 16 },
  progressText: { fontSize: 12, fontWeight: '700', color: Colors.onSurfaceVariant, marginBottom: 8 },
  progressBarBg: { width: '100%', height: 6, backgroundColor: Colors.outlineVariant, borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },

  stage: { flex: 1, width: '100%' },
  
  bottomControls: { paddingHorizontal: 24, paddingTop: 16 },
  showAnswerBtn: { width: '100%', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  showAnswerText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  rateBtn: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: Colors.outlineVariant, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  rateLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  rateTime: { fontSize: 11, color: Colors.onSurfaceVariant, fontWeight: '600' },
});

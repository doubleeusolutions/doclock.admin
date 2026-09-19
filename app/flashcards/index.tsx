import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/theme';

interface FlashcardDeck {
  id: string;
  subject_name: string;
  icon_name: string;
  accent_color: string;
}

export default function FlashcardsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const { data, error } = await supabase.from('flashcard_decks').select('*');
        if (error) throw error;
        setDecks(data || []);
      } catch (err) {
        console.error('Error fetching decks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDecks();
  }, []);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.headerTitle}>Spaced Repetition Decks</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : decks.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="psychology" size={64} color={Colors.outline} />
          <Text style={styles.emptyText}>No flashcard decks available yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {decks.map(deck => (
            <Pressable
              key={deck.id}
              style={styles.deckCard}
              onPress={() => router.push(`/flashcards/${deck.id}` as any)}
            >
              <View style={[styles.deckIcon, { backgroundColor: `${deck.accent_color}20` }]}>
                <MaterialIcons name={deck.icon_name as any || 'brain'} size={28} color={deck.accent_color} />
              </View>
              <View style={styles.deckInfo}>
                <Text style={styles.deckTitle}>{deck.subject_name}</Text>
                <Text style={styles.deckSubtitle}>Tap to start reviewing</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={Colors.outline} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.onSurface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { marginTop: 16, fontSize: 16, color: Colors.onSurfaceVariant, textAlign: 'center' },
  scrollContent: { padding: 16, gap: 12 },
  deckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
    elevation: 2,
  },
  deckIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  deckInfo: { flex: 1 },
  deckTitle: { fontSize: 16, fontWeight: '700', color: Colors.onSurface },
  deckSubtitle: { fontSize: 13, color: Colors.onSurfaceVariant, marginTop: 4 },
});

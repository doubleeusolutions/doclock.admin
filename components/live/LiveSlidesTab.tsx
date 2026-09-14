import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LiveClassSession } from '@/data/liveClassesData';
import { Colors } from '@/theme';

interface LiveSlidesTabProps {
  session: LiveClassSession;
}

interface SlideItem {
  id: number;
  title: string;
  subtitle: string;
  isCurrent: boolean;
  thumbnailUrl: string;
}

const SLIDES_DECK: SlideItem[] = [
  {
    id: 12,
    title: 'Cardiac Action Potential: Phases 0-4 Ion Channels',
    subtitle: 'INa, ICa-L, IKr, IK1 electrophysiology',
    isCurrent: false,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 13,
    title: 'Vaughan-Williams Classification Matrix',
    subtitle: 'Class I (Na+), Class II (Beta), Class III (K+), Class IV (Ca2+)',
    isCurrent: false,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 14,
    title: 'Class I Kinetics: State-Dependent & Use-Dependent Blockade',
    subtitle: 'Dissociation rates: 1B (Fast) < 1A (Intermediate) < 1C (Slow)',
    isCurrent: true,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 15,
    title: 'Amiodarone Organ Toxicities & Monitoring Protocol',
    subtitle: 'Pulmonary fibrosis, Thyroid dysfunction, Corneal microdeposits',
    isCurrent: false,
    thumbnailUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=500&auto=format&fit=crop&q=80',
  },
];

export const LiveSlidesTab: React.FC<LiveSlidesTabProps> = ({ session }) => {
  const [checkedPearls, setCheckedPearls] = useState<Record<number, boolean>>({});

  const togglePearl = (index: number) => {
    setCheckedPearls((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleDownloadDeck = () => {
    Alert.alert(
      'Download Slide Deck',
      'Downloading "Rapid Recall Antiarrhythmics - Dr. Marcus Vance (Live Notes Annotations).pdf" [6.4 MB]...',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Current Active Slide Card */}
      <View style={styles.activeSlideCard}>
        <View style={styles.activeSlideHeader}>
          <View style={styles.liveSlideTag}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveSlideTagText}>FACULTY PRESENTING NOW</Text>
          </View>
          <Text style={styles.slideCounterText}>Slide 14 of 36</Text>
        </View>

        <Image
          source={{ uri: SLIDES_DECK[2].thumbnailUrl }}
          style={styles.slideHeroImg}
          resizeMode="cover"
        />

        <View style={styles.slideMeta}>
          <Text style={styles.slideTitle}>{SLIDES_DECK[2].title}</Text>
          <Text style={styles.slideSubtitle}>{SLIDES_DECK[2].subtitle}</Text>
        </View>

        <Pressable
          onPress={handleDownloadDeck}
          style={styles.downloadBtn}
          accessibilityRole="button"
          accessibilityLabel="Download slide deck"
        >
          <MaterialIcons name="file-download" size={16} color="#0059b9" />
          <Text style={styles.downloadBtnText}>
            Download Annotated PDF (6.4 MB)
          </Text>
        </Pressable>
      </View>

      {/* Key Clinical Pearls Checklist */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>High-Yield Lecture Takeaways</Text>
        <View style={styles.pearlsList}>
          {session.keyTopics.map((topic, idx) => {
            const isChecked = !!checkedPearls[idx];
            return (
              <Pressable
                key={idx}
                onPress={() => togglePearl(idx)}
                style={[
                  styles.pearlItem,
                  isChecked && styles.pearlItemChecked,
                ]}
              >
                <MaterialIcons
                  name={isChecked ? 'check-circle' : 'radio-button-unchecked'}
                  size={18}
                  color={isChecked ? '#0059b9' : '#8a92a6'}
                />
                <Text
                  style={[
                    styles.pearlText,
                    isChecked && styles.pearlTextChecked,
                  ]}
                >
                  {topic}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Slide Deck Navigation strip */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>Slide Deck Index</Text>
        <View style={styles.deckList}>
          {SLIDES_DECK.map((slide) => (
            <View
              key={slide.id}
              style={[
                styles.deckRow,
                slide.isCurrent && styles.deckRowCurrent,
              ]}
            >
              <Image
                source={{ uri: slide.thumbnailUrl }}
                style={styles.deckThumb}
              />
              <View style={styles.deckInfo}>
                <View style={styles.deckNumberRow}>
                  <Text style={styles.deckNumber}>Slide {slide.id}</Text>
                  {slide.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>PRESENTING</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.deckTitle} numberOfLines={1}>
                  {slide.title}
                </Text>
                <Text style={styles.deckSub} numberOfLines={1}>
                  {slide.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9ff',
  },
  content: {
    padding: 14,
    gap: 16,
    paddingBottom: 24,
  },

  /* Active Slide */
  activeSlideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  activeSlideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveSlideTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284c7',
  },
  liveSlideTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0369a1',
    letterSpacing: 0.4,
  },
  slideCounterText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#727782',
  },
  slideHeroImg: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    backgroundColor: '#121c2b',
  },
  slideMeta: {
    gap: 3,
  },
  slideTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c22',
  },
  slideSubtitle: {
    fontSize: 12,
    color: '#575f6e',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0f5ff',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  downloadBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0059b9',
  },

  /* Section Block */
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#424752',
    marginLeft: 4,
  },
  pearlsList: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8ecf4',
    padding: 8,
    gap: 6,
  },
  pearlItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
  },
  pearlItemChecked: {
    backgroundColor: '#f0fdf4',
  },
  pearlText: {
    fontSize: 12.5,
    lineHeight: 18,
    color: '#2d333e',
    flex: 1,
  },
  pearlTextChecked: {
    color: '#15803d',
    textDecorationLine: 'line-through',
  },

  /* Deck List */
  deckList: {
    gap: 8,
  },
  deckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },
  deckRowCurrent: {
    borderColor: '#0059b9',
    backgroundColor: '#f6f9ff',
  },
  deckThumb: {
    width: 60,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
  },
  deckInfo: {
    flex: 1,
    gap: 2,
  },
  deckNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deckNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#727782',
  },
  currentBadge: {
    backgroundColor: '#0059b9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  deckTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#181c22',
  },
  deckSub: {
    fontSize: 11,
    color: '#575f6e',
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';
import { AttemptMode } from '@/data/mcqData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ModeSelectionModalProps {
  visible: boolean;
  topicTitle: string;
  subjectName: string;
  mcqCount: number;
  durationMinutes: number;
  onClose: () => void;
  onStart: (mode: AttemptMode) => void;
}

interface ModeCardOption {
  id: AttemptMode;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  badge?: string;
  badgeColor?: string;
}

const MODE_OPTIONS: ModeCardOption[] = [
  {
    id: 'practice',
    title: 'Practice Mode',
    subtitle: 'Instant answer verification, strike-through tool, peer statistics & clinical pearls.',
    icon: 'psychology',
    badge: 'RECOMMENDED',
    badgeColor: '#0059b9',
  },
  {
    id: 'exam',
    title: 'Timed Exam Mode',
    subtitle: 'Strict countdown timer, unrevealed options & question palette. Result shown on submit.',
    icon: 'timer',
    badge: 'EXAM SIMULATION',
    badgeColor: '#ba1a1a',
  },
  {
    id: 'study',
    title: 'Study / Flashcard Mode',
    subtitle: 'Immediate access to explanations & golden pearls without scoring pressure.',
    icon: 'menu-book',
    badge: 'RAPID REVISION',
    badgeColor: '#065f46',
  },
];

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  visible,
  topicTitle,
  subjectName,
  mcqCount,
  durationMinutes,
  onClose,
  onStart,
}) => {
  const [selectedMode, setSelectedMode] = useState<AttemptMode>('practice');

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modalCard}>
        {/* Top Handle Bar */}
        <View style={styles.topHandle} />

        {/* Modal Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <View style={styles.subjectBadge}>
              <Text style={styles.subjectBadgeText}>{subjectName.toUpperCase()}</Text>
            </View>
            <Text style={styles.titleText} numberOfLines={2}>
              {topicTitle}
            </Text>
            <Text style={styles.specText}>
              {mcqCount} Questions • ~{durationMinutes} mins • High-Yield Qbank
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close dialog"
          >
            <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Mode Selector Instruction */}
        <Text style={styles.sectionHeading}>Select Attempting Model (Mode):</Text>

        {/* Modes List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modeListContent}
        >
          {MODE_OPTIONS.map((opt) => {
            const isSelected = selectedMode === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setSelectedMode(opt.id)}
                style={[
                  styles.modeCard,
                  isSelected && styles.modeCardSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={styles.modeCardLeft}>
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <MaterialIcons
                      name={opt.icon}
                      size={22}
                      color={isSelected ? '#ffffff' : Colors.primary}
                    />
                  </View>
                </View>

                <View style={styles.modeCardMiddle}>
                  <View style={styles.modeTitleRow}>
                    <Text
                      style={[
                        styles.modeTitle,
                        isSelected && styles.modeTitleSelected,
                      ]}
                    >
                      {opt.title}
                    </Text>
                    {opt.badge && (
                      <View
                        style={[
                          styles.modeBadge,
                          { backgroundColor: isSelected ? '#d7e2ff' : '#f0f3ff' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modeBadgeText,
                            { color: opt.badgeColor || Colors.primary },
                          ]}
                        >
                          {opt.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.modeSubtitle}>{opt.subtitle}</Text>
                </View>

                <View style={styles.modeCardRight}>
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Bottom Action CTAs */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={onClose}
            style={styles.cancelBtn}
            accessibilityRole="button"
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>

          <Pressable
            onPress={() => onStart(selectedMode)}
            style={styles.startBtnWrap}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#0059b9', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startBtnGradient}
            >
              <Text style={styles.startBtnText}>Start Attempt</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 28, 43, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    zIndex: 9998,
    elevation: 25,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#121c2b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 30,
    zIndex: 10,
  },
  topHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d9e3f8',
    alignSelf: 'center',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#d7e2ff',
    marginBottom: 6,
  },
  subjectBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#004591',
    letterSpacing: 0.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  specText: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f0f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  modeListContent: {
    gap: 10,
    paddingBottom: 4,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(231, 238, 255, 0.9)',
    backgroundColor: '#fafbff',
  },
  modeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#f3f7ff',
  },
  modeCardLeft: {
    marginRight: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d7e2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: Colors.primary,
  },
  modeCardMiddle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  modeTitleSelected: {
    color: Colors.primary,
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  modeSubtitle: {
    fontSize: 11.5,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
  },
  modeCardRight: {
    flexShrink: 0,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#c2c6d5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(231, 238, 255, 0.8)',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  startBtnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});

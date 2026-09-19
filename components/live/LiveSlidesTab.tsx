import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LiveClassSession } from '@/data/liveClassesData';
import { Colors } from '@/theme';

interface LiveSlidesTabProps {
  session: LiveClassSession;
}

export const LiveSlidesTab: React.FC<LiveSlidesTabProps> = ({ session }) => {
  const [checkedTopics, setCheckedTopics] = useState<Record<number, boolean>>({});

  const toggleTopic = (index: number) => {
    setCheckedTopics((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const keyTopics = session.keyTopics || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Session Slide Deck Overview */}
      <View style={styles.deckCard}>
        <View style={styles.deckHeader}>
          <View style={styles.deckIconBadge}>
            <MaterialIcons name="slideshow" size={20} color={Colors.primary} />
          </View>
          <View style={styles.deckTextCol}>
            <Text style={styles.deckTitle}>{session.title}</Text>
            <Text style={styles.deckSubtitle}>
              {session.subject} • {session.chapter}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Download Lecture Notes',
              'Lecture slide handout will be available after the session ends.'
            )
          }
          style={styles.downloadBtn}
          accessibilityRole="button"
          accessibilityLabel="Download slides PDF"
        >
          <MaterialIcons name="download" size={16} color="#ffffff" />
          <Text style={styles.downloadBtnText}>Handout PDF</Text>
        </Pressable>
      </View>

      {/* Key Presentation Topics from Database */}
      <View style={styles.sectionBlock}>
        <Text style={styles.sectionHeader}>Key Discussion Points & Objectives</Text>

        {keyTopics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="article" size={32} color={Colors.onSurfaceVariant} />
            <Text style={styles.emptyText}>No syllabus slides uploaded for this session yet.</Text>
          </View>
        ) : (
          keyTopics.map((topic, index) => {
            const isChecked = !!checkedTopics[index];
            return (
              <Pressable
                key={index}
                onPress={() => toggleTopic(index)}
                style={[styles.topicItem, isChecked && styles.topicItemChecked]}
              >
                <MaterialIcons
                  name={isChecked ? 'check-circle' : 'radio-button-unchecked'}
                  size={20}
                  color={isChecked ? '#10b981' : '#9ca3af'}
                />
                <Text
                  style={[styles.topicText, isChecked && styles.topicTextChecked]}
                >
                  {topic}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  deckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e7f0',
    gap: 12,
  },
  deckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eaf0ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckTextCol: {
    flex: 1,
    gap: 2,
  },
  deckTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1f2937',
  },
  deckSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  downloadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4b5563',
    marginLeft: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  topicItemChecked: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  topicText: {
    fontSize: 13.5,
    color: '#374151',
    flex: 1,
    lineHeight: 19,
  },
  topicTextChecked: {
    color: '#065f46',
    textDecorationLine: 'line-through',
  },
});

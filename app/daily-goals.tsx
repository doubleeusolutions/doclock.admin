import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native';
import { DailyGoalTask } from '@/data/quickResourcesData';
import { Colors, Motion } from '@/theme';
import { useDailyGoals } from '@/hooks/useDailyGoals';
import { useAlert } from '@/contexts/AlertContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DailyGoalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showAlert } = useAlert();
  const { tasks, weeklyActivity, toggleTask, addCustomGoal, loading } = useDailyGoals();

  // Back button animation
  const backBtnScale = useSharedValue(1);
  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const completedCount = useMemo(
    () => tasks.filter((t) => t.isCompleted).length,
    [tasks]
  );
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddGoal = () => {
    showAlert({
      title: 'Add Daily Study Goal',
      message: 'Select a high-yield study task to schedule for today.',
      type: 'select',
      icon: 'add-task',
      options: [
        {
          label: '20 Microbiology MCQs',
          value: 'microbiology',
          badge: 'High-Yield',
          subtitle: 'Bacteriology & Virology recall drill',
        },
        {
          label: '15 Pharmacology MCQs',
          value: 'pharmacology',
          badge: 'High-Yield',
          subtitle: 'Antimicrobials & ANS mechanisms',
        },
        {
          label: '1 Anatomy Video Lecture',
          value: 'anatomy',
          subtitle: 'Upper Limb brachial plexus class',
        },
      ],
      selectedOptionValue: 'microbiology',
      confirmText: 'Add to Today',
      cancelText: 'Cancel',
      onConfirm: (val) => {
        if (val === 'anatomy') {
          addCustomGoal({
            title: 'Upper Limb Clinical Anatomy Class',
            category: 'video',
            targetCount: 1,
            unit: 'Video',
            timeEstimateMins: 45,
            icon: 'accessibility',
            color: '#0059b9',
          });
        } else if (val === 'pharmacology') {
          addCustomGoal({
            title: 'Pharmacology High-Yield Recall Drill',
            category: 'mcq',
            targetCount: 15,
            unit: 'MCQs',
            timeEstimateMins: 20,
            icon: 'medication',
            color: '#006780',
          });
        } else {
          addCustomGoal({
            title: 'Microbiology High-Yield MCQs (Bacteriology)',
            category: 'mcq',
            targetCount: 20,
            unit: 'MCQs',
            timeEstimateMins: 30,
            icon: 'coronavirus',
            color: '#059669',
          });
        }
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 12, color: Colors.onSurfaceVariant, fontSize: 13 }}>
          Loading daily study goals...
        </Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Daily Study Goals</Text>
            <Text style={styles.headerSubtitle}>
              {completedCount} of {totalCount} goals completed today
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Pressable
            onPress={handleAddGoal}
            style={styles.addHeaderBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Add study goal"
          >
            <MaterialIcons name="add" size={20} color="#0059b9" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. TODAY'S PROGRESS HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroGreeting}>Today's Revision Plan</Text>
              <Text style={styles.heroDate}>Sunday, September 14 • 5h Target</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>18 Day Streak</Text>
            </View>
          </View>

          {/* Progress Metrics Bar */}
          <View style={styles.progressMetricSection}>
            <View style={styles.metricTextsRow}>
              <Text style={styles.metricTargetDone}>
                {completedCount} of {totalCount} Targets Done
              </Text>
              <Text style={styles.metricPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent}%` },
                ]}
              />
            </View>
          </View>

          {/* Time & Stat Badges */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatBox}>
              <MaterialIcons name="timer" size={16} color="#0059b9" />
              <Text style={styles.heroStatText}>
                3h 45m logged <Text style={styles.heroStatSub}>/ 5h target</Text>
              </Text>
            </View>
            <View style={styles.heroStatBox}>
              <MaterialIcons name="local-fire-department" size={16} color="#ef4444" />
              <Text style={styles.heroStatText}>
                850 XP earned today
              </Text>
            </View>
          </View>
        </View>

        {/* 3. WEEKLY CONSISTENCY HEATMAP */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Weekly Study Consistency</Text>
            <Text style={styles.sectionSubText}>4.2h avg / day</Text>
          </View>

          <View style={styles.weekGrid}>
            {weeklyActivity.map((item) => (
              <View
                key={item.dayName}
                style={[
                  styles.dayCard,
                  item.isToday && styles.dayCardToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayNameText,
                    item.isToday && styles.dayNameTextToday,
                  ]}
                >
                  {item.dayName}
                </Text>
                <Text
                  style={[
                    styles.dateNumText,
                    item.isToday && styles.dateNumTextToday,
                  ]}
                >
                  {item.dateNumber}
                </Text>

                {/* Vertical Bar */}
                <View style={styles.dayBarBg}>
                  <View
                    style={[
                      styles.dayBarFill,
                      {
                        height: `${item.percent}%`,
                        backgroundColor:
                          item.percent === 100
                            ? '#10b981'
                            : item.isToday
                            ? '#0059b9'
                            : '#60a5fa',
                      },
                    ]}
                  />
                </View>

                <Text style={styles.dayHoursText}>{item.hoursSpent}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 4. TODAY'S TARGET CHECKLIST */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Milestone Checklist</Text>
            <Pressable onPress={handleAddGoal}>
              <Text style={styles.addGoalLink}>+ Add Target</Text>
            </Pressable>
          </View>

          <View style={styles.tasksList}>
            {tasks.length === 0 ? (
              <View style={styles.emptyTasksBox}>
                <MaterialIcons name="flag" size={40} color={Colors.primary} />
                <Text style={styles.emptyTasksTitle}>No Goals Set For Today</Text>
                <Text style={styles.emptyTasksSubtitle}>
                  Set custom targets for MCQs or video classes to stay on track.
                </Text>
                <Pressable onPress={handleAddGoal} style={styles.addGoalBtn}>
                  <Text style={styles.addGoalBtnText}>Set First Target</Text>
                </Pressable>
              </View>
            ) : (
              tasks.map((task) => (
                <Pressable
                  key={task.id}
                  onPress={() => toggleTask(task.id)}
                  style={[
                    styles.taskCard,
                    task.isCompleted && styles.taskCardCompleted,
                  ]}
                >
                  <MaterialIcons
                    name={
                      task.isCompleted
                        ? 'check-circle'
                        : 'radio-button-unchecked'
                    }
                    size={22}
                    color={task.isCompleted ? '#0059b9' : '#8a92a6'}
                  />

                  <View style={styles.taskInfo}>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.isCompleted && styles.taskTitleCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                    <View style={styles.taskMetaRow}>
                      <Text style={styles.taskProgressText}>
                        {task.completedCount} / {task.targetCount} {task.unit}
                      </Text>
                      <Text style={styles.taskDivider}>•</Text>
                      <Text style={styles.taskEstText}>
                        ~{task.timeEstimateMins} mins
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.categoryIconBox,
                      { backgroundColor: `${task.color}14` },
                    ]}
                  >
                    <MaterialIcons
                      name={task.icon}
                      size={16}
                      color={task.color}
                    />
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

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
  addHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e7eeff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Main Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    gap: 16,
  },

  /* 2. Hero Card */
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroGreeting: {
    fontSize: 16,
    fontWeight: '700',
    color: '#181c22',
  },
  heroDate: {
    fontSize: 12,
    color: '#575f6e',
    marginTop: 2,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#c2410c',
  },

  /* Progress Metric Section */
  progressMetricSection: {
    gap: 8,
  },
  metricTextsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricTargetDone: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181c22',
  },
  metricPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0059b9',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#f1f4fb',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0059b9',
    borderRadius: 5,
  },

  /* Hero Stats Row */
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f4fb',
  },
  heroStatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#2d333e',
  },
  heroStatSub: {
    color: '#8a92a6',
    fontWeight: '400',
  },

  /* 3. Section Block */
  sectionBlock: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181c22',
  },
  sectionSubText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0059b9',
  },
  addGoalLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0059b9',
  },

  /* Week Grid */
  weekGrid: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  dayCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8ecf4',
    gap: 6,
  },
  dayCardToday: {
    borderColor: '#0059b9',
    backgroundColor: '#f6f9ff',
  },
  dayNameText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#727782',
  },
  dayNameTextToday: {
    color: '#0059b9',
    fontWeight: '800',
  },
  dateNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#181c22',
  },
  dateNumTextToday: {
    color: '#0059b9',
  },
  dayBarBg: {
    width: 6,
    height: 38,
    backgroundColor: '#f1f4fb',
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 3,
  },
  dayHoursText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#575f6e',
  },

  /* 4. Tasks List */
  tasksList: {
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  taskCardCompleted: {
    backgroundColor: '#f8fafc',
    borderColor: '#e8ecf4',
  },
  taskInfo: {
    flex: 1,
    gap: 3,
  },
  taskTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#181c22',
    lineHeight: 18,
  },
  taskTitleCompleted: {
    color: '#727782',
    textDecorationLine: 'line-through',
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0059b9',
  },
  taskDivider: {
    fontSize: 10,
    color: '#cbd5e1',
  },
  taskEstText: {
    fontSize: 11,
    color: '#8a92a6',
  },
  categoryIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTasksBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e7f2',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTasksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#181c22',
  },
  emptyTasksSubtitle: {
    fontSize: 12.5,
    color: '#727782',
    textAlign: 'center',
    lineHeight: 18,
  },
  addGoalBtn: {
    marginTop: 6,
    backgroundColor: '#0059b9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  addGoalBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});

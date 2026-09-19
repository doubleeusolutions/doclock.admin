import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { DailyGoalTask, DayActivity } from '@/data/quickResourcesData';

export function useDailyGoals() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DailyGoalTask[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setWeeklyActivity([]);
      return;
    }
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [{ data: goalsData }, { data: activityData }] = await Promise.all([
        supabase
          .from('user_daily_goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('goal_date', today)
          .order('created_at', { ascending: true }),
        supabase
          .from('user_study_activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('log_date', { ascending: true })
          .limit(7),
      ]);

      if (goalsData && goalsData.length > 0) {
        setTasks(
          goalsData.map((g: any) => ({
            id: g.id,
            title: g.title,
            category: g.category,
            targetCount: g.target_count,
            completedCount: g.completed_count,
            unit: g.unit,
            isCompleted: g.is_completed,
            timeEstimateMins: g.time_estimate_mins,
            icon: g.icon_name || 'check-circle',
            color: g.color || '#0059b9',
          }))
        );
      } else {
        setTasks([]);
      }

      if (activityData && activityData.length > 0) {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        setWeeklyActivity(
          activityData.map((a: any) => {
            const dateObj = new Date(a.log_date);
            const dayName = dayNames[dateObj.getDay()];
            return {
              dayName,
              dateNumber: dateObj.getDate(),
              percent: a.completion_percentage || 0,
              hoursSpent: a.hours_spent ? `${a.hours_spent}h` : '0h',
              isToday: a.log_date === today,
            };
          })
        );
      } else {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const emptyDays: DayActivity[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          emptyDays.push({
            dayName: dayNames[d.getDay()],
            dateNumber: d.getDate(),
            percent: 0,
            hoursSpent: '0h',
            isToday: dStr === today,
          });
        }
        setWeeklyActivity(emptyDays);
      }
    } catch (err) {
      console.warn('[useDailyGoals] fetchGoals error:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleTask = useCallback(
    async (id: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            const nextCompleted = !t.isCompleted;
            const updated = {
              ...t,
              isCompleted: nextCompleted,
              completedCount: nextCompleted ? t.targetCount : 0,
            };

            if (user) {
              supabase
                .from('user_daily_goals')
                .update({
                  is_completed: nextCompleted,
                  completed_count: updated.completedCount,
                })
                .eq('id', id)
                .eq('user_id', user.id)
                .then();
            }

            return updated;
          }
          return t;
        })
      );
    },
    [user]
  );

  const addCustomGoal = useCallback(
    async (goal: Omit<DailyGoalTask, 'id' | 'isCompleted' | 'completedCount'>) => {
      const tempId = `goal-${Date.now()}`;
      const newTask: DailyGoalTask = {
        ...goal,
        id: tempId,
        completedCount: 0,
        isCompleted: false,
      };

      setTasks((prev) => [...prev, newTask]);

      if (user) {
        const today = new Date().toISOString().split('T')[0];
        try {
          const { data } = await supabase
            .from('user_daily_goals')
            .insert({
              user_id: user.id,
              goal_date: today,
              title: goal.title,
              category: goal.category,
              target_count: goal.targetCount,
              completed_count: 0,
              unit: goal.unit,
              is_completed: false,
              time_estimate_mins: goal.timeEstimateMins,
              icon_name: goal.icon,
              color: goal.color,
            })
            .select()
            .single();

          if (data) {
            setTasks((prev) => prev.map((t) => (t.id === tempId ? { ...t, id: data.id } : t)));
          }
        } catch (e) {
          console.error('[useDailyGoals] Error adding goal:', e);
        }
      }
    },
    [user]
  );

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  return {
    tasks,
    weeklyActivity,
    loading,
    toggleTask,
    addCustomGoal,
    refetchGoals: fetchGoals,
  };
}

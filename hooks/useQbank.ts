import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { QbankSubject } from '@/data/qbankData';
import { SubjectDetail } from '@/data/chaptersData';
import { MCQQuestion, SessionResult } from '@/data/mcqData';

export function useQbank() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<QbankSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [
        { data: subjectsData, error: fetchErr },
        { data: chaptersData },
        { data: topicsData },
        { data: questionsData },
      ] = await Promise.all([
        supabase.from('subjects').select('*').order('name', { ascending: true }),
        supabase.from('chapters').select('id, subject_id'),
        supabase.from('topics').select('id, chapter_id'),
        supabase.from('mcq_questions').select('id, topic_id'),
      ]);

      if (fetchErr) {
        throw fetchErr;
      }

      if (!subjectsData || subjectsData.length === 0) {
        setSubjects([]);
      } else {
        // Group chapters by subject_id
        const chaptersBySubject: Record<string, string[]> = {};
        (chaptersData || []).forEach((c: any) => {
          if (!chaptersBySubject[c.subject_id]) chaptersBySubject[c.subject_id] = [];
          chaptersBySubject[c.subject_id].push(c.id);
        });

        // Map topic -> chapter and chapter -> subject
        const topicToChapter: Record<string, string> = {};
        const chapterToSubject: Record<string, string> = {};
        (chaptersData || []).forEach((c: any) => {
          chapterToSubject[c.id] = c.subject_id;
        });
        (topicsData || []).forEach((t: any) => {
          topicToChapter[t.id] = t.chapter_id;
        });

        // Count questions per subject
        const questionsBySubject: Record<string, number> = {};
        (questionsData || []).forEach((q: any) => {
          if (q.topic_id) {
            const chapId = topicToChapter[q.topic_id];
            if (chapId) {
              const subId = chapterToSubject[chapId];
              if (subId) {
                questionsBySubject[subId] = (questionsBySubject[subId] || 0) + 1;
              }
            }
          }
        });

        setSubjects(
          subjectsData.map((s: any) => ({
            id: s.id,
            name: s.name,
            chaptersCount: chaptersBySubject[s.id]?.length || 0,
            mcqCount: questionsBySubject[s.id] || 0,
            iconName: s.icon_name || s.iconName || 'menu-book',
            iconBgColor: s.icon_bg_color || s.iconBgColor || '#d7e2ff',
            iconColor: s.icon_color || s.iconColor || '#0059b9',
            categories: s.categories || ['pre-clinical'],
          }))
        );
      }
    } catch (err: any) {
      console.warn('[useQbank] fetchSubjects error:', err.message);
      setError(err.message);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const getSubjectDetail = useCallback(async (subjectId: string): Promise<SubjectDetail | null> => {
    try {
      const [
        { data: subjectRow },
        { data: chaptersData, error: chErr },
        { data: questionsData },
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('id', subjectId).maybeSingle(),
        supabase
          .from('chapters')
          .select('*, topics(*)')
          .eq('subject_id', subjectId)
          .order('chapter_number', { ascending: true }),
        supabase.from('mcq_questions').select('id, topic_id'),
      ]);

      if (chErr) {
        throw chErr;
      }

      const questionsByTopic: Record<string, number> = {};
      (questionsData || []).forEach((q: any) => {
        if (q.topic_id) {
          questionsByTopic[q.topic_id] = (questionsByTopic[q.topic_id] || 0) + 1;
        }
      });

      const subjectName = subjectRow?.name || subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
      const chaptersList = chaptersData || [];

      let realTotalMcqs = 0;
      const enhancedChapters = chaptersList.map((ch: any) => ({
        id: ch.id,
        chapterNumber: ch.chapter_number,
        title: ch.title,
        topics: (ch.topics || []).map((t: any) => {
          const count = questionsByTopic[t.id] || 0;
          realTotalMcqs += count;
          return {
            id: t.id,
            title: t.title,
            mcqCount: count,
            completedMcqs: 0,
            durationMinutes: t.duration_minutes || 20,
            status: 'unattempted',
            isHighYield: !!t.is_high_yield,
            isImageBased: !!t.is_image_based,
          };
        }),
      }));

      return {
        subjectId,
        subjectName,
        totalChapters: chaptersList.length,
        totalMcqs: realTotalMcqs,
        completedMcqs: 0,
        accuracyRate: 0,
        chapters: enhancedChapters,
      };
    } catch (err: any) {
      console.warn(`[useQbank] getSubjectDetail error for ${subjectId}:`, err.message);
      return null;
    }
  }, []);

  const getQuestions = useCallback(
    async (topicId: string, topicTitle: string, subjectName: string, count: number = 10): Promise<MCQQuestion[]> => {
      try {
        const { data, error } = await supabase
          .from('mcq_questions')
          .select('*, options:mcq_options(*)')
          .eq('topic_id', topicId)
          .limit(count);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          return [];
        }

        return data.map((q: any) => ({
          id: q.id,
          topicId: q.topic_id,
          topicTitle,
          subjectName,
          questionNumber: q.question_number,
          clinicalVignette: q.clinical_vignette,
          imageUrl: q.image_url,
          imageCaption: q.image_caption,
          difficulty: q.difficulty,
          isHighYield: q.is_high_yield,
          isImageBased: q.is_image_based,
          explanation: {
            overall: q.explanation,
            goldenPearl: q.golden_pearl,
            reference: q.reference || '',
          },
          options: (q.options || []).map((o: any) => ({
            id: o.option_label,
            text: o.option_text,
            isCorrect: o.is_correct,
            peerPercentage: o.peer_percentage || 0,
            explanation: o.option_explanation,
          })),
        })) as any;
      } catch (err: any) {
        console.warn(`[useQbank] getQuestions error for topic ${topicId}:`, err.message);
        return [];
      }
    },
    []
  );

  const submitQuizAttempt = useCallback(
    async (result: SessionResult) => {
      if (!user) return;

      try {
        const { data: attempt, error: attemptErr } = await supabase
          .from('quiz_attempts')
          .insert({
            user_id: user.id,
            topic_id: result.topicId,
            mode: result.mode,
            total_questions: result.totalQuestions,
            answered_count: result.answeredCount,
            correct_count: result.correctCount,
            incorrect_count: result.incorrectCount,
            skipped_count: result.skippedCount,
            accuracy_percentage: result.accuracyPercentage,
            score: result.score,
            total_time_seconds: result.totalTimeSeconds,
            status: 'completed',
          })
          .select()
          .single();

        if (attemptErr || !attempt) return;

        // Insert answers
        const answerEntries = Object.values(result.userAnswers).map((a) => ({
          attempt_id: attempt.id,
          question_id: a.questionId,
          selected_option_label: a.selectedOptionId || null,
          is_correct: false,
          is_flagged: !!a.isFlagged,
          time_spent_seconds: a.timeSpentSeconds,
          struck_through_labels: Object.keys(a.isStruckThrough || {}).filter(
            (k) => (a.isStruckThrough as any)[k]
          ),
        }));

        if (answerEntries.length > 0) {
          await supabase.from('quiz_attempt_answers').insert(answerEntries);
        }
      } catch (e) {
        console.error('[useQbank] Error submitting quiz attempt:', e);
      }
    },
    [user]
  );

  return {
    subjects,
    loading,
    error,
    refetchSubjects: fetchSubjects,
    getSubjectDetail,
    getQuestions,
    submitQuizAttempt,
  };
}

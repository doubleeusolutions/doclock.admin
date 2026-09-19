import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  RecordedClass,
  SubjectVideoDetail,
  getRecordedClassById,
  getSubjectVideoDetail,
} from '@/data/recordedClassesData';
import { resolveVideoThumbnail } from '@/utils/videoUtils';

export function useVideoLectures() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getSubjectClasses = useCallback(async (subjectId: string): Promise<SubjectVideoDetail | null> => {
    try {
      setLoading(true);
      const [{ data: subjectRow }, { data: chaptersData }, { data, error }] = await Promise.all([
        supabase.from('subjects').select('*').eq('id', subjectId).maybeSingle(),
        supabase.from('chapters').select('id').eq('subject_id', subjectId),
        supabase
          .from('video_classes')
          .select('*, faculty:faculty_profiles(*)')
          .eq('subject_id', subjectId)
          .order('class_number', { ascending: true }),
      ]);

      if (error) {
        throw error;
      }

      const classesData = data || [];

      // If no video classes yet in Supabase for this subject, fallback to high-yield local curriculum
      if (classesData.length === 0) {
        return getSubjectVideoDetail(subjectId);
      }

      const subjectName = subjectRow?.name || subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
      const totalSeconds = classesData.reduce((acc: number, c: any) => acc + (c.duration_seconds || 0), 0);

      return {
        id: subjectId,
        name: subjectName,
        chaptersCount: chaptersData?.length || 0,
        totalHours: Math.round(totalSeconds / 3600),
        videoCount: classesData.length,
        completedClasses: 0,
        progressPercent: 0,
        iconName: subjectRow?.icon_name || 'accessibility-new',
        iconBgColor: subjectRow?.icon_bg_color || '#eef6ff',
        iconColor: subjectRow?.icon_color || '#1d70f5',
        leadFaculty: classesData[0]?.faculty || {
          name: 'Medical Faculty',
          title: 'Specialist Educator',
          avatar: 'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400',
          institution: 'DocLock Medical Faculty',
        },
        classes: classesData.map((c: any) => ({
          id: c.id,
          subjectId: c.subject_id,
          classNumber: c.class_number,
          title: c.title,
          chapterTitle: c.chapter_title,
          faculty: c.faculty || {
            name: 'Medical Faculty',
            title: 'Educator',
            avatar: 'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400',
            institution: 'DocLock Medical Academy',
          },
          duration: c.duration,
          durationSeconds: c.duration_seconds,
          thumbnailUrl: resolveVideoThumbnail(c.thumbnail_url, c.video_url),
          videoUrl: c.video_url || 'https://vjs.zencdn.net/v/oceans.mp4',
          isHighYield: !!c.is_high_yield,
          progressPercent: 0,
          status: 'unwatched',
          viewsCount: c.views_count,
          rating: Number(c.rating || 5),
          description: c.description,
          timestamps: [],
          highYieldPearls: [],
          notesPdfSize: c.notes_pdf_size || '',
          associatedMcqCount: 0,
        })),
      };
    } catch (err: any) {
      console.warn(`[useVideoLectures] getSubjectClasses error for ${subjectId}:`, err.message);
      return getSubjectVideoDetail(subjectId);
    } finally {
      setLoading(false);
    }
  }, []);

  const getClassDetail = useCallback(async (classId: string): Promise<RecordedClass | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('video_classes')
        .select('*, faculty:faculty_profiles(*), timestamps:video_timestamps(*), pearls:video_pearls(*)')
        .eq('id', classId)
        .maybeSingle();

      if (error || !data) {
        return getRecordedClassById(classId) || null;
      }

      return {
        id: data.id,
        subjectId: data.subject_id,
        classNumber: data.class_number,
        title: data.title,
        chapterTitle: data.chapter_title,
        faculty: data.faculty || {
          name: 'Medical Faculty',
          title: 'Educator',
          avatar: 'https://images.unsplash.com/photo-1594824813629-652391b1a030?w=400',
          institution: 'DocLock Medical Academy',
        },
        duration: data.duration,
        durationSeconds: data.duration_seconds,
        thumbnailUrl: resolveVideoThumbnail(data.thumbnail_url, data.video_url),
        videoUrl: data.video_url || 'https://vjs.zencdn.net/v/oceans.mp4',
        isHighYield: !!data.is_high_yield,
        progressPercent: 0,
        status: 'unwatched',
        viewsCount: data.views_count,
        rating: Number(data.rating || 5),
        description: data.description,
        timestamps: (data.timestamps || []).map((t: any) => ({
          time: t.time_string,
          seconds: t.seconds,
          title: t.title,
          isHighYield: !!t.is_high_yield,
        })),
        highYieldPearls: (data.pearls || []).map((p: any) => p.pearl_text),
        notesPdfSize: data.notes_pdf_size || '',
        associatedMcqCount: 0,
        associatedMcqTopicId: data.associated_topic_id,
      };
    } catch (err: any) {
      console.warn(`[useVideoLectures] getClassDetail error for ${classId}:`, err.message);
      return getRecordedClassById(classId) || null;
    } finally {
      setLoading(false);
    }
  }, []);

  const savePlaybackProgress = useCallback(
    (classId: string, currentSeconds: number, totalDurationSeconds: number) => {
      if (!user) return;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const progressPercent = Math.min(
            100,
            Math.round((currentSeconds / Math.max(1, totalDurationSeconds)) * 100)
          );
          const status =
            progressPercent >= 90
              ? 'completed'
              : progressPercent > 0
              ? 'in-progress'
              : 'unwatched';

          await supabase.from('user_video_progress').upsert(
            {
              user_id: user.id,
              video_id: classId,
              last_position_seconds: currentSeconds,
              progress_percent: progressPercent,
              status,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,video_id' }
          );
        } catch (e) {
          console.error('[useVideoLectures] Error updating progress:', e);
        }
      }, 3000);
    },
    [user]
  );

  return {
    loading,
    getSubjectClasses,
    getClassDetail,
    savePlaybackProgress,
  };
}

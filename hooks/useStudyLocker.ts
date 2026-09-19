import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookmarkItem,
  DownloadedItem,
  FlashcardDeck,
  FlashcardItem,
} from '@/data/quickResourcesData';

export function useStudyLocker() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>([]);
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setBookmarks(
          data.map((b: any) => ({
            id: b.id,
            type: b.resource_type,
            title: b.title,
            subject: b.subject_name,
            chapter: b.chapter_name,
            snippet: b.snippet,
            dateSaved: 'Saved in Locker',
            badgeText: (b.resource_type || 'MCQ').toUpperCase(),
            targetRoute: b.target_route,
            facultyName: b.faculty_name,
            difficulty: b.difficulty,
          }))
        );
      } else {
        setBookmarks([]);
      }
    } catch (err) {
      console.warn('[useStudyLocker] fetchBookmarks error:', err);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 2. Fetch Downloads
  const fetchDownloads = useCallback(async () => {
    if (!user) {
      setDownloads([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_downloads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setDownloads(
          data.map((d: any) => ({
            id: d.id,
            title: d.title,
            subject: d.subject_name,
            type: d.resource_type,
            fileSizeMb: Number(d.file_size_mb || 0),
            durationOrPages: d.duration_or_pages,
            qualityBadge: d.quality_badge,
            thumbnailUrl: d.thumbnail_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
            downloadDate: 'Saved Offline',
          }))
        );
      } else {
        setDownloads([]);
      }
    } catch (err) {
      console.warn('[useStudyLocker] fetchDownloads error:', err);
      setDownloads([]);
    }
  }, [user]);

  // 3. Fetch Flashcards & Decks
  const fetchFlashcardsAndDecks = useCallback(async () => {
    try {
      const [{ data: deckData }, { data: cardData }] = await Promise.all([
        supabase.from('flashcard_decks').select('*'),
        supabase.from('flashcards').select('*'),
      ]);

      if (deckData && deckData.length > 0) {
        setDecks(
          deckData.map((d: any) => ({
            id: d.id,
            subject: d.subject_name,
            totalCards: (cardData || []).filter((c: any) => c.deck_id === d.id).length,
            dueToday: 0,
            masteredPercent: 0,
            icon: d.icon_name || 'style',
            accentColor: d.accent_color || '#0059b9',
          }))
        );
      } else {
        setDecks([]);
      }

      if (cardData && cardData.length > 0) {
        setFlashcards(
          cardData.map((c: any) => ({
            id: c.id,
            subject: c.subject_name || 'General',
            chapter: c.chapter_name || 'Clinical',
            category: c.category || 'High-Yield',
            question: c.question,
            answer: c.answer,
            highYieldPearl: c.high_yield_pearl || '',
          }))
        );
      } else {
        setFlashcards([]);
      }
    } catch (err) {
      console.warn('[useStudyLocker] fetchFlashcardsAndDecks error:', err);
      setDecks([]);
      setFlashcards([]);
    }
  }, []);

  // 4. Toggle Bookmark
  const toggleBookmark = useCallback(
    async (item: {
      resourceType: 'mcq' | 'video' | 'pearl' | 'flashcard';
      resourceId: string;
      title: string;
      subjectName: string;
      chapterName: string;
      snippet: string;
      targetRoute?: string;
    }) => {
      if (!user) return;

      const isExisting = bookmarks.some((b) => b.id === item.resourceId);

      if (isExisting) {
        setBookmarks((prev) => prev.filter((b) => b.id !== item.resourceId));
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('resource_id', item.resourceId);
      } else {
        const newBookmark: BookmarkItem = {
          id: item.resourceId,
          type: item.resourceType,
          title: item.title,
          subject: item.subjectName,
          chapter: item.chapterName,
          snippet: item.snippet,
          dateSaved: 'Just now',
          badgeText: item.resourceType.toUpperCase(),
          targetRoute: item.targetRoute,
        };
        setBookmarks((prev) => [newBookmark, ...prev]);

        await supabase.from('user_bookmarks').insert({
          user_id: user.id,
          resource_type: item.resourceType,
          resource_id: item.resourceId,
          title: item.title,
          subject_name: item.subjectName,
          chapter_name: item.chapterName,
          snippet: item.snippet,
          target_route: item.targetRoute,
        });
      }
    },
    [user, bookmarks]
  );

  // 5. Remove Bookmark
  const removeBookmark = useCallback(
    async (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      if (user) {
        await supabase.from('user_bookmarks').delete().eq('user_id', user.id).eq('id', id);
      }
    },
    [user]
  );

  // 6. Record Flashcard Review
  const rateFlashcard = useCallback(
    async (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
      if (!user) return;

      const intervals = { again: 1, hard: 2, good: 4, easy: 7 };
      const intervalDays = intervals[rating];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);

      try {
        await supabase.from('user_flashcard_reviews').upsert(
          {
            user_id: user.id,
            flashcard_id: cardId,
            rating,
            interval_days: intervalDays,
            next_review_date: nextReview.toISOString().split('T')[0],
            reviewed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,flashcard_id' }
        );
      } catch (e) {
        console.error('[useStudyLocker] Error rating flashcard:', e);
      }
    },
    [user]
  );

  // 7. Manage Offline Downloads
  const removeDownload = useCallback(
    async (id: string) => {
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      if (user) {
        await supabase.from('user_downloads').delete().eq('user_id', user.id).eq('id', id);
      }
    },
    [user]
  );

  const clearAllDownloads = useCallback(async () => {
    setDownloads([]);
    if (user) {
      await supabase.from('user_downloads').delete().eq('user_id', user.id);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
    fetchDownloads();
    fetchFlashcardsAndDecks();
  }, [fetchBookmarks, fetchDownloads, fetchFlashcardsAndDecks]);

  return {
    bookmarks,
    downloads,
    flashcards,
    decks,
    loading,
    toggleBookmark,
    removeBookmark,
    rateFlashcard,
    removeDownload,
    clearAllDownloads,
    refetchBookmarks: fetchBookmarks,
    refetchDownloads: fetchDownloads,
    refetchFlashcards: fetchFlashcardsAndDecks,
  };
}

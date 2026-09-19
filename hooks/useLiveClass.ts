import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LiveClassSession, LivePoll } from '@/data/liveClassesData';

export interface LiveChatMessage {
  id: string;
  senderName: string;
  senderRole: 'faculty' | 'moderator' | 'student';
  avatar?: string | null;
  message: string;
  timestamp: string;
  isPinned?: boolean;
  isQuestion?: boolean;
  likesCount?: number;
}

export function useLiveClass(sessionId: string) {
  const { user, profile } = useAuth();
  const [session, setSession] = useState<LiveClassSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [activePoll, setActivePoll] = useState<LivePoll | null>(null);
  const [incomingReaction, setIncomingReaction] = useState<{ emoji: string, id: string } | null>(null);
  const [activeSlideUrl, setActiveSlideUrl] = useState<string | null>(null);

  // 1. Fetch Session Metadata
  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('live_sessions')
        .select('*, faculty:faculty_profiles(*)')
        .eq('id', sessionId)
        .maybeSingle();

      if (data && !error) {
        setSession({
          id: data.id,
          title: data.title,
          subject: data.subject_id,
          chapter: data.chapter,
          status: data.status,
          stream_url: data.stream_url,
          badgeText: data.status === 'live' ? 'LIVE NOW' : 'UPCOMING',
          viewerCount: `${data.attendees_count || 0} Attending`,
          attendeesCount: data.attendees_count || 0,
          faculty: data.faculty
            ? {
                name: data.faculty.name,
                title: data.faculty.title,
                institution: data.faculty.institution || 'DocLock Medical Faculty',
                avatar: data.faculty.avatar_url,
              }
            : {
                name: 'Medical Faculty',
                title: 'Professor',
                institution: 'DocLock Academic Council',
                avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
              },
          timeString: 'Interactive Q&A Session',
          durationMinutes: data.duration_minutes || 60,
          thumbnailUrl: data.thumbnail_url || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
          gradientOverlay: [
            'rgba(18, 28, 43, 0.92)',
            'rgba(0, 47, 108, 0.86)',
            'rgba(24, 15, 45, 0.90)',
          ],
          accentColor: '#ef4444',
          keyTopics: data.key_topics || [],
        });

        // If the admin uploaded a slide to Supabase Storage, it's stored in thumbnail_url
        if (data.thumbnail_url && (data.thumbnail_url.includes('live_class_slides') || data.thumbnail_url.includes('.pdf'))) {
          setActiveSlideUrl(data.thumbnail_url);
        }
      } else {
        setSession(null);
      }
    } catch (err: any) {
      console.warn('[useLiveClass] fetchSession error:', err.message);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // 2. Fetch Active Poll
  const fetchActivePoll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const { data, error } = await supabase
        .from('live_polls')
        .select('*, options:live_poll_options(*)')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && !error) {
        const optionsList = (data.options || []).sort((a: any, b: any) => (a.option_order || 0) - (b.option_order || 0));
        setActivePoll({
          question: data.question,
          options: optionsList.map((o: any) => ({
            id: o.id,
            text: o.option_text,
            votesPercent: 0,
          })),
          totalVotes: 0,
        });
      } else {
        setActivePoll(null);
      }
    } catch (err: any) {
      console.warn('[useLiveClass] fetchActivePoll error:', err.message);
      setActivePoll(null);
    }
  }, [sessionId]);

  // 3. Fetch Chat History & Subscribe via Realtime WebSocket
  useEffect(() => {
    fetchSession();
    fetchActivePoll();

    if (!sessionId) return;

    // Fetch initial chat
    supabase
      .from('live_chat_messages')
      .select('*, user:user_profiles(full_name, avatar_url, role)')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(
            data.map((m: any) => ({
              id: m.id,
              senderName: m.user?.full_name || 'Candidate',
              senderRole:
                m.user?.role === 'admin'
                  ? 'faculty'
                  : 'student',
              avatar: m.user?.avatar_url,
              message: m.message_text,
              timestamp: m.created_at
                ? new Date(m.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Now',
              isPinned: !!m.is_pinned,
              isQuestion: !!m.is_question,
              likesCount: m.likes_count || 0,
            }))
          );
        } else {
          setMessages([]);
        }
      });

    // Realtime channel for Chat
    const chatChannel = supabase
      .channel(`live-chat-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          // Don't add if it's from the current user (we add it optimistically in sendMessage)
          if (newMsg.user_id === user?.id) return;

          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              senderName: newMsg.user?.full_name || 'User',
              senderRole: newMsg.user?.role === 'admin' ? 'faculty' : 'student',
              avatar: newMsg.user?.avatar_url,
              message: newMsg.message_text,
              timestamp: 'Just now',
              isPinned: false,
              isQuestion: !!newMsg.is_question,
              likesCount: 0,
            },
          ]);
        }
      )
      .subscribe();

    // Realtime channel for Broadcasts (Reactions, Layout)
    const broadcastChannel = supabase
      .channel(`live-broadcast-${sessionId}`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        setIncomingReaction({ emoji: payload.payload.emoji, id: `inc-${Date.now()}-${Math.random()}` });
      })
      .on('broadcast', { event: 'layout_change' }, (payload) => {
      })
      .on('broadcast', { event: 'slide_change' }, (payload) => {
        setActiveSlideUrl(payload.payload.url);
      })
      .subscribe();

    // Realtime channel for Polls
    const pollChannel = supabase
      .channel(`live-polls-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'live_polls', filter: `session_id=eq.${sessionId}` },
        () => fetchActivePoll()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'live_polls', filter: `session_id=eq.${sessionId}` },
        () => fetchActivePoll()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chatChannel);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(pollChannel);
    };
  }, [sessionId, fetchSession, fetchActivePoll, profile, user]);

  const sendMessage = useCallback(
    async (text: string, isQuestion: boolean = false) => {
      if (!user || !text.trim()) return;

      const trimmed = text.trim();
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderName: profile?.full_name || 'You',
          senderRole:
            profile?.role === 'admin'
              ? 'faculty'
              : 'student',
          avatar: profile?.avatar_url,
          message: trimmed,
          timestamp: 'Just now',
          isQuestion,
          likesCount: 0,
        },
      ]);


      try {
        await supabase.from('live_chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          message_text: trimmed,
        });
      } catch (e) {
        console.error('[useLiveClass] Error posting chat message:', e);
      }
    },
    [user, profile, sessionId]
  );

  const toggleHandRaise = useCallback(async () => {
    if (!user) return;

    const nextState = !isHandRaised;
    setIsHandRaised(nextState);

    try {
      if (nextState) {
        setQueuePosition(1);
        await supabase.from('live_hand_raises').upsert(
          {
            session_id: sessionId,
            user_id: user.id,
            queue_position: 1,
            status: 'waiting',
          },
          { onConflict: 'session_id,user_id' }
        );
      } else {
        setQueuePosition(null);
        await supabase
          .from('live_hand_raises')
          .delete()
          .eq('session_id', sessionId)
          .eq('user_id', user.id);
      }
    } catch (e) {
      console.error('[useLiveClass] Error toggling hand raise:', e);
    }
  }, [user, sessionId, isHandRaised]);

  const castPollVote = useCallback(
    async (pollId: string, optionId: string) => {
      if (!user) return;
      try {
        await supabase.from('live_poll_votes').upsert(
          {
            poll_id: pollId,
            option_id: optionId,
            user_id: user.id,
          },
          { onConflict: 'poll_id,user_id' }
        );
      } catch (e) {
        console.error('[useLiveClass] Error casting vote:', e);
      }
    },
    [user]
  );

  const sendReaction = useCallback(async (emoji: string) => {
    if (!sessionId) return;
    const channel = supabase.channel(`live-broadcast-${sessionId}`);
    await channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji }
    });
  }, [sessionId]);

  return {
    session,
    loading,
    messages,
    sendMessage,
    isHandRaised,
    queuePosition,
    toggleHandRaise,
    castPollVote,
    activePoll,
    incomingReaction,
    activeSlideUrl,
    sendReaction,
    refetchSession: fetchSession,
  };
}

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/contexts/AuthContext';
import { LiveClassSession } from '@/data/liveClassesData';
import { Colors } from '@/theme';

export type StageLayoutMode = 'presentation' | 'speaker' | 'split';
export type StreamQuality = '1080p' | '720p' | '480p' | 'audio_only';

export interface FloatingReaction {
  id: string;
  emoji: string;
  xOffset: number;
}

interface LiveStreamStageProps {
  session: LiveClassSession;
  layoutMode: StageLayoutMode;
  onChangeLayout: (mode: StageLayoutMode) => void;
  reactions: FloatingReaction[];
  onTriggerReaction: (emoji: string) => void;
  activeSlideUrl?: string | null;
}

export const LiveStreamStage: React.FC<LiveStreamStageProps> = ({
  session,
  layoutMode,
  onChangeLayout,
  reactions,
  onTriggerReaction,
  activeSlideUrl,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [streamQuality, setStreamQuality] = useState<StreamQuality>('1080p');
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const slideUrlToRender = activeSlideUrl || 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&auto=format&fit=crop&q=80';
  const isPdf = slideUrlToRender.toLowerCase().includes('.pdf');

  const { profile } = useAuth();
  const candidateName = profile?.full_name || 'Candidate';
  const userID = profile?.id || `user_${Math.floor(Math.random() * 10000)}`;

  // URL to the web viewer hosted on the admin panel
  // e.g., http://192.168.x.x:5173/viewer/roomID?userID=...&userName=...
  // In development, ensure you are using your machine's local IP address, NOT localhost
  const adminIpUrl = process.env.EXPO_PUBLIC_ADMIN_URL || 'http://192.168.1.100:5173';
  const roomID = session.stream_url || `room_${session.id}`;

  const viewerUrl = `${adminIpUrl}/live-viewer/${roomID}?userID=${userID}&userName=${encodeURIComponent(candidateName)}`;

  console.log('--- ZEGOCLOUD DEBUG ---');
  console.log('Attempting to join Room ID:', roomID);
  console.log('WebView URL:', viewerUrl);
  console.log('-----------------------');

  return (
    <View style={styles.stageWrapper}>
      {/* 16:9 Cinema Container */}
      <View style={styles.cinemaStage}>
        {/* Background Visual Layer: Slides (Only visible when presentation) */}
        {layoutMode === 'presentation' && (
           <View style={StyleSheet.absoluteFill}>
             {isPdf ? (
               <WebView 
                 source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(slideUrlToRender)}` }}
                 style={{ flex: 1, backgroundColor: '#070b13' }}
               />
             ) : (
               <Image 
                  source={{ uri: slideUrlToRender }} 
                  style={{ flex: 1, resizeMode: 'contain', backgroundColor: '#070b13' }} 
               />
             )}
           </View>
        )}

        {/* The ZegoCloud WebView */}
        <View style={layoutMode === 'presentation' ? styles.pipVideoContainer : StyleSheet.absoluteFill}>
          <WebView
            source={{ uri: viewerUrl }}
            style={{ flex: 1, backgroundColor: '#000' }}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        {/* Ambient Stage Dark Gradient */}
        <LinearGradient
          colors={[
            'rgba(10, 15, 26, 0.75)',
            'rgba(10, 15, 26, 0.20)',
            'rgba(10, 15, 26, 0.85)',
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Floating Reactions Canvas */}
        <View style={styles.reactionsCanvas} pointerEvents="none">
          {reactions.map((r) => (
            <FloatingReactionItem key={r.id} item={r} />
          ))}
        </View>
      </View>

      {/* SUB-STAGE CONTROL STRIP */}
      <View style={styles.controlStrip}>
        <View style={styles.layoutToggleGroup}>
          <Pressable
            onPress={() => onChangeLayout('presentation')}
            style={[
              styles.layoutBtn,
              layoutMode === 'presentation' && styles.layoutBtnActive,
            ]}
          >
            <MaterialIcons
              name="present-to-all"
              size={15}
              color={layoutMode === 'presentation' ? '#ffffff' : '#424752'}
            />
            <Text
              style={[
                styles.layoutBtnText,
                layoutMode === 'presentation' && styles.layoutBtnTextActive,
              ]}
            >
              Slides Focus
            </Text>
          </Pressable>

          <Pressable
            onPress={() => onChangeLayout('speaker')}
            style={[
              styles.layoutBtn,
              layoutMode === 'speaker' && styles.layoutBtnActive,
            ]}
          >
            <MaterialIcons
              name="person"
              size={15}
              color={layoutMode === 'speaker' ? '#ffffff' : '#424752'}
            />
            <Text
              style={[
                styles.layoutBtnText,
                layoutMode === 'speaker' && styles.layoutBtnTextActive,
              ]}
            >
              Faculty Focus
            </Text>
          </Pressable>
        </View>

        <View style={styles.quickReactionsRow}>
          {['❤️', '🔥', '👏', '💡', '🙋'].map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => onTriggerReaction(emoji)}
              style={styles.quickReactionBtn}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={`Send ${emoji} reaction`}
            >
              <Text style={styles.quickReactionEmoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

const FloatingReactionItem: React.FC<{ item: FloatingReaction }> = ({
  item,
}) => {
  return (
    <View style={[styles.floatingEmojiContainer, { right: 16 + item.xOffset }]}>
      <Text style={styles.floatingEmojiText}>{item.emoji}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stageWrapper: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  cinemaStage: {
    width: '100%',
    height: 224,
    position: 'relative',
    backgroundColor: '#070b13',
    justifyContent: 'space-between',
  },
  stageImage: {
    ...StyleSheet.absoluteFillObject,
  },
  pipVideoContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 100,
    height: 140,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    zIndex: 20,
    backgroundColor: '#000',
  },

  /* Top HUD */
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    zIndex: 10,
  },
  topHudLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  pulseGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveStreamBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  latencyBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#d1d5db',
  },
  topHudRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  qualityBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  hudIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Quality Dropdown */
  qualityDropdown: {
    position: 'absolute',
    top: 42,
    right: 12,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 4,
    width: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 30,
  },
  qualityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  qualityOptionActive: {
    backgroundColor: '#f0f4ff',
  },
  qualityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#181c22',
  },
  qualityOptionTextActive: {
    color: '#0059b9',
    fontWeight: '700',
  },

  /* Faculty PiP Card */
  facultyPipCard: {
    position: 'absolute',
    top: 44,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(10, 15, 26, 0.88)',
    borderRadius: 14,
    padding: 6,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 10,
  },
  pipAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#0059b9',
  },
  pipMeta: {
    justifyContent: 'center',
  },
  pipNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pipName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  speakingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 14,
  },
  soundBar: {
    width: 2.5,
    borderRadius: 1,
    backgroundColor: '#10b981',
  },
  pipRole: {
    fontSize: 9,
    fontWeight: '700',
    color: '#68d7fd',
    letterSpacing: 0.3,
  },

  /* Slide Tracker */
  slideTrackerBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10, 15, 26, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    zIndex: 10,
  },
  slideTrackerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },

  /* Floating Reactions */
  reactionsCanvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },
  floatingEmojiContainer: {
    position: 'absolute',
    bottom: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingEmojiText: {
    fontSize: 26,
  },

  /* Control Strip Under Player */
  controlStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#edf0f7',
  },
  layoutToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f3fa',
    borderRadius: 9999,
    padding: 3,
    gap: 3,
  },
  layoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  layoutBtnActive: {
    backgroundColor: '#0059b9',
  },
  layoutBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#575f6e',
  },
  layoutBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  quickReactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickReactionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f3fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickReactionEmoji: {
    fontSize: 16,
  },
});

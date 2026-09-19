import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { Colors, Motion } from '@/theme';
import { getYouTubeId, isYouTubeUrl, resolveVideoThumbnail } from '@/utils/videoUtils';

interface VideoPlayerProps {
  thumbnailUrl: string;
  videoUrl?: string;
  durationSeconds: number;
  currentSeconds: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onTimeUpdate?: (seconds: number) => void;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  thumbnailUrl,
  videoUrl,
  durationSeconds,
  currentSeconds,
  isPlaying,
  onTogglePlay,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
  onTimeUpdate,
  onPlayingChange,
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoViewRef = useRef<VideoView | null>(null);

  // Button micro-animation scales
  const playBtnScale = useSharedValue(1);
  const rewindBtnScale = useSharedValue(1);
  const forwardBtnScale = useSharedValue(1);
  const speedBtnScale = useSharedValue(1);
  const fullscreenBtnScale = useSharedValue(1);

  const playBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playBtnScale.value }],
  }));

  const rewindBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewindBtnScale.value }],
  }));

  const forwardBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: forwardBtnScale.value }],
  }));

  const speedBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: speedBtnScale.value }],
  }));

  const fullscreenBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fullscreenBtnScale.value }],
  }));

  // Check if source is YouTube
  const youtubeId = getYouTubeId(videoUrl);
  const isYouTube = !!youtubeId;
  const effectiveThumbnail = resolveVideoThumbnail(thumbnailUrl, videoUrl);

  if (isYouTube && youtubeId) {
    return (
      <View style={styles.playerContainer}>
        <View style={styles.playerViewport}>
          {Platform.OS === 'web' ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&rel=0${currentSeconds > 0 ? `&start=${currentSeconds}` : ''}`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <WebView
              style={StyleSheet.absoluteFillObject}
              source={{
                uri: `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=${isPlaying ? 1 : 0}&playsinline=1&enablejsapi=1&rel=0${currentSeconds > 0 ? `&start=${currentSeconds}` : ''}`,
              }}
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
          )}
          {/* Top Watermark & HD Pill */}
          <View style={styles.topInfoBar} pointerEvents="none">
            <View style={styles.watermarkBadge}>
              <MaterialIcons name="medical-services" size={12} color="#ffffff" />
              <Text style={styles.watermarkText}>DOCLOCK CLINICAL</Text>
            </View>
            <View style={styles.hdBadge}>
              <Text style={styles.hdText}>YouTube HD</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Ensure effective video URL for direct player
  const fallbackUrl = 'https://vjs.zencdn.net/v/oceans.mp4';
  const effectiveSource =
    videoUrl && videoUrl.trim().length > 0 && !videoUrl.startsWith('blob:')
      ? videoUrl.trim()
      : fallbackUrl;

  // Initialize expo-video player with timeUpdate interval enabled
  const player = useVideoPlayer(effectiveSource, (p) => {
    p.loop = false;
    p.playbackRate = playbackSpeed;
    p.timeUpdateEventInterval = 0.25;
  });

  // Ensure timeUpdate interval is active on player instance
  useEffect(() => {
    if (!player) return;
    try {
      player.timeUpdateEventInterval = 0.25;
    } catch (e) {}
  }, [player]);

  // Sync isPlaying state with expo-video player
  useEffect(() => {
    if (!player) return;
    try {
      if (isPlaying && !player.playing) {
        player.play();
      } else if (!isPlaying && player.playing) {
        player.pause();
      }
    } catch (e) {
      console.warn('[VideoPlayer] play/pause error:', e);
    }
  }, [isPlaying, player]);

  // Sync playback speed
  useEffect(() => {
    if (!player) return;
    try {
      player.playbackRate = playbackSpeed;
    } catch (e) {
      console.warn('[VideoPlayer] speed error:', e);
    }
  }, [playbackSpeed, player]);

  // External seek sync (e.g. from timestamp chapter click)
  useEffect(() => {
    if (!player) return;
    try {
      if (Math.abs((player.currentTime || 0) - currentSeconds) > 1.8) {
        player.currentTime = currentSeconds;
      }
    } catch (e) {
      console.warn('[VideoPlayer] seek sync error:', e);
    }
  }, [currentSeconds, player]);

  // Listen to expo-video player events
  useEffect(() => {
    if (!player) return;

    const timeSub = player.addListener('timeUpdate', (event) => {
      setIsLoading(false);
      if (onTimeUpdate && typeof event.currentTime === 'number') {
        onTimeUpdate(Math.floor(event.currentTime));
      }
    });

    const playSub = player.addListener('playingChange', (event) => {
      if (onPlayingChange && event.isPlaying !== isPlaying) {
        onPlayingChange(event.isPlaying);
      }
    });

    const statusSub = player.addListener('statusChange', (event) => {
      if (event.status === 'error') {
        setHasError(true);
        setIsLoading(false);
      } else if (event.status === 'readyToPlay') {
        setHasError(false);
        setIsLoading(false);
      } else if (event.status === 'loading') {
        setIsLoading(true);
      }
    });

    return () => {
      timeSub.remove();
      playSub.remove();
      statusSub.remove();
    };
  }, [player, isPlaying, onTimeUpdate, onPlayingChange]);

  // Active 250ms polling interval during playback to guarantee scrubber moves continuously
  useEffect(() => {
    if (!player || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        if (player.playing && typeof player.currentTime === 'number') {
          const curSec = Math.floor(player.currentTime);
          if (onTimeUpdate && curSec !== currentSeconds) {
            onTimeUpdate(curSec);
          }
        }
      } catch (e) {}
    }, 250);

    return () => clearInterval(interval);
  }, [player, isPlaying, onTimeUpdate, currentSeconds]);

  // Auto-hide controls after 4 seconds of uninterrupted playing
  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setControlsVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSeconds]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    const mStr = mins < 10 ? `0${mins}` : `${mins}`;
    const sStr = remainder < 10 ? `0${remainder}` : `${remainder}`;
    return `${mStr}:${sStr}`;
  };

  const totalEffectiveSeconds =
    (player?.duration && player.duration > 0
      ? Math.round(player.duration)
      : durationSeconds) || 1;

  const progressPercent = Math.min(
    100,
    Math.max(0, (currentSeconds / totalEffectiveSeconds) * 100)
  );

  const handleSkip = (delta: number) => {
    const cur = player?.currentTime ?? currentSeconds;
    const next = Math.max(0, Math.min(totalEffectiveSeconds, cur + delta));
    if (player) {
      player.currentTime = next;
    }
    onSeek(next);
  };

  const handleScrubPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const targetRatio = Math.max(0, Math.min(1, locationX / 320));
    const targetSec = Math.floor(targetRatio * totalEffectiveSeconds);
    if (player) {
      player.currentTime = targetSec;
    }
    onSeek(targetSec);
  };

  const handleCycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    onChangeSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const handleTogglePlayInternal = () => {
    if (player) {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    }
    onTogglePlay();
  };

  const handleFullscreenPress = () => {
    if (videoViewRef.current) {
      try {
        videoViewRef.current.enterFullscreen();
      } catch (err) {
        Alert.alert('Theater Mode', 'Rotating to landscape view.');
      }
    } else {
      Alert.alert('Theater Mode', 'Rotating to landscape view.');
    }
  };

  return (
    <View style={styles.playerContainer}>
      <Pressable
        onPress={() => setControlsVisible((prev) => !prev)}
        style={styles.playerViewport}
        accessibilityRole="image"
        accessibilityLabel="Interactive Medical Video Player"
      >
        <VideoView
          ref={videoViewRef}
          player={player}
          style={StyleSheet.absoluteFillObject}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen
          allowsPictureInPicture
        />

        {/* Thumbnail fallback/poster when not playing or loading (direct video only) */}
        {!isPlaying && currentSeconds === 0 && !hasError && (
          <Image
            source={{ uri: effectiveThumbnail }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        )}

        {/* Dark Theater Overlay (direct video only) */}
        <LinearGradient
          colors={[
            'rgba(13, 21, 34, 0.45)',
            'rgba(13, 21, 34, 0.15)',
            'rgba(13, 21, 34, 0.85)',
          ]}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />

        {/* Top Watermark & HD Pill */}
        <View style={styles.topInfoBar} pointerEvents="none">
          <View style={styles.watermarkBadge}>
            <MaterialIcons name="medical-services" size={12} color="#ffffff" />
            <Text style={styles.watermarkText}>DOCLOCK CLINICAL</Text>
          </View>

          <View style={styles.hdBadge}>
            <Text style={styles.hdText}>1080p 60fps</Text>
          </View>
        </View>

        {/* Error / Loading Indicator HUD (direct video only) */}
        {hasError ? (
          <View style={styles.errorOverlay}>
            <MaterialIcons name="error-outline" size={32} color="#f87171" />
            <Text style={styles.errorText}>Video stream unavailable. Playing fallback preview.</Text>
          </View>
        ) : isLoading && isPlaying ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : null}

        {/* Center Playback Controls (direct video only) */}
        <View
            style={[
              styles.centerControlsRow,
              { opacity: controlsVisible || !isPlaying ? 1 : 0 },
            ]}
          >
            {/* Skip -10s */}
            <AnimatedPressable
              onPress={() => handleSkip(-10)}
              onPressIn={() => {
                rewindBtnScale.value = withSpring(0.9, Motion.tactileSpring);
              }}
              onPressOut={() => {
                rewindBtnScale.value = withSpring(1, Motion.tactileSpring);
              }}
              style={[styles.skipButton, rewindBtnAnimStyle]}
              accessibilityRole="button"
              accessibilityLabel="Rewind 10 seconds"
            >
              <MaterialIcons name="replay-10" size={24} color="#ffffff" />
            </AnimatedPressable>

            {/* Big Center Play / Pause Button */}
            <AnimatedPressable
              onPress={handleTogglePlayInternal}
              onPressIn={() => {
                playBtnScale.value = withSpring(0.92, Motion.tactileSpring);
              }}
              onPressOut={() => {
                playBtnScale.value = withSpring(1, Motion.tactileSpring);
              }}
              style={[styles.bigPlayButton, playBtnAnimStyle]}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause lecture' : 'Play lecture'}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={36}
                color={Colors.primary}
              />
            </AnimatedPressable>

            {/* Skip +10s */}
            <AnimatedPressable
              onPress={() => handleSkip(10)}
              onPressIn={() => {
                forwardBtnScale.value = withSpring(0.9, Motion.tactileSpring);
              }}
              onPressOut={() => {
                forwardBtnScale.value = withSpring(1, Motion.tactileSpring);
              }}
              style={[styles.skipButton, forwardBtnAnimStyle]}
              accessibilityRole="button"
              accessibilityLabel="Forward 10 seconds"
            >
              <MaterialIcons name="forward-10" size={24} color="#ffffff" />
            </AnimatedPressable>
          </View>

        {/* Bottom Scrub Bar & Timer Bar (direct video only) */}
        <View
            style={[
              styles.bottomControlBar,
              { opacity: controlsVisible || !isPlaying ? 1 : 0 },
            ]}
          >
          {/* Scrub Track */}
          <Pressable onPress={handleScrubPress} style={styles.scrubTrackContainer}>
            <View style={styles.scrubTrack}>
              <View
                style={[styles.scrubFill, { width: `${progressPercent}%` }]}
              />
              <View
                style={[
                  styles.scrubThumb,
                  { left: `${Math.max(0, Math.min(97, progressPercent))}%` },
                ]}
              />
            </View>
          </Pressable>

          {/* Time and Utility Row */}
          <View style={styles.controlsFooter}>
            <View style={styles.timeGroup}>
              <Text style={styles.currentTimeText}>
                {formatTime(currentSeconds)}
              </Text>
              <Text style={styles.timeDivider}>/</Text>
              <Text style={styles.totalTimeText}>
                {formatTime(totalEffectiveSeconds)}
              </Text>
            </View>

            <View style={styles.footerRightControls}>
              {/* Speed Selector Pill */}
              <AnimatedPressable
                onPress={handleCycleSpeed}
                onPressIn={() => {
                  speedBtnScale.value = withSpring(0.92, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  speedBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.speedPill, speedBtnAnimStyle]}
                accessibilityRole="button"
                accessibilityLabel={`Speed ${playbackSpeed}x, tap to change`}
              >
                <Text style={styles.speedPillText}>{playbackSpeed}x</Text>
              </AnimatedPressable>

              {/* Fullscreen Button */}
              <AnimatedPressable
                onPress={handleFullscreenPress}
                onPressIn={() => {
                  fullscreenBtnScale.value = withSpring(0.92, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  fullscreenBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.fullscreenBtn, fullscreenBtnAnimStyle]}
                accessibilityRole="button"
                accessibilityLabel="Enter fullscreen mode"
              >
                <MaterialIcons name="fullscreen" size={22} color="#ffffff" />
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#0d1522',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  playerViewport: {
    width: '100%',
    height: 220,
    position: 'relative',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  topInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    zIndex: 3,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  watermarkText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  hdBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    paddingHorizontal: 20,
    gap: 8,
  },
  errorText: {
    color: '#f87171',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  centerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    zIndex: 3,
  },
  bigPlayButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  skipButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControlBar: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 3,
    gap: 6,
  },
  scrubTrackContainer: {
    paddingVertical: 6,
  },
  scrubTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  scrubFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  scrubThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  controlsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  timeDivider: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  totalTimeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  speedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  fullscreenBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

interface VideoPlayerProps {
  thumbnailUrl: string;
  durationSeconds: number;
  currentSeconds: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPEED_OPTIONS = [1.0, 1.25, 1.5, 2.0];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  thumbnailUrl,
  durationSeconds,
  currentSeconds,
  isPlaying,
  onTogglePlay,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isSpeedModalOpen, setIsSpeedModalOpen] = useState(false);

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

  // Auto-hide controls after 4 seconds when playing
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

  const progressPercent =
    durationSeconds > 0
      ? Math.min(100, Math.max(0, (currentSeconds / durationSeconds) * 100))
      : 0;

  const handleSkip = (delta: number) => {
    const next = Math.max(0, Math.min(durationSeconds, currentSeconds + delta));
    onSeek(next);
  };

  const handleScrubPress = (event: any) => {
    const { locationX } = event.nativeEvent;
    // Assume container width approx 360-600; rough ratio
    // We can also pass scrub directly
    const targetRatio = Math.max(0, Math.min(1, locationX / 320));
    onSeek(Math.floor(targetRatio * durationSeconds));
  };

  const handleCycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    onChangeSpeed(SPEED_OPTIONS[nextIndex]);
  };

  return (
    <View style={styles.playerContainer}>
      <Pressable
        onPress={() => setControlsVisible((prev) => !prev)}
        style={styles.playerViewport}
        accessibilityRole="image"
        accessibilityLabel="Video Player"
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />

        {/* Dark Theater Overlay */}
        <LinearGradient
          colors={[
            'rgba(13, 21, 34, 0.4)',
            'rgba(13, 21, 34, 0.2)',
            'rgba(13, 21, 34, 0.75)',
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top Watermark & HD Pill */}
        <View style={styles.topInfoBar}>
          <View style={styles.watermarkBadge}>
            <MaterialIcons name="medical-services" size={12} color="#ffffff" />
            <Text style={styles.watermarkText}>DOCLOCK CLINICAL</Text>
          </View>

          <View style={styles.hdBadge}>
            <Text style={styles.hdText}>1080p 60fps</Text>
          </View>
        </View>

        {/* Center Playback Controls */}
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
            onPress={onTogglePlay}
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

        {/* Bottom Scrub Bar & Timer Bar */}
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
                {formatTime(durationSeconds)}
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
                onPress={() => Alert.alert('Theater Mode', 'Rotating to landscape theater view.')}
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hdText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34d399',
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
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
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

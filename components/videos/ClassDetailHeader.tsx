import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

interface ClassDetailHeaderProps {
  classNumber: number;
  totalClasses?: number;
  isBookmarked?: boolean;
  onBookmarkPress?: () => void;
  onSharePress?: () => void;
  onDownloadPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ClassDetailHeader: React.FC<ClassDetailHeaderProps> = ({
  classNumber,
  totalClasses = 48,
  isBookmarked = false,
  onBookmarkPress,
  onSharePress,
  onDownloadPress,
}) => {
  const router = useRouter();

  const backBtnScale = useSharedValue(1);
  const bookmarkBtnScale = useSharedValue(1);
  const shareBtnScale = useSharedValue(1);
  const downloadBtnScale = useSharedValue(1);

  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const bookmarkBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkBtnScale.value }],
  }));

  const shareBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareBtnScale.value }],
  }));

  const downloadBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: downloadBtnScale.value }],
  }));

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerInner}>
        {/* Left: Back button + Class Number Pill */}
        <View style={styles.leftGroup}>
          <AnimatedPressable
            onPress={() => router.back()}
            onPressIn={() => {
              backBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              backBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.backBtn, backBtnAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.onSurface} />
          </AnimatedPressable>

          <View style={styles.classIndexBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.classIndexText} numberOfLines={1}>
              Class {classNumber < 10 ? `0${classNumber}` : classNumber} of {totalClasses}
            </Text>
          </View>
        </View>

        {/* Right: Actions Pill (Bookmark, Share, Download) */}
        <View style={styles.actionsPill}>
          <AnimatedPressable
            onPress={onBookmarkPress}
            onPressIn={() => {
              bookmarkBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              bookmarkBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.iconButton, bookmarkBtnAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark class'}
          >
            <MaterialIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-border'}
              size={18}
              color={isBookmarked ? Colors.primary : Colors.onSurfaceVariant}
            />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={onSharePress}
            onPressIn={() => {
              shareBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              shareBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.iconButton, shareBtnAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel="Share lecture"
          >
            <MaterialIcons name="share" size={18} color={Colors.onSurfaceVariant} />
          </AnimatedPressable>

          <AnimatedPressable
            onPress={onDownloadPress}
            onPressIn={() => {
              downloadBtnScale.value = withSpring(0.92, Motion.tactileSpring);
            }}
            onPressOut={() => {
              downloadBtnScale.value = withSpring(1, Motion.tactileSpring);
            }}
            style={[styles.iconButton, downloadBtnAnimStyle]}
            accessibilityRole="button"
            accessibilityLabel="Download lecture for offline"
          >
            <MaterialIcons
              name="download-for-offline"
              size={19}
              color={Colors.onSurfaceVariant}
            />
          </AnimatedPressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'rgba(249, 249, 255, 0.95)',
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
    zIndex: 10,
  },
  headerInner: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  classIndexBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    backgroundColor: Colors.surfaceContainer,
    flexShrink: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  classIndexText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.1,
  },
  actionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 2,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

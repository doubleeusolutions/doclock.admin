import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
  FadeOutRight,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

interface VideoSubjectDetailHeaderProps {
  subjectName: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  iconBgColor?: string;
  iconColor?: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onBookmarkPress?: () => void;
  isBookmarked?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const VideoSubjectDetailHeader: React.FC<VideoSubjectDetailHeaderProps> = ({
  subjectName,
  iconName,
  iconBgColor = Colors.surfaceContainer,
  iconColor = Colors.primary,
  searchQuery,
  onSearchChange,
  onBookmarkPress,
  isBookmarked = false,
}) => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const backBtnScale = useSharedValue(1);
  const searchBtnScale = useSharedValue(1);
  const bookmarkBtnScale = useSharedValue(1);

  const backBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backBtnScale.value }],
  }));

  const searchBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBtnScale.value }],
  }));

  const bookmarkBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkBtnScale.value }],
  }));

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchOpen(false);
    onSearchChange('');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerInner}>
        {isSearchOpen ? (
          <Animated.View
            entering={FadeInRight.duration(200)}
            exiting={FadeOutRight.duration(150)}
            style={styles.searchBar}
          >
            <MaterialIcons name="search" size={20} color={Colors.primary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder={`Search ${subjectName} classes, topics...`}
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={onSearchChange}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => onSearchChange('')}
                style={styles.searchIconBtn}
                hitSlop={8}
                accessibilityLabel="Clear search"
              >
                <MaterialIcons name="cancel" size={18} color={Colors.onSurfaceVariant} />
              </Pressable>
            )}
            <Pressable
              onPress={handleCloseSearch}
              style={styles.closeBtn}
              hitSlop={8}
              accessibilityLabel="Close search"
            >
              <MaterialIcons name="close" size={20} color={Colors.onSurface} />
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            style={styles.standardHeaderRow}
          >
            {/* Left: Back Button + Subject Emblem + Title */}
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
                <MaterialIcons name="arrow-back" size={22} color={Colors.onSurface} />
              </AnimatedPressable>

              <View style={[styles.emblemBox, { backgroundColor: iconBgColor }]}>
                <MaterialIcons name={iconName} size={22} color={iconColor} />
              </View>

              <View style={styles.titleGroup}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {subjectName}
                </Text>
                <Text style={styles.headerSubtitle}>Recorded Classes</Text>
              </View>
            </View>

            {/* Right: Search & Bookmark Actions Pill */}
            <View style={styles.actionsPill}>
              <AnimatedPressable
                onPress={handleOpenSearch}
                onPressIn={() => {
                  searchBtnScale.value = withSpring(0.92, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  searchBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.iconButton, searchBtnAnimStyle]}
                accessibilityRole="button"
                accessibilityLabel="Search recorded classes"
              >
                <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
              </AnimatedPressable>

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
                accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark subject'}
              >
                <MaterialIcons
                  name={isBookmarked ? 'bookmark' : 'bookmark-border'}
                  size={20}
                  color={isBookmarked ? Colors.primary : Colors.onSurfaceVariant}
                />
              </AnimatedPressable>
            </View>
          </Animated.View>
        )}
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
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  standardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
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
  emblemBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  titleGroup: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.onSurfaceVariant,
    marginTop: 1,
  },
  actionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(194, 198, 213, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 4,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.primaryFixedDim,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
    color: Colors.onSurface,
    paddingVertical: 0,
  },
  searchIconBtn: {
    padding: 3,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f4fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

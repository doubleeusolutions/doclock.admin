import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Keyboard,
} from 'react-native';
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

export interface HomeTopHeaderProps {
  userName?: string;
  subtitle?: string;
  onSearchChange?: (query: string) => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

const APP_LOGO = require('@/assets/logo.png');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HeaderActionButton: React.FC<{
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress?: () => void;
  showBadge?: boolean;
  accessibilityLabel: string;
}> = ({ iconName, onPress, showBadge, accessibilityLabel }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.92, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[styles.iconButton, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialIcons name={iconName} size={20} color={Colors.onSurface} />
      {showBadge && <View style={styles.notificationDot} />}
    </AnimatedPressable>
  );
};

export const HomeTopHeader: React.FC<HomeTopHeaderProps> = ({
  userName = 'Alex',
  subtitle = "Ready for today's revision?",
  onSearchChange,
  onNotificationPress,
  onAvatarPress,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const searchBtnScale = useSharedValue(1);
  const notifBtnScale = useSharedValue(1);

  const searchBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchBtnScale.value }],
  }));

  const notifBtnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: notifBtnScale.value }],
  }));

  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isSearchExpanded]);

  const handleOpenSearch = () => {
    setIsSearchExpanded(true);
  };

  const handleCloseSearch = () => {
    Keyboard.dismiss();
    setIsSearchExpanded(false);
    setSearchQuery('');
    onSearchChange?.('');
  };

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onSearchChange?.(text);
  };

  const handleClearText = () => {
    setSearchQuery('');
    onSearchChange?.('');
    inputRef.current?.focus();
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerInner}>
        {isSearchExpanded ? (
          /* Expandable Search Input State */
          <Animated.View
            entering={FadeInRight.duration(200)}
            exiting={FadeOutRight.duration(150)}
            style={styles.searchBar}
          >
            <MaterialIcons name="search" size={20} color={Colors.primary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Search topics, MCQs, notes..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={handleChangeText}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {searchQuery.length > 0 && (
              <Pressable
                onPress={handleClearText}
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
          /* Standard Header State */
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(120)}
            style={styles.standardHeaderRow}
          >
            {/* Left: Emblem Box + Greeting Info */}
            <View style={styles.leftProfileGroup}>
              <Pressable
                onPress={onAvatarPress}
                style={styles.emblemBox}
                accessibilityRole="image"
                accessibilityLabel="DocLock emblem"
              >
                {!imageError ? (
                  <Image
                    source={APP_LOGO}
                    style={styles.emblemImage}
                    resizeMode="contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <View style={styles.emblemFallback}>
                    <MaterialIcons
                      name="medical-services"
                      size={22}
                      color={Colors.primary}
                    />
                  </View>
                )}
              </Pressable>

              <View style={styles.greetingGroup}>
                <View style={styles.nameRow}>
                  <Text style={styles.greetingTitle}>Hy, {userName}</Text>
                  <Text style={styles.waveEmoji}>👋</Text>
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            </View>

            {/* Right: Search & Notification Buttons Pill (matching Qbank & Videos) */}
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
                accessibilityLabel="Search"
              >
                <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
              </AnimatedPressable>

              <AnimatedPressable
                onPress={onNotificationPress}
                onPressIn={() => {
                  notifBtnScale.value = withSpring(0.92, Motion.tactileSpring);
                }}
                onPressOut={() => {
                  notifBtnScale.value = withSpring(1, Motion.tactileSpring);
                }}
                style={[styles.iconButton, notifBtnAnimStyle]}
                accessibilityRole="button"
                accessibilityLabel="Notifications"
              >
                <MaterialIcons
                  name="notifications"
                  size={20}
                  color={Colors.onSurfaceVariant}
                />
                <View style={styles.notificationDot} />
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
  leftProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emblemBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainer,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  emblemFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryFixed,
  },
  greetingGroup: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
    letterSpacing: -0.3,
  },
  waveEmoji: {
    fontSize: 18,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
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
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.background,
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

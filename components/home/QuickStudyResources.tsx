import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Motion } from '@/theme';

export type ResourceId = 'bookmarks' | 'flashcards' | 'downloads' | 'daily_goals';

interface ResourceItem {
  id: ResourceId;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

const RESOURCES: ResourceItem[] = [
  { id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark' },
  { id: 'flashcards', label: 'Flashcards', icon: 'style' },
  { id: 'downloads', label: 'Downloads', icon: 'download-for-offline' },
  { id: 'daily_goals', label: 'Daily Goals', icon: 'check-circle' },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ResourceButton: React.FC<{
  item: ResourceItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, Motion.tactileSpring);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, Motion.tactileSpring);
      }}
      style={[
        styles.button,
        isActive ? styles.buttonActive : styles.buttonInactive,
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={item.label}
    >
      <MaterialIcons
        name={item.icon}
        size={20}
        color={isActive ? '#ffffff' : Colors.onSurfaceVariant}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.buttonText,
          isActive ? styles.buttonTextActive : styles.buttonTextInactive,
        ]}
      >
        {item.label}
      </Text>
    </AnimatedPressable>
  );
};

interface QuickStudyResourcesProps {
  onSelectResource?: (id: ResourceId) => void;
}

export const QuickStudyResources: React.FC<QuickStudyResourcesProps> = ({
  onSelectResource,
}) => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<ResourceId>('bookmarks');

  const handlePress = (id: ResourceId) => {
    setSelectedId(id);
    onSelectResource?.(id);
    if (id === 'bookmarks') router.push('/bookmarks');
    else if (id === 'flashcards') router.push('/flashcards');
    else if (id === 'downloads') router.push('/downloads');
    else if (id === 'daily_goals') router.push('/daily-goals');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick study resources</Text>
      <View style={styles.grid}>
        <View style={styles.row}>
          <ResourceButton
            item={RESOURCES[0]}
            isActive={selectedId === RESOURCES[0].id}
            onPress={() => handlePress(RESOURCES[0].id)}
          />
          <ResourceButton
            item={RESOURCES[1]}
            isActive={selectedId === RESOURCES[1].id}
            onPress={() => handlePress(RESOURCES[1].id)}
          />
        </View>
        <View style={styles.row}>
          <ResourceButton
            item={RESOURCES[2]}
            isActive={selectedId === RESOURCES[2].id}
            onPress={() => handlePress(RESOURCES[2].id)}
          />
          <ResourceButton
            item={RESOURCES[3]}
            isActive={selectedId === RESOURCES[3].id}
            onPress={() => handlePress(RESOURCES[3].id)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 4,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
    letterSpacing: -0.2,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonInactive: {
    backgroundColor: '#eaf0ff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  buttonTextInactive: {
    color: Colors.onSurface,
  },
});

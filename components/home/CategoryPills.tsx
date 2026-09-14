import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Pill } from '@/components/ui/Pill';
import { CategoryItem, CATEGORIES } from '@/data/homeData';
import { Colors, Spacing } from '@/theme';

interface CategoryPillsProps {
  categories?: CategoryItem[];
  selectedId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories = CATEGORIES,
  selectedId,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          return (
            <Pill
              key={category.id}
              label={category.name}
              selected={isSelected}
              onPress={() => onSelectCategory(category.id)}
              icon={
                <MaterialIcons
                  name={category.icon as any}
                  size={16}
                  color={isSelected ? Colors.primary : Colors.textSecondary}
                />
              }
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: 4,
  },
});

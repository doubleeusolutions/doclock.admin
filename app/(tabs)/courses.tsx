import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Shapes, Spacing, Typography } from '@/theme';

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="menu-book" size={36} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Medical Curriculum</Text>
        <Text style={styles.subtitle}>
          System-by-system masterclasses and high-yield video libraries are coming soon.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: Shapes.pill,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
});

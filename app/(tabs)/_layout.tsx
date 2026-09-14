import React from 'react';
import { Tabs } from 'expo-router';
import { useWindowDimensions, Easing } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomNavigation, NavTabId } from '@/components/navigation/BottomNavigation';
import { Colors } from '@/theme';

export default function TabsLayout() {
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
        animation: 'shift',
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            opacity: current.progress.interpolate({
              inputRange: [-1, -0.4, 0, 0.4, 1],
              outputRange: [0, 0.9, 1, 0.9, 0],
            }),
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-screenWidth, 0, screenWidth],
                }),
              },
            ],
          },
        }),
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 260,
            easing: Easing.out(Easing.cubic),
          },
        },
      }}
      tabBar={({ state, navigation }: BottomTabBarProps) => {
        const currentRoute = state.routes[state.index]?.name;
        const activeTab: NavTabId =
          currentRoute === 'index' ? 'home' : (currentRoute as NavTabId);

        const handleSelectTab = (tab: NavTabId) => {
          const targetRoute = tab === 'home' ? 'index' : tab;
          navigation.navigate(targetRoute);
        };

        return (
          <BottomNavigation
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />
        );
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="qbank" options={{ title: 'Qbank' }} />
      <Tabs.Screen name="videos" options={{ title: 'Videos' }} />
      <Tabs.Screen name="tests" options={{ title: 'Tests' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      {/* Legacy routes preserved for backwards compatibility */}
      <Tabs.Screen name="practice" options={{ href: null }} />
      <Tabs.Screen name="courses" options={{ href: null }} />
    </Tabs>
  );
}

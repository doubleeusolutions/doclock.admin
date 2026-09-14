import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Shapes, Spacing } from '@/theme';

export type TonalTier = 'surface' | 'container' | 'containerHigh' | 'primaryContainer';

interface TonalSurfaceProps {
  children: React.ReactNode;
  tier?: TonalTier;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TonalSurface: React.FC<TonalSurfaceProps> = ({
  children,
  tier = 'container',
  borderRadius = Shapes.extraLarge,
  style,
  testID,
}) => {
  const getBackgroundColor = () => {
    switch (tier) {
      case 'surface':
        return Colors.surface;
      case 'containerHigh':
        return Colors.surfaceContainerHigh;
      case 'primaryContainer':
        return Colors.primaryContainer;
      case 'container':
      default:
        return Colors.surfaceContainer;
    }
  };

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    padding: Spacing.xl,
    overflow: 'hidden',
  },
});

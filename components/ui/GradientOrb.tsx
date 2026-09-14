import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/theme';

interface GradientOrbProps {
  colors?: [string, string, string];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const GradientOrb: React.FC<GradientOrbProps> = ({
  colors = [Colors.accentBlue, Colors.accentCyan, Colors.accentViolet],
  style,
  children,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Primary fluid diagonal mesh */}
      <LinearGradient
        colors={[colors[0], colors[1]]}
        start={{ x: -0.1, y: 0.1 }}
        end={{ x: 1.1, y: 0.9 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Layered soft violet/amorphous secondary glow */}
      <LinearGradient
        colors={['transparent', colors[2], 'transparent']}
        start={{ x: 0.8, y: -0.2 }}
        end={{ x: 0.1, y: 1.2 }}
        style={[StyleSheet.absoluteFillObject, { opacity: 0.75 }]}
      />

      {/* Modern top-left cyan highlight for AI luminous depth */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.35)', 'transparent']}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 0.7, y: 0.7 }}
        style={StyleSheet.absoluteFillObject}
      />

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
});

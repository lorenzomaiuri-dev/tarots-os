import React from 'react';

import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';

import { useTheme } from 'react-native-paper';

interface LiquidGlassProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  cornerRadius?: number;
}

export const LiquidGlass = ({
  children,
  style,
  intensity = 80,
  cornerRadius = 30,
}: LiquidGlassProps) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderRadius: cornerRadius }, style]}>
      {/* 1. THE LIQUID BLUR (Engine) */}
      {/* 'systemChromeMaterial' is the thickest, most "liquid" glass on iOS */}
      <BlurView
        intensity={intensity}
        tint={theme.dark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. BRIGHTNESS BOOST (Simulation) */}
      {/* Simulates brightness(150%) from your CSS example */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)' },
        ]}
      />

      {/* 3. SPECULAR HIGHLIGHT (Inner Rim) */}
      <View
        style={[
          styles.innerRim,
          {
            borderRadius: cornerRadius,
            borderColor: theme.dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)',
          },
        ]}
      />

      {/* 4. CONTENT */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    // Android Fallback for "Liquid" opaque look
    backgroundColor: Platform.OS === 'android' ? 'rgba(20, 20, 25, 0.95)' : 'transparent',
  },
  innerRim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    margin: 0, // Tight fit
    zIndex: 10,
    pointerEvents: 'none', // Allow clicks to pass through
  },
});

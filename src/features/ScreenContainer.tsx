import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export const ScreenContainer: React.FC<Props> = ({ children, style, centered }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: theme.colors.background 
      },
      centered && styles.centered,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
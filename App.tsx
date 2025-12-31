import React, { useEffect } from 'react';

import { useColorScheme } from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import i18n from './src/locales/i18n';
import { AppNavigator } from './src/navigation/AppNavigator';
import { NotificationService } from './src/services/notifications';
import { useSettingsStore } from './src/store/useSettingsStore';

if (!__DEV__) {
  // Replace console.log with an empty function
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const MysticalDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#D0BCFF',
    onPrimary: '#381E72',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',

    secondary: '#CCC2DC',
    onSecondary: '#332D41',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',

    background: '#121212',
    onBackground: '#E6E1E5',

    surface: 'transparent',
    surfaceVariant: 'rgba(255, 255, 255, 0.05)',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',

    outline: '#938F99',
    outlineVariant: '#49454F',

    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#232323',
      level3: '#282828',
      level4: '#2C2C2C',
      level5: '#313131',
    },

    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
};

const { LightTheme: NavLightTheme, DarkTheme: NavDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const MyNavDarkTheme = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    background: MysticalDarkTheme.colors.background,
    card: MysticalDarkTheme.colors.elevation.level1,
    border: MysticalDarkTheme.colors.outlineVariant,
  },
};

export default function App() {
  const systemColorScheme = useColorScheme();

  const { preferences } = useSettingsStore();
  const currentTheme = preferences.theme;
  const currentLanguage = preferences.language;

  useEffect(() => {
    if (currentLanguage && i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const isDark =
    currentTheme === 'dark' || (currentTheme === 'system' && systemColorScheme === 'dark');

  const paperTheme = isDark ? MysticalDarkTheme : MD3LightTheme;
  const navTheme = isDark ? MyNavDarkTheme : NavLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer theme={navTheme}>
          <AppNavigator />
          <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor={paperTheme.colors.background}
          />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

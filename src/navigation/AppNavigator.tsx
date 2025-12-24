import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../features/home/HomeScreen';
import DeckSelectionScreen from '../features/deck-selection/DeckSelectionScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
import SpreadSelectionScreen from '../features/reading/SpreadSelectionScreen';
import ReadingTableScreen from '../features/reading/ReadingTableScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: { fontWeight: '300', fontFamily: 'serif' }, // TODO: USE CONFIG
        headerShadowVisible: false, // Clean look
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="DeckSelection" 
        component={DeckSelectionScreen} 
        options={{ title: t('common:deck_selection_title', 'Select a Deck') }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: t('common:settings_title', 'Settings') }} 
      />
      <Stack.Screen 
        name="SpreadSelection" 
        component={SpreadSelectionScreen} 
        options={{ title: t('common:new_reading_title', 'New Reading') }} 
      />
      <Stack.Screen 
        name="ReadingTable" 
        component={ReadingTableScreen} 
        options={{ title: t('common:reading_title', 'Reading') }} 
      />
    </Stack.Navigator>
  );
};
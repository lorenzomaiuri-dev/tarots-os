import React from 'react';

import { StyleSheet } from 'react-native';

import { BlurView } from 'expo-blur';

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { BiometricGate } from '../components/BiometricGate';
import DeckExplorerScreen from '../features/deck-explorer/DeckExplorerScreen';
import DeckSelectionScreen from '../features/deck-selection/DeckSelectionScreen';
import HistoryScreen from '../features/history/HistoryScreen';
import ReadingDetailScreen from '../features/history/ReadingDetailScreen';
import StatsScreen from '../features/history/StatsScreen';
// Screens
import HomeScreen from '../features/home/HomeScreen';
import OnboardingScreen from '../features/onboarding/OnboardingScreen';
import ReadingTableScreen from '../features/reading/ReadingTableScreen';
import SpreadSelectionScreen from '../features/reading/SpreadSelectionScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
import { useSettingsStore } from '../store/useSettingsStore';
import { BottomTabParamList, RootStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isOnboardingCompleted } = useSettingsStore();

  // 1. The Tab Navigator (Bottom Bar)
  const MainTabs = () => {
    const theme = useTheme();

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            borderTopColor: 'transparent',
            backgroundColor: 'transparent',
            elevation: 0,
          },
          tabBarBackground: () => (
            <BlurView
              tint={theme.dark ? 'dark' : 'light'}
              intensity={80}
              style={StyleSheet.absoluteFill}
            />
          ),
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceDisabled,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            } else if (route.name === 'HistoryTab') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'SettingsTab') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen
          name="HistoryTab"
          component={() => (
            <BiometricGate>
              <HistoryScreen />
            </BiometricGate>
          )}
          options={{ title: t('common:history_title', 'Journal') }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{ title: t('common:settings_title', 'Settings') }}
        />
      </Tab.Navigator>
    );
  };

  return (
    <Stack.Navigator
      initialRouteName={isOnboardingCompleted ? 'MainTabs' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: { fontWeight: '300', fontFamily: 'serif' }, // TODO: USE CONFIG
        headerShadowVisible: false, // Clean look
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      {!isOnboardingCompleted ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          {/* The Tabs are the main screen */}
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />

          {/* Other screens are pushed on top */}
          <Stack.Screen
            name="DeckSelection"
            component={DeckSelectionScreen}
            options={{ title: t('common:deck_selection_title', 'Select Deck') }}
          />
          <Stack.Screen
            name="SpreadSelection"
            component={SpreadSelectionScreen}
            options={{ title: t('common:new_reading_title', 'New Reading') }}
          />
          <Stack.Screen
            name="ReadingTable"
            component={ReadingTableScreen}
            options={{ title: t('common:reading_title', 'Reading...') }}
          />
          <Stack.Screen
            name="ReadingDetail"
            component={ReadingDetailScreen}
            options={{
              title: t('common:reading_detail_title', 'Reading Detail'),
            }}
          />
          <Stack.Screen
            name="DeckExplorer"
            component={DeckExplorerScreen}
            options={{
              title: t('common:deck_explorer_title', 'Deck Explorer'),
            }}
          />
          <Stack.Screen
            name="Stats"
            component={StatsScreen}
            options={{ title: t('common:stats_title', 'Stats') }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

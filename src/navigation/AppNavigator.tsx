import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList, BottomTabParamList } from '../types/navigation';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// Screens
import HomeScreen from '../features/home/HomeScreen';
import HistoryScreen from '../features/history/HistoryScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
import DeckSelectionScreen from '../features/deck-selection/DeckSelectionScreen';
import SpreadSelectionScreen from '../features/reading/SpreadSelectionScreen';
import ReadingTableScreen from '../features/reading/ReadingTableScreen';
import ReadingDetailScreen from '../features/history/ReadingDetailScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {  
  const { t } = useTranslation();
  const theme = useTheme();

  // 1. The Tab Navigator (Bottom Bar)
  const MainTabs = () => {  
    const theme = useTheme();

    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.elevation.level1,
            borderTopColor: 'rgba(255,255,255,0.1)',
          },
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
        <Tab.Screen 
          name="HomeTab" 
          component={HomeScreen} 
          options={{ title: 'Home' }} 
        />
        <Tab.Screen 
          name="HistoryTab" 
          component={HistoryScreen} 
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
      initialRouteName="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.onBackground,
        headerTitleStyle: { fontWeight: '300', fontFamily: 'serif' }, // TODO: USE CONFIG
        headerShadowVisible: false, // Clean look
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      {/* The Tabs are the main screen */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
        options={{ headerShown: false }} 
      />

      {/* Other screens are pushed on top */}
      <Stack.Screen 
        name="DeckSelection" 
        component={DeckSelectionScreen} 
        options={{ title: 'Seleziona Mazzo' }} 
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
        options={{ title: t('common:reading_detail_title', 'Reading Detaoò') }} 
      />
    </Stack.Navigator>
  );
};
import { Platform } from 'react-native';

import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'daily-channel';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
} as any);

export const NotificationService = {
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Daily Ritual',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#D0BCFF',
      });
    }

    return finalStatus === 'granted';
  },

  scheduleDailyReminder: async (hour: number, minute: number, title: string, message: string) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          android: {
            channelId: CHANNEL_ID,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
        } as any,

        trigger: {
          type: 'daily',
          hour: Math.floor(hour),
          minute: Math.floor(minute),
          repeats: true,
        } as any,
      });

      return true;
    } catch (error) {
      console.error('Notification Scheduling Error:', error);
      throw error;
    }
  },

  scheduleWelcomeNotification: async (title: string, message: string) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          android: {
            channelId: CHANNEL_ID,
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
        } as any,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
          repeats: false,
        },
      });
    } catch (error) {
      console.error('Welcome Notification Error:', error);
    }
  },

  cancelAll: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};

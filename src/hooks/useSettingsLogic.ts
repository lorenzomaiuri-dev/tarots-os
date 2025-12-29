import { useState } from 'react';

import { Alert } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import { useTranslation } from 'react-i18next';

import i18n from '../locales/i18n';
import { AppInfoService, ChangelogEntry } from '../services/appInfo';
import { BackupService } from '../services/backup';
import { NotificationService } from '../services/notifications';
import { useHistoryStore } from '../store/useHistoryStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useHaptics } from './useHaptics';

export const useSettingsLogic = () => {
  const { t } = useTranslation();
  const haptics = useHaptics();

  const { preferences, updatePreferences, aiConfig, setAiConfig, resetAllSettings } =
    useSettingsStore();

  const { clearHistory } = useHistoryStore();

  const [modalState, setModalState] = useState({
    lang: false,
    theme: false,
    ai: false,
    reset: false,
    about: false,
  });

  const [changelogData, setChangelogData] = useState<{ data: ChangelogEntry[]; loading: boolean }>({
    data: [],
    loading: false,
  });

  const toggleModal = (key: keyof typeof modalState, value: boolean) => {
    setModalState((prev) => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (lang: string) => {
    haptics.selection();
    i18n.changeLanguage(lang);
    updatePreferences({ language: lang });
    toggleModal('lang', false);
  };

  const handleThemeChange = (theme: any) => {
    haptics.selection();
    updatePreferences({ theme });
    toggleModal('theme', false);
  };

  const handleAiSave = (conf: any) => {
    setAiConfig(conf);
    toggleModal('ai', false);
    haptics.notification('success');
  };

  const handleExport = async () => {
    haptics.impact('medium');
    try {
      const currentReadings = useHistoryStore.getState().readings;

      if (!currentReadings || currentReadings.length === 0) {
        Alert.alert(t('common:error'), t('common:backup_no_data'));
        return;
      }

      const data = {
        history: currentReadings,
        version: 1,
        exportDate: new Date().toISOString(),
      };

      await BackupService.exportJson(data, 'tarot_journal_backup.json');
      haptics.notification('success');
    } catch (e) {
      Alert.alert(t('common:error'), t('common:error_backup'));
    }
  };

  const handleImport = async () => {
    haptics.impact('medium');
    try {
      const parsed = await BackupService.importJson<{ history: any[] }>();
      if (!parsed) return;

      Alert.alert(
        t('common:restore'),
        `${t('common:found')} ${parsed.history.length} ${t('common:readings')}.`,
        [
          { text: t('common:cancel'), style: 'cancel' },
          {
            text: t('common:restore'),
            style: 'destructive',
            onPress: () => {
              useHistoryStore.setState({ readings: parsed.history });
              haptics.notification('success');
            },
          },
        ]
      );
    } catch (e) {
      Alert.alert(t('common:error'), t('common:error_invalid_file'));
    }
  };

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(t('common:biometrics_error_title'), t('common:biometrics_error_desc'));
        return;
      }

      const test = await LocalAuthentication.authenticateAsync({
        promptMessage: t('common:biometrics_confirm'),
      });

      if (!test.success) return;
    }

    haptics.selection();
    updatePreferences({ biometricsEnabled: value });
  };

  const handleToggleReminder = async (val: boolean) => {
    try {
      if (val) {
        const granted = await NotificationService.requestPermissions();
        if (!granted) {
          Alert.alert(t('common:permissions_denied'), t('common:enable_notifications_prompt'));
          updatePreferences({ notificationsEnabled: false });
          return;
        }

        // 1. Schedule Daily
        await NotificationService.scheduleDailyReminder(
          8,
          30,
          t('common:notification_title', 'Your Morning Ritual 🔮'),
          t('common:notification_message', 'Your cards are ready.')
        );

        // 2. Schedule Welcome
        await NotificationService.scheduleWelcomeNotification(
          t('common:notification_active_title', 'Notifications Enabled'),
          t('common:notification_active_message', 'You will receive your reading at 8:30.')
        );

        updatePreferences({ notificationsEnabled: true });
        haptics.notification('success');
      } else {
        await NotificationService.cancelAll();
        updatePreferences({ notificationsEnabled: false });
        haptics.selection();
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(t('common:error'), error.toString());
    }
  };

  const handleOpenAbout = async () => {
    haptics.impact('light');
    toggleModal('about', true);
    if (changelogData.data.length === 0) {
      setChangelogData((prev) => ({ ...prev, loading: true }));
      const data = await AppInfoService.getChangelog();
      setChangelogData({ data, loading: false });
    }
  };

  const handleFactoryReset = () => {
    haptics.notification('error');
    clearHistory();
    resetAllSettings();
    toggleModal('reset', false);
  };

  return {
    preferences,
    aiConfig,
    modalState,
    changelogData,
    toggleModal,
    handleLanguageChange,
    handleThemeChange,
    handleAiSave,
    handleExport,
    handleImport,
    handleToggleBiometrics,
    handleToggleReminder,
    handleOpenAbout,
    handleFactoryReset,
    updatePreferences,
  };
};

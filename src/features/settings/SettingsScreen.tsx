import React, { useState } from 'react';

import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Avatar,
  Button,
  List,
  RadioButton,
  Switch,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';

// Components
import { GlassSurface } from '../../components/GlassSurface';
import { GlassyModal } from '../../components/GlassyModal';
// Logic & Constants
import { DEFAULTS } from '../../constants';
import { useHaptics } from '../../hooks/useHaptics';
import i18n from '../../locales/i18n';
import { AppInfoService, ChangelogEntry } from '../../services/appInfo';
import { BackupService } from '../../services/backup';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ScreenContainer } from '../ScreenContainer';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const { preferences, updatePreferences, aiConfig, setAiConfig, resetAllSettings } =
    useSettingsStore();
  const { clearHistory } = useHistoryStore();

  // Modal Visibility States
  const [aiVisible, setAiVisible] = useState(false);
  const [themeVisible, setThemeVisible] = useState(false);
  const [langVisible, setLangVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [isChangelogLoading, setIsChangelogLoading] = useState(false);

  // Temp AI States
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModelId, setTempModelId] = useState('');
  const [tempBaseUrl, setTempBaseUrl] = useState('');

  const handleToggleBiometrics = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          t('common:biometrics_error_title', 'Not Available'),
          t(
            'common:biometrics_error_desc',
            "Your device does not support biometrics or you haven't configured fingerprint/face."
          )
        );
        return;
      }

      // Test
      const test = await LocalAuthentication.authenticateAsync({
        promptMessage: t('common:biometrics_confirm', 'Confirm Identiy'),
      });

      if (!test.success) return;
    }

    haptics.selection();
    updatePreferences({ biometricsEnabled: value });
  };

  const handleOpenAbout = async () => {
    haptics.impact('light');
    setAboutVisible(true);

    if (changelog.length === 0) {
      setIsChangelogLoading(true);
      const data = await AppInfoService.getChangelog();
      setChangelog(data);
      setIsChangelogLoading(false);
    }
  };

  const changeLanguage = (lang: string) => {
    haptics.selection();
    i18n.changeLanguage(lang);
    updatePreferences({ language: lang });
    setLangVisible(false);
  };

  const handleExport = async () => {
    haptics.impact('medium');
    try {
      const data = {
        history: useHistoryStore.getState().readings,
        version: 1,
        exportDate: new Date().toISOString(),
      };
      await BackupService.exportJson(data, 'tarot_journal_backup.json');
      haptics.notification('success');
    } catch (e) {
      console.error(e);
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
              Alert.alert(t('common:success'), t('common:success_message_backup'));
            },
          },
        ]
      );
    } catch (e) {
      console.error(e);
      Alert.alert(t('common:error'), t('common:error_invalid_file'));
    }
  };

  const openAiConfig = () => {
    setTempApiKey(aiConfig.apiKey || '');
    setTempModelId(aiConfig.modelId || DEFAULTS.AI_MODEL);
    setTempBaseUrl(aiConfig.baseUrl || DEFAULTS.BASE_URL);
    setAiVisible(true);
    haptics.impact('light');
  };

  const saveAiConfig = () => {
    setAiConfig({
      apiKey: tempApiKey.trim(),
      modelId: tempModelId.trim() || DEFAULTS.AI_MODEL,
      baseUrl: tempBaseUrl.trim() || DEFAULTS.BASE_URL,
    });
    setAiVisible(false);
    haptics.notification('success');
  };

  const handleFactoryReset = () => {
    haptics.notification('error');

    // Clear Data
    clearHistory();

    // Clear Settings & Onboarding state
    resetAllSettings();

    //  Close Modal
    setResetVisible(false);

    // Note: Since isOnboardingCompleted is now false, the AppNavigator
    // will automatically redirect to the Onboarding screen on next render.
  };

  // REUSABLE ROW COMPONENT
  const SettingRow = ({ title, description, right, onPress, icon, destructive }: any) => (
    <List.Item
      title={title}
      description={description}
      onPress={onPress}
      titleStyle={[styles.settingTitle, destructive && { color: theme.colors.error }]}
      descriptionStyle={styles.settingDesc}
      left={(props) => (
        <List.Icon
          {...props}
          icon={icon}
          color={destructive ? theme.colors.error : theme.colors.primary}
        />
      )}
      right={right}
      style={styles.settingItem}
    />
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.pageTitle}>
            {t('common:settings', 'Settings')}
          </Text>
          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </View>

        {/* SECTION: ORACLE RULES */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:reading', 'ORACLE RULES')}
        </Text>
        <GlassSurface intensity={12} style={styles.settingsCard}>
          <SettingRow
            title={t('common:allow_reversed_cards', 'Allow Reversed Cards')}
            description={t('common:reversed_desc', 'Include inverted card meanings')}
            icon="rotate-3d-variant"
            right={() => (
              <Switch
                value={preferences.allowReversed}
                onValueChange={(val) => {
                  haptics.selection();
                  updatePreferences({ allowReversed: val });
                }}
              />
            )}
          />
          <View style={styles.divider} />
          <SettingRow
            title={t('common:only_major_arcana', 'Only Major Arcana')}
            description={t('common:major_only_desc', 'Focus only on the 22 Greater Secrets')}
            icon="star-shooting-outline"
            right={() => (
              <Switch
                value={preferences.onlyMajorArcana}
                onValueChange={(val) => {
                  haptics.selection();
                  updatePreferences({ onlyMajorArcana: val });
                }}
              />
            )}
          />
        </GlassSurface>

        {/* SECTION: AESTHETICS */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:appearance', 'AESTHETICS')}
        </Text>
        <GlassSurface intensity={12} style={styles.settingsCard}>
          <SettingRow
            title={t('common:theme', 'Theme')}
            description={t(`common:theme_${preferences.theme}`)}
            icon="palette-outline"
            onPress={() => setThemeVisible(true)}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
          />
          <View style={styles.divider} />
          <SettingRow
            title={t('common:language', 'Language')}
            description={preferences.language === 'it' ? 'Italiano' : 'English'}
            icon="translate"
            onPress={() => setLangVisible(true)}
            right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
          />
          <View style={styles.divider} />
          <SettingRow
            title={t('common:haptics', 'Haptics')}
            description={t('common:haptics_description', 'Tactile feedback')}
            icon="vibrate"
            right={() => (
              <Switch
                value={preferences.hapticsEnabled}
                onValueChange={(val) => {
                  if (val) haptics.impact('medium');
                  updatePreferences({ hapticsEnabled: val });
                }}
              />
            )}
          />
        </GlassSurface>

        {/* SECTION: SECURITY AND PRIVACY */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:security_privacy', 'Security & Privacy')}
        </Text>
        <GlassSurface intensity={12} style={styles.settingsCard}>
          <SettingRow
            title={t('common:biometric_lock', 'Biometric Lock')}
            description={t('common:biometric_desc', 'Protect your Journal with FaceID/Fingerprint')}
            icon="fingerprint"
            right={() => (
              <Switch
                value={preferences.biometricsEnabled}
                onValueChange={handleToggleBiometrics}
              />
            )}
          />
        </GlassSurface>

        {/* SECTION: AI */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:ai', 'DIVINE INTELLIGENCE')}
        </Text>
        <GlassSurface intensity={12} style={styles.settingsCard}>
          <SettingRow
            title={t('common:ai_provider_config', 'Spirit Engine')}
            description={aiConfig.modelId || 'Not set'}
            icon="auto-fix"
            onPress={openAiConfig}
            right={(props: any) => <List.Icon {...props} icon="cog-outline" />}
          />
          <View style={styles.divider} />
          <SettingRow
            title={t('common:get_api_key_title', 'Acquire Key')}
            description="OpenRouter.ai"
            icon="key-outline"
            onPress={() => Linking.openURL('https://openrouter.ai/keys')}
            right={(props: any) => <List.Icon {...props} icon="open-in-new" />}
          />
        </GlassSurface>

        {/* SECTION DATA */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:chronicles', 'CHRONICLES')}
        </Text>
        <GlassSurface intensity={12} style={styles.settingsCard}>
          <SettingRow
            title={t('common:export_backup', 'Seal Memories')}
            icon="book-arrow-up-outline"
            onPress={handleExport}
          />
          <View style={styles.divider} />
          <SettingRow
            title={t('common:import_backup', 'Restore Spirits')}
            icon="book-arrow-down-outline"
            onPress={handleImport}
          />
        </GlassSurface>

        {/* SECTION: DANGER ZONE */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.error }]}>
          {t('common:danger_zone', 'THE ABYSS')}
        </Text>
        <GlassSurface
          intensity={12}
          style={[styles.settingsCard, { borderColor: theme.colors.error + '40' }]}
        >
          <SettingRow
            title={t('common:factory_reset', 'Erase Everything')}
            description={t('common:factory_reset_desc', 'Wipe all memories and reset settings')}
            icon="alert-octagon-outline"
            destructive
            onPress={() => {
              haptics.impact('heavy');
              setResetVisible(true);
            }}
          />
        </GlassSurface>

        {/* REFINED FOOTER */}
        <TouchableOpacity onPress={handleOpenAbout} style={styles.versionFooter}>
          <Text style={styles.versionText}>
            {t('common:app_name')} — {AppInfoService.getFullVersionString()}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODALS --- */}

      {/* Language Modal */}
      <GlassyModal
        visible={langVisible}
        onClose={() => setLangVisible(false)}
        title={t('common:select_language')}
      >
        <RadioButton.Group onValueChange={changeLanguage} value={preferences.language}>
          <RadioButton.Item
            label="Italiano"
            value="it"
            color={theme.colors.primary}
            labelStyle={styles.radioLabel}
          />
          <RadioButton.Item
            label="English"
            value="en"
            color={theme.colors.primary}
            labelStyle={styles.radioLabel}
          />
        </RadioButton.Group>
      </GlassyModal>

      {/* Theme Modal */}
      <GlassyModal
        visible={themeVisible}
        onClose={() => setThemeVisible(false)}
        title={t('common:select_theme')}
      >
        <RadioButton.Group
          onValueChange={(v) => {
            updatePreferences({ theme: v as any });
            setThemeVisible(false);
          }}
          value={preferences.theme}
        >
          <RadioButton.Item
            label={t('common:theme_system')}
            value="system"
            color={theme.colors.primary}
            labelStyle={styles.radioLabel}
          />
          <RadioButton.Item
            label={t('common:theme_light')}
            value="light"
            color={theme.colors.primary}
            labelStyle={styles.radioLabel}
          />
          <RadioButton.Item
            label={t('common:theme_dark')}
            value="dark"
            color={theme.colors.primary}
            labelStyle={styles.radioLabel}
          />
        </RadioButton.Group>
      </GlassyModal>

      {/* AI Config Modal */}
      <GlassyModal
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        title={t('common:ai_config')}
      >
        <TextInput
          label="Base URL"
          value={tempBaseUrl}
          onChangeText={setTempBaseUrl}
          mode="flat"
          style={styles.glassInput}
          autoCapitalize="none"
        />
        <TextInput
          label="API Key"
          value={tempApiKey}
          onChangeText={setTempApiKey}
          mode="flat"
          secureTextEntry
          style={styles.glassInput}
        />
        <TextInput
          label="Model ID"
          value={tempModelId}
          onChangeText={setTempModelId}
          mode="flat"
          style={styles.glassInput}
          autoCapitalize="none"
        />
        <Button mode="contained" onPress={saveAiConfig} style={styles.saveBtn}>
          {t('common:save')}
        </Button>
      </GlassyModal>

      {/* Factory Reset Confirmation Modal */}
      <GlassyModal
        visible={resetVisible}
        onClose={() => setResetVisible(false)}
        title={t('common:are_you_sure', 'Final Warning')}
      >
        <View style={styles.resetModalContent}>
          <Avatar.Icon
            size={64}
            icon="delete-forever"
            style={{ backgroundColor: 'transparent' }}
            color={theme.colors.error}
          />
          <Text variant="bodyMedium" style={styles.resetWarningText}>
            {t(
              'common:reset_warning',
              'This action will permanently erase your chronicles and return the app to its original state. This cannot be undone.'
            )}
          </Text>

          <Button
            mode="contained"
            onPress={handleFactoryReset}
            buttonColor={theme.colors.error}
            style={styles.confirmResetBtn}
            contentStyle={{ height: 50 }}
          >
            {t('common:confirm_erase', 'Erase All Data')}
          </Button>

          <Button
            mode="text"
            onPress={() => setResetVisible(false)}
            textColor={theme.colors.onSurfaceVariant}
          >
            {t('common:cancel_erase', 'Keep my memories')}
          </Button>
        </View>
      </GlassyModal>

      {/* ABOUT / CHANGELOG MODAL */}
      <GlassyModal
        visible={aboutVisible}
        onClose={() => setAboutVisible(false)}
        title={t('common:about_title', 'Sacred Scrolls')}
      >
        <View style={styles.aboutContent}>
          {/* Logo & Version */}
          <Avatar.Image
            size={80}
            source={require('../../../assets/icon.png')}
            style={styles.aboutLogo}
          />
          <Text variant="titleMedium" style={styles.aboutAppName}>
            {t('common:app_name')}
          </Text>
          <Text variant="labelSmall" style={styles.aboutVersion}>
            {AppInfoService.getFullVersionString()}
          </Text>

          <View style={styles.changelogSection}>
            <Text variant="labelLarge" style={styles.changelogHeader}>
              {t('common:latest_changes', 'LATEST REVELATIONS')}
            </Text>

            {isChangelogLoading ? (
              <ActivityIndicator
                animating
                color={theme.colors.primary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              changelog[0]?.changes.map((change, i) => (
                <View key={i} style={styles.changeItem}>
                  <View style={[styles.bullet, { backgroundColor: theme.colors.primary }]} />
                  <Text variant="bodySmall" style={styles.changeText}>
                    {change}
                  </Text>
                </View>
              ))
            )}
          </View>

          <Button
            mode="text"
            onPress={() => Linking.openURL('https://...')}
            textColor={theme.colors.primary}
          >
            {t('common:privacy_policy', 'Privacy Policy')}
          </Button>
        </View>
      </GlassyModal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  headerContainer: { marginTop: 20, marginBottom: 30 },
  pageTitle: { fontFamily: 'serif', fontWeight: 'bold' },
  accentLine: { height: 1, width: 40, marginTop: 12, opacity: 0.5 },
  sectionLabel: {
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '900',
    opacity: 0.8,
  },
  settingsCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: { paddingVertical: 4 },
  settingTitle: { fontSize: 16, fontWeight: '600' },
  settingDesc: { fontSize: 12, opacity: 0.5 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBlur: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    width: '85%',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: { fontFamily: 'serif', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  radioLabel: { fontSize: 16 },
  glassInput: { backgroundColor: 'transparent', marginBottom: 12 },
  saveBtn: { marginTop: 12, borderRadius: 12 },
  resetModalContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  resetWarningText: {
    textAlign: 'center',
    marginVertical: 20,
    opacity: 0.8,
    lineHeight: 22,
  },
  confirmResetBtn: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 10,
  },
  versionFooter: {
    marginTop: 30,
    alignItems: 'center',
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  copyrightText: {
    fontSize: 9,
    opacity: 0.2,
    marginTop: 4,
  },
  aboutContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  aboutLogo: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  aboutAppName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  aboutVersion: {
    opacity: 0.5,
    marginBottom: 24,
  },
  changelogSection: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  changelogHeader: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.7,
  },
  changeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 10,
  },
  changeText: {
    opacity: 0.8,
  },
});

export default SettingsScreen;

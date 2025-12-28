import React from 'react';

import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { List, Switch, Text, useTheme } from 'react-native-paper';

import { SettingRow } from '../../components/SettingRow';
// Components
import { SettingSection } from '../../components/SettingSection';
// Modals
import { AIConfigModal } from '../../components/modals/AIConfigModal';
import { AboutModal } from '../../components/modals/AboutModal';
import { LanguageModal } from '../../components/modals/LanguageModal';
import { ResetModal } from '../../components/modals/ResetModal';
import { ThemeModal } from '../../components/modals/ThemeModal';
// Logic Hook & Service
import { useSettingsLogic } from '../../hooks/useSettingsLogic';
import { AppInfoService } from '../../services/appInfo';
import { ScreenContainer } from '../ScreenContainer';

const SettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
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
  } = useSettingsLogic();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.pageTitle}>
            {t('common:settings')}
          </Text>
          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </View>

        <SettingSection label={t('common:reading')}>
          <SettingRow
            title={t('common:allow_reversed_cards')}
            leftIcon="rotate-3d-variant"
            right={() => (
              <Switch
                value={preferences.allowReversed}
                onValueChange={(v) => updatePreferences({ allowReversed: v })}
              />
            )}
          />
          <SettingRow
            title={t('common:only_major_arcana')}
            description={t('common:major_only_desc')}
            leftIcon="star-shooting-outline"
            right={() => (
              <Switch
                value={preferences.onlyMajorArcana}
                onValueChange={(v) => updatePreferences({ onlyMajorArcana: v })}
              />
            )}
          />
          <SettingRow
            title={t('common:morning_ritual')}
            leftIcon="bell-ring-outline"
            right={() => (
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={handleToggleReminder}
              />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:appearance')}>
          <SettingRow
            title={t('common:theme')}
            description={t(`common:theme_${preferences.theme}`)}
            leftIcon="palette-outline"
            onPress={() => toggleModal('theme', true)}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <SettingRow
            title={t('common:language')}
            description={preferences.language === 'it' ? 'Italiano' : 'English'}
            leftIcon="translate"
            onPress={() => toggleModal('lang', true)}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
          <SettingRow
            title={t('common:haptics')}
            description={t('common:haptics_description')}
            leftIcon="vibrate"
            right={() => (
              <Switch
                value={preferences.hapticsEnabled}
                onValueChange={(v) => updatePreferences({ hapticsEnabled: v })}
              />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:security_privacy')}>
          <SettingRow
            title={t('common:biometric_lock')}
            description={t('common:biometric_desc')}
            leftIcon="fingerprint"
            right={() => (
              <Switch
                value={preferences.biometricsEnabled}
                onValueChange={handleToggleBiometrics}
              />
            )}
          />
        </SettingSection>

        <SettingSection label={t('common:ai')}>
          <SettingRow
            title={t('common:ai_provider_config')}
            description={aiConfig.modelId}
            leftIcon="auto-fix"
            onPress={() => toggleModal('ai', true)}
            right={(props) => <List.Icon {...props} icon="cog-outline" />}
          />
          <SettingRow
            title={t('common:get_api_key_title')}
            leftIcon="key-outline"
            onPress={() => Linking.openURL('https://openrouter.ai/keys')}
            right={(props) => <List.Icon {...props} icon="open-in-new" />}
          />
        </SettingSection>

        <SettingSection label={t('common:chronicles')}>
          <SettingRow
            title={t('common:export_backup')}
            leftIcon="book-arrow-up-outline"
            onPress={handleExport}
          />
          <SettingRow
            title={t('common:import_backup')}
            leftIcon="book-arrow-down-outline"
            onPress={handleImport}
          />
        </SettingSection>

        <SettingSection label={t('common:danger_zone')} isDestructive>
          <SettingRow
            title={t('common:factory_reset')}
            description={t('common:factory_reset_desc')}
            leftIcon="alert-octagon-outline"
            destructive
            onPress={() => toggleModal('reset', true)}
          />
        </SettingSection>

        <TouchableOpacity onPress={handleOpenAbout} style={styles.versionFooter}>
          <Text style={styles.versionText}>
            {t('common:app_name')} — {AppInfoService.getFullVersionString()}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODALS */}
      <LanguageModal
        visible={modalState.lang}
        currentLang={preferences.language}
        onClose={() => toggleModal('lang', false)}
        onSelect={handleLanguageChange}
      />
      <ThemeModal
        visible={modalState.theme}
        currentTheme={preferences.theme}
        onClose={() => toggleModal('theme', false)}
        onSelect={handleThemeChange}
      />
      <AIConfigModal
        visible={modalState.ai}
        config={aiConfig}
        onClose={() => toggleModal('ai', false)}
        onSave={handleAiSave}
      />
      <ResetModal
        visible={modalState.reset}
        onClose={() => toggleModal('reset', false)}
        onConfirm={handleFactoryReset}
      />
      <AboutModal
        visible={modalState.about}
        changelog={changelogData.data}
        isLoading={changelogData.loading}
        onClose={() => toggleModal('about', false)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100, paddingHorizontal: 16 },
  headerContainer: { marginTop: 20, marginBottom: 30 },
  pageTitle: { fontFamily: 'serif', fontWeight: 'bold' },
  accentLine: { height: 1, width: 40, marginTop: 12, opacity: 0.5 },
  versionFooter: { marginTop: 30, alignItems: 'center', paddingBottom: 20 },
  versionText: {
    fontSize: 10,
    letterSpacing: 2,
    opacity: 0.4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default SettingsScreen;

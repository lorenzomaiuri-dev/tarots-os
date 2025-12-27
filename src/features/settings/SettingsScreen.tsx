import React, { useState } from 'react';
import { ScrollView, Linking, Alert, View, StyleSheet } from 'react-native';
import { 
  Switch, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  useTheme,
  RadioButton,
  Surface,
  List
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DEFAULTS } from '../../constants';
import { useHistoryStore } from '../../store/useHistoryStore';
import { BackupService } from "../../services/backup";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();  
  const { preferences, updatePreferences, aiConfig, setAiConfig } = useSettingsStore();

  const [visible, setVisible] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModelId, setTempModelId] = useState('');
  const [tempBaseUrl, setTempBaseUrl] = useState('');

  const dialogBgColor = theme.dark ? '#121212' : theme.colors.surface;
  
  const dynamicCardStyle = {
    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };

  const dynamicDivider = {
    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    updatePreferences({ language: lang });
    setLanguageDialogVisible(false);
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'it': return 'Italiano';
      case 'en': return 'English';
      default: return t('common:system', 'System');
    }
  }

  const handleExport = async () => {
    try {
      const data = {
        history: useHistoryStore.getState().readings,
        version: 1,
        exportDate: new Date().toISOString()
      };
      await BackupService.exportJson(data, 'tarot_journal_backup.json');
    } catch (e) {
      Alert.alert(t('common:error'), t('common:error_backup'));
    }
  };

  const handleImport = async () => {
    try {
      const parsed = await BackupService.importJson<{ history: any[] }>();
      if (!parsed) return;
      if (!parsed.history || !Array.isArray(parsed.history)) throw new Error("Invalid format");

      Alert.alert(
        t('common:restore'),
        `${t('common:found')} ${parsed.history.length} ${t('common:readings')}.`,
        [
          { text: t('common:cancel'), style: "cancel" },
          { 
            text: t('common:restore'), 
            style: "destructive",
            onPress: () => {
              useHistoryStore.setState({ readings: parsed.history });
              Alert.alert(t('common:success'), t('common:success_message_backup'));
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert(t('common:error'), t('common:error_invalid_file'));
    }
  };

  const showDialog = () => {
    setTempApiKey(aiConfig.apiKey || '');
    setTempModelId(aiConfig.modelId || DEFAULTS.AI_MODEL);
    setTempBaseUrl(aiConfig.baseUrl || DEFAULTS.BASE_URL);
    setVisible(true);
  };

  const saveConfig = () => {
    setAiConfig({
      apiKey: tempApiKey.trim(),
      modelId: tempModelId.trim() || DEFAULTS.AI_MODEL,
      baseUrl: tempBaseUrl.trim() || DEFAULTS.BASE_URL
    });
    setVisible(false);
  };

  const getThemeLabel = (value: string) => {
    switch (value) {
      case 'light': return t('common:theme_light', 'Light');
      case 'dark': return t('common:theme_dark', 'Dark');
      default: return t('common:theme_system', 'System');
    }
  };

  const SettingRow = ({ title, description, right, onPress, icon }: any) => (
    <List.Item
      title={title}
      description={description}
      onPress={onPress}
      titleStyle={styles.settingTitle}
      descriptionStyle={styles.settingDesc}
      left={icon ? (props) => <List.Icon {...props} icon={icon} /> : undefined}
      right={right}
      style={styles.settingItem}
    />
  );

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
            <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
                {t('common:settings', 'Settings')}
            </Text>
            <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </View>

        {/* READING PREFERENCES */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:reading', 'ORACLE RULES')}
        </Text>
        <Surface style={[styles.settingsCard, dynamicCardStyle]} elevation={0}>
            <SettingRow 
                title={t('common:allow_reversed_cards', "Allow Reversed Cards")}
                description={t('common:reversed_desc', "Include inverted card meanings")}
                right={() => (
                    <Switch 
                        value={preferences.allowReversed} 
                        onValueChange={(val) => updatePreferences({ allowReversed: val })} 
                    />
                )}
            />
            <View style={[styles.divider, dynamicDivider]} />
            <SettingRow 
                title={t('common:only_major_arcana', "Only Major Arcana")}
                description={t('common:major_only_desc', "Focus only on the 22 Greater Secrets")}
                right={() => (
                    <Switch 
                        value={preferences.onlyMajorArcana} 
                        onValueChange={(val) => updatePreferences({ onlyMajorArcana: val })} 
                    />
                )}
            />
        </Surface>

        {/* APPEARANCE & LANGUAGE */}
       <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
         {t('common:appearance', 'AESTHETICS')}
        </Text>
        <Surface style={[styles.settingsCard, dynamicCardStyle]} elevation={0}>
            <SettingRow 
                title={t('common:theme', "Interface Theme")}
                description={getThemeLabel(preferences.theme)}
                icon="palette-outline"
                onPress={() => setThemeDialogVisible(true)}
                right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
            />
            <View style={[styles.divider, dynamicDivider]} />
            <SettingRow 
                title={t('common:language', "Language")}
                description={getLanguageLabel(preferences.language || i18n.language)}
                icon="translate"
                onPress={() => setLanguageDialogVisible(true)}
                right={(props: any) => <List.Icon {...props} icon="chevron-right" />}
            />
        </Surface>

        {/* AI CONFIGURATION */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:ai', 'DIVINE INTELLIGENCE')}
        </Text>
        <Surface style={[styles.settingsCard, dynamicCardStyle]} elevation={0}>
            <SettingRow 
                title={t('common:ai_provider_config', "AI Spirit Engine")}
                description={`${aiConfig.modelId || 'Not set'}`}
                icon="auto-fix"
                onPress={showDialog}
                right={(props: any) => <List.Icon {...props} icon="cog-outline" />}
            />
            <View style={[styles.divider, dynamicDivider]} />
            <SettingRow 
                title={t('common:get_api_key_title', "Acquire API Key")}
                description="OpenRouter.ai"
                icon="key-outline"
                onPress={() => Linking.openURL('https://openrouter.ai/keys')}
                right={(props: any) => <List.Icon {...props} icon="open-in-new" />}
            />
        </Surface>

        {/* DATA MANAGEMENT */}
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
          {t('common:chronicles', 'Chronicles')}
        </Text>
        <Surface style={[styles.settingsCard, dynamicCardStyle]} elevation={0}>
            <SettingRow 
                title={t('common:export_backup', "Seal Memories")}
                description={t('common:export_desc', "Export journal to JSON")}
                icon="book-arrow-up-outline"
                onPress={handleExport}
            />
            <View style={[styles.divider, dynamicDivider]} />
            <SettingRow 
                title={t('common:import_backup', "Restore Spirits")}
                description={t('common:import_desc', "Import journal from file")}
                icon="book-arrow-down-outline"
                onPress={handleImport}
            />
        </Surface>
        
        <Text style={[styles.versionText, { color: theme.colors.onSurfaceVariant }]}>
          Tarots AI — Version 1.0.0
        </Text>
      </ScrollView>      

      {/* LANGUAGE DIALOG */}
      <Portal>
        <Dialog 
          visible={languageDialogVisible} 
          onDismiss={() => setLanguageDialogVisible(false)} 
          style={[styles.dialog, { backgroundColor: dialogBgColor }]}
        >
          <Dialog.Title style={styles.dialogTitle}>{t('common:select_language', "Select Language")}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={v => changeLanguage(v)} 
              value={preferences.language || i18n.language}
            >
                <RadioButton.Item label="Italiano" value="it" labelStyle={styles.radioLabel} />
                <RadioButton.Item label="English" value="en" labelStyle={styles.radioLabel} />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* THEME DIALOG */}
      <Portal>
        <Dialog 
          visible={themeDialogVisible} 
          onDismiss={() => setThemeDialogVisible(false)} 
          style={[styles.dialog, { backgroundColor: dialogBgColor }]}
        >
          <Dialog.Title style={styles.dialogTitle}>{t('common:select_theme', "Select Theme")}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={v => { updatePreferences({ theme: v as any }); setThemeDialogVisible(false); }} 
              value={preferences.theme || 'system'}
            >
                <RadioButton.Item label={t('common:theme_system', "System")} value="system" labelStyle={styles.radioLabel} />
                <RadioButton.Item label={t('common:theme_light', "Light")} value="light" labelStyle={styles.radioLabel} />
                <RadioButton.Item label={t('common:theme_dark', "Dark")} value="dark" labelStyle={styles.radioLabel} />
            </RadioButton.Group>
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* AI DIALOG */}
      <Portal>
        <Dialog 
          visible={visible} 
          onDismiss={() => setVisible(false)} 
          style={[styles.dialog, { backgroundColor: dialogBgColor }]}
        >
          <Dialog.Title style={styles.dialogTitle}>{t('common:ai_config', "AI Configuration")}</Dialog.Title>
          <Dialog.Content>
            <TextInput 
              label="Base URL" 
              value={tempBaseUrl} 
              onChangeText={setTempBaseUrl} 
              mode="outlined" 
              style={styles.input} 
              placeholder="https://api.openai.com/v1" 
              autoCapitalize="none" 
              outlineColor={theme.dark ? 'rgba(255,255,255,0.2)' : undefined}
            />
            <TextInput 
              label="API Key" 
              value={tempApiKey} 
              onChangeText={setTempApiKey} 
              mode="outlined" 
              secureTextEntry 
              style={styles.input} 
              outlineColor={theme.dark ? 'rgba(255,255,255,0.2)' : undefined}
            />
            <TextInput 
              label="Model ID" 
              value={tempModelId} 
              onChangeText={setTempModelId} 
              mode="outlined" 
              placeholder={DEFAULTS.AI_MODEL} 
              style={styles.input} 
              autoCapitalize="none" 
              outlineColor={theme.dark ? 'rgba(255,255,255,0.2)' : undefined}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)} textColor={theme.dark ? '#fff' : theme.colors.primary}>
              {t('common:cancel', "Cancel")}
            </Button>
            <Button mode="contained" onPress={saveConfig} style={{marginLeft: 10}}>
              {t('common:save', "Save")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  accentLine: {
    height: 3,
    width: 30,
    marginTop: 8,
    borderRadius: 2,
  },
  sectionLabel: {
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.8,
  },
  settingsCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  settingItem: {
    paddingVertical: 4,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDesc: {
    fontSize: 12,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  dialog: {
    borderRadius: 28,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dialogTitle: {
    fontFamily: 'serif',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  radioLabel: {
    fontSize: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 10,
    letterSpacing: 1,
    opacity: 0.5,
  }
});

export default SettingsScreen;
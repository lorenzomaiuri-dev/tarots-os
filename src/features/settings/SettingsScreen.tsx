import React, { useState } from 'react';
import { ScrollView, Linking, Alert } from 'react-native';
import { 
  List, 
  Switch, 
  Divider, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  useTheme,
  RadioButton
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DEFAULTS } from '../../constants';
import { useHistoryStore } from '../../store/useHistoryStore';
import { BackupService } from "../../services/backup";

const SettingsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();  
  const { preferences, updatePreferences, aiConfig, setAiConfig } = useSettingsStore();

  const handleExport = async () => {
    try {
      const data = {
        history: useHistoryStore.getState().readings,
        version: 1,
        exportDate: new Date().toISOString()
      };

      await BackupService.exportJson(data, 'tarots_ai_backup.json');
    } catch (e) {
      Alert.alert(t('common:error'), t('common:error_backup'));
    }
  };

  const handleImport = async () => {
    try {
      const parsed = await BackupService.importJson<{ history: any[] }>();
      
      if (!parsed) return; // User cancelled

      // Validation logic stays in the component/store layer
      if (!parsed.history || !Array.isArray(parsed.history)) {
        throw new Error("Invalid file format");
      }

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

  // local state for dialog
  const [visible, setVisible] = useState(false);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModelId, setTempModelId] = useState('');
  const [tempBaseUrl, setTempBaseUrl] = useState('');

  // Open Dialog: Load from store
  const showDialog = () => {
    setTempApiKey(aiConfig.apiKey || '');
    setTempModelId(aiConfig.modelId || DEFAULTS.AI_MODEL);
    setTempBaseUrl(aiConfig.baseUrl || DEFAULTS.BASE_URL);
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  // Save: Update store
  const saveConfig = () => {
    setAiConfig({
      apiKey: tempApiKey.trim(),
      modelId: tempModelId.trim() || DEFAULTS.AI_MODEL,
      baseUrl: tempBaseUrl.trim() || DEFAULTS.BASE_URL
    });
    hideDialog();
  };

  // Helper
  const getThemeLabel = (value: 'light' | 'dark' | 'system') => {
    switch (value) {
      case 'light': return t('common:theme_light', 'Light');
      case 'dark': return t('common:theme_dark', 'Dark');
      default: return t('common:theme_system', 'System');
    }
  };

  return (
    <ScreenContainer>

      <ScrollView>
        {/* READING */}
      <List.Section>
        <List.Subheader>{t('common:reading', "Reading")}</List.Subheader>
        <List.Item
          title={t('common:allow_reversed_cards', "Allow reversed cards")}
          right={() => (
            <Switch 
              value={preferences.allowReversed} 
              onValueChange={(val) => updatePreferences({ allowReversed: val })} 
            />
          )}
        />
        <List.Item
          title={t('common:only_major_arcana', "Only Major Arcana")}
          description={t('common:only_first_22_cards', "Use only the first 22 Cards")}
          right={() => (
            <Switch 
              value={preferences.onlyMajorArcana} 
              onValueChange={(val) => updatePreferences({ onlyMajorArcana: val })} 
            />
          )}
        />
      </List.Section>

      <Divider />

      {/* APPEARANCE */}
      <List.Section>
        <List.Subheader>{t('common:appearance', "Appearance")}</List.Subheader>
        <List.Item
          title={t('common:theme', "Theme")}
          description={getThemeLabel(preferences.theme)}
          left={props => <List.Icon {...props} icon="brightness-6" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => setThemeDialogVisible(true)}
        />
      </List.Section>

      <Divider />

      {/* AI */}
      <List.Section>
        <List.Subheader>{t('common:ai', "AI")}</List.Subheader>
        <List.Item 
          title={t('common:provider_configuration_title', "Provider Configuration")}
          description={`${aiConfig.modelId || DEFAULTS.AI_MODEL}\n${aiConfig.baseUrl || DEFAULTS.BASE_URL}`}
          descriptionNumberOfLines={2}
          left={(props) => <List.Icon {...props} icon="cloud-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={showDialog}
        />
        <List.Item 
          title={t('common:get_api_key_title', "Get an API Key")}
          description={t('common:get_api_key_description', "Open link to OpenRouter in the browser")}
          left={(props) => <List.Icon {...props} icon="open-in-new" />}
          onPress={() => Linking.openURL('https://openrouter.ai/keys')}
        />
      </List.Section>

      <Divider />

      {/* DATA & PRIVACY */}
      <List.Section>
        <List.Subheader>{t('common:data_privacy_title', "Data & Privacy")}</List.Subheader>
        <List.Item
          title={t('common:export_backup_title', "Export Backup")}
          description={t('common:export_backup_message', "Save history to JSON file")}
          left={props => <List.Icon {...props} icon="download" />}
          onPress={handleExport}
        />
        <List.Item
          title={t('common:import_backup_title', "Import Backup")}
          description={t('common:import_backup_message', "Restore history from JSON file")}
          left={props => <List.Icon {...props} icon="upload" />}
          onPress={handleImport}
        />
      </List.Section>
      </ScrollView>      

      {/* --- DIALOG THEME --- */}
      <Portal>
        <Dialog 
          visible={themeDialogVisible} 
          onDismiss={() => setThemeDialogVisible(false)}
          style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {t('common:select_theme', "Select Theme")}
          </Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={value => {
                updatePreferences({ theme: value as 'light' | 'dark' | 'system' });
                setThemeDialogVisible(false);
              }} 
              value={preferences.theme || 'system'}
            >
              <RadioButton.Item 
                label={t('common:theme_system', "System")} 
                value="system" 
                labelStyle={{ color: theme.colors.onSurface }}
              />
              <RadioButton.Item 
                label={t('common:theme_light', "Light")} 
                value="light" 
                labelStyle={{ color: theme.colors.onSurface }}
              />
              <RadioButton.Item 
                label={t('common:theme_dark', "Dark")} 
                value="dark" 
                labelStyle={{ color: theme.colors.onSurface }}
              />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>
              {t('common:cancel', "Cancel")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* --- DIALOG --- */}
      <Portal>
        <Dialog 
          visible={visible} 
          onDismiss={hideDialog} 
          style={{ backgroundColor: theme.colors.surface, borderRadius: 12 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {t('common:ai_configuration_title', "AI Configuration")}
          </Dialog.Title>
          
          <Dialog.Content>
            <Text 
              variant="bodySmall" 
              style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}
            >
              {t('common:ai_configuration_description', "Insert your API Key and endpoint to enable AI interpretation")}
            </Text>
            
            <TextInput
              label={t('common:ai_base_url_label', "Base URL (OpenAI compatible)")}
              value={tempBaseUrl}
              onChangeText={setTempBaseUrl}
              mode="outlined"
              placeholder="https://api.openai.com/v1"
              style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
              keyboardType="url"
              autoCapitalize="none"
            />

            <TextInput
              label={t('common:ai_api_key_input_label', "API Key")}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              mode="outlined"
              secureTextEntry
              style={{ marginBottom: 12, backgroundColor: theme.colors.surface }}
            />

            <TextInput
              label={t('common:ai_model_id_input_label', "Model ID")}
              value={tempModelId}
              onChangeText={setTempModelId}
              mode="outlined"
              placeholder={DEFAULTS.AI_MODEL}
              autoCapitalize="none"
              style={{ backgroundColor: theme.colors.surface }}
            />

            <Text 
              variant="labelSmall" 
              style={{ marginTop: 12, color: theme.colors.primary }}
            >
              {t('common:ai_endpoint_hint', "E.g., for Ollama use: http://YOUR_IP:11434/v1")}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={hideDialog} textColor={theme.colors.primary}>
              {t('common:cancel', "Cancel")}
            </Button>
            <Button 
              mode="contained" 
              onPress={saveConfig}
              style={{ marginLeft: 8 }}
            >
              {t('common:save', "Save")}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

export default SettingsScreen;
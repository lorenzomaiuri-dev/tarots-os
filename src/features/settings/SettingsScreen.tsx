import React, { useState } from 'react';
import { View, Linking, Alert } from 'react-native';
import { 
  List, 
  Switch, 
  Divider, 
  Portal, 
  Dialog, 
  TextInput, 
  Button, 
  Text,
  useTheme
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DEFAULTS } from '../../constants';
import { useHistoryStore } from '../../store/useHistoryStore';

const SettingsScreen = () => {
  const { t } = useTranslation();

  const handleExport = async () => {
    // 1. Prepare data
    const data = JSON.stringify({
      history: useHistoryStore.getState().readings,
      version: 1,
      exportDate: new Date().toISOString()
    }, null, 2);

    try {
      // 2. Define File Reference in Cache
      const backupFile = new File(Paths.cache, 'tarots_ai_backup.json');

      // 3. Create and Write
      // Note: If the file already exists, create() might throw. 
      // We can delete it first or handle it safely.
      if (backupFile.exists) {
        backupFile.delete();
      }
      
      backupFile.create();
      backupFile.write(data);

      // 4. Share/Save
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: 'application/json',
          dialogTitle: t('common:save', 'Save'),
          UTI: 'public.json'
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert(t('common:error', 'Error'), t('common:error_backup', 'Cannot create backup'));
    }
  };

  const handleImport = async () => {
    try {
      // 1. Choose file
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) return;

      // 2. Read the picked asset from URI
      const pickedFile = new File(result.assets[0].uri);
      
      // 3. Read content
      const content = pickedFile.textSync();
      const parsed = JSON.parse(content);

      // 4. Validate file
      if (!parsed.history || !Array.isArray(parsed.history)) {
        throw new Error("Invalid file format");
      }

      // 5. Restore
      Alert.alert(
        t('common:restore', 'Restore'),
        `${t('common:found', 'Found')} ${parsed.history.length} ${t('common:readings', 'readings')}.`,
        [
          { text: t('common:cancel', 'Cancel'), style: "cancel" },
          { 
            text: t('common:restore', 'Restore'), 
            style: "destructive",
            onPress: () => {
              useHistoryStore.setState({ readings: parsed.history });
              Alert.alert(t('common:success', 'Success'), t('common:success_message_backup', 'History restored'));
            }
          }
        ]
      );

    } catch (e) {
      console.error(e);
      Alert.alert(t('common:error', 'Error'), t('common:error_invalid_file', 'Invalid file or corrupted'));
    }
  };

  const theme = useTheme();  
  const { preferences, updatePreferences, aiConfig, setAiConfig } = useSettingsStore();

  // local state for dialog
  const [visible, setVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [tempModelId, setTempModelId] = useState('');

  // Open Dialog: Load from store
  const showDialog = () => {
    setTempApiKey(aiConfig.apiKey || '');
    setTempModelId(aiConfig.modelId || DEFAULTS.AI_MODEL);
    setVisible(true);
  };

  const hideDialog = () => setVisible(false);

  // Save: Update store
  const saveConfig = () => {
    setAiConfig({
      apiKey: tempApiKey.trim(),
      modelId: tempModelId.trim() || DEFAULTS.AI_MODEL
    });
    hideDialog();
  };

  return (
    <ScreenContainer>
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

      <List.Section>
        <List.Subheader>{t('common:ai', "AI")}</List.Subheader>
        <List.Item 
          title={t('common:provider_configuration_title', "Provider Configuration")}
          description={aiConfig.apiKey ? `${t('common:connected', "Connected")}: ${aiConfig.modelId}` : t('common:touch_to_configure', "Touch to configure")}
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

      {/* --- DIALOG --- */}
      {/* TODO: ADD BASE URL TO CONFIG */}
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog} style={{ backgroundColor: theme.colors.elevation.level3 }}>
          <Dialog.Title>{t('common:ai_configuration_title', "AI Configuration")}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodySmall" style={{ marginBottom: 10, opacity: 1 }}>
              {t('common:ai_configuration_description', "Insert your API Key to enable AI interpretation of your cards")}
            </Text>
            
            <TextInput
              label={t('common:ai_api_key_input_label', "API Key")}
              value={tempApiKey}
              onChangeText={setTempApiKey}
              mode="outlined"
              secureTextEntry
              style={{ marginBottom: 16 }}
            />

            <TextInput
              label={t('common:ai_model_id_input_label', "Model ID")}
              value={tempModelId}
              onChangeText={setTempModelId}
              mode="outlined"
              placeholder={DEFAULTS.AI_MODEL}              
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{t('common:cancel', "Cancel")}</Button>
            <Button mode="contained" onPress={saveConfig}>{t('common:save', "Save")}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

export default SettingsScreen;
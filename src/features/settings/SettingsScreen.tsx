import React, { useState } from 'react';
import { View, Linking } from 'react-native';
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
import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DEFAULTS } from '../../constants';

const SettingsScreen = () => {
  const theme = useTheme();
  const { t } = useTranslation();
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

      {/* --- DIALOG --- */}
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
import React, { useState } from 'react';

import { LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { Button, IconButton, Surface, Text, TextInput, useTheme } from 'react-native-paper';

import { useSettingsStore } from '../../store/useSettingsStore';
import { ScreenContainer } from '../ScreenContainer';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OnboardingScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { completeOnboarding, setUserName } = useSettingsStore();

  const [step, setStep] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const stepsCount = 4;

  const handleNext = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    // Logic to save data based on current step
    if (step === 1) {
      setUserName(nameInput.trim());
    }

    if (step < stepsCount - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (step > 0) setStep(step - 1);
  };

  // STEP 0: Welcome
  const renderStep0 = () => (
    <View style={styles.slide}>
      <IconButton
        icon="eye-circle-outline"
        size={100}
        iconColor={theme.colors.primary}
        style={styles.mainIcon}
      />
      <Text variant="displaySmall" style={styles.title}>
        {t('onboarding:welcome_title', 'Tarots OS')}
      </Text>
      <Text variant="titleMedium" style={styles.subtitle}>
        {t('onboarding:welcome_subtitle', 'Introspection, not prediction.')}
      </Text>
      <Text variant="bodyLarge" style={styles.description}>
        {t(
          'onboarding:welcome_description',
          'Explore the archetypes and connect with yourself through the Tarots language.'
        )}
      </Text>
    </View>
  );

  // STEP 1: Name
  const renderStepName = () => (
    <View style={styles.slide}>
      <IconButton icon="account-circle-outline" size={80} iconColor={theme.colors.primary} />

      <Text variant="headlineMedium" style={styles.title}>
        {t('onboarding:who_are_you', 'Who is seeking?')}
      </Text>

      <Text variant="bodyLarge" style={styles.description}>
        {t(
          'onboarding:name_desc',
          'Enter your name to personalize the energy of your daily draws.'
        )}
      </Text>

      <TextInput
        mode="outlined"
        label={t('onboarding:name_label', 'Your Name')}
        placeholder={t('onboarding:name_placeholder', 'e.g. Alex')}
        value={nameInput}
        onChangeText={setNameInput}
        style={styles.input}
        autoFocus={false} // Avoid keyboard jumping immediately
      />

      <Text variant="bodySmall" style={styles.smallNote}>
        {t('onboarding:name_note', 'This affects the random seed unique to you.')}
      </Text>
    </View>
  );

  // STEP 2: Engine Info
  const renderStepEngine = () => (
    <View style={styles.slide}>
      <IconButton icon="tune-vertical" size={80} iconColor={theme.colors.secondary} />

      <Text variant="headlineMedium" style={styles.title}>
        {t('onboarding:engine_title', 'Power the Engine')}
      </Text>

      <Text variant="bodyLarge" style={styles.description}>
        {t(
          'onboarding:engine_desc',
          'This app uses intelligent AI models to interpret the cards. To enable this feature, you will need to connect a provider.'
        )}
      </Text>

      <Surface
        style={[styles.instructionBox, { backgroundColor: theme.colors.elevation.level2 }]}
        elevation={2}
      >
        <View style={styles.instructionRow}>
          <IconButton icon="cog" size={24} iconColor={theme.colors.onSurface} />
          <Text style={{ flex: 1, lineHeight: 20 }}>
            {t(
              'onboarding:engine_instruction',
              'Once inside, go to Settings > AI Configuration to insert your API Key.'
            )}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />
        <View style={styles.instructionRow}>
          <IconButton icon="shield-check-outline" size={24} iconColor={theme.colors.onSurface} />
          <Text style={{ flex: 1, lineHeight: 20 }}>
            {t(
              'onboarding:engine_note',
              'Your key is stored securely on your device and never shared.'
            )}
          </Text>
        </View>
      </Surface>
    </View>
  );

  // STEP 3: Ready
  const renderStepReady = () => (
    <View style={styles.slide}>
      <IconButton icon="cards-playing-outline" size={100} iconColor={theme.colors.tertiary} />
      <Text variant="headlineMedium" style={styles.title}>
        {t('onboarding:ready_title', 'All ready!')}
      </Text>
      <View style={styles.readyTextContainer}>
        {nameInput ? (
          <Text
            variant="titleLarge"
            style={[styles.italicText, { marginBottom: 12, color: theme.colors.primary }]}
          >
            {t('onboarding:welcome_user', 'Welcome, {{name}}', { name: nameInput })}
          </Text>
        ) : null}
        <Text variant="headlineSmall" style={styles.italicText}>
          {t('onboarding:ready_msg_1', 'The deck has been shuffled.')}
        </Text>
        <Text variant="headlineSmall" style={styles.italicText}>
          {t('onboarding:ready_msg_2', 'The Journal is open.')}
        </Text>
      </View>
      <Text variant="bodyLarge" style={[styles.description, { marginTop: 20 }]}>
        {t('onboarding:ready_action', 'Get ready to extract your first card.')}
      </Text>
    </View>
  );

  return (
    <ScreenContainer centered style={{ paddingHorizontal: 28 }}>
      <View style={styles.content}>
        {step === 0 && renderStep0()}
        {step === 1 && renderStepName()}
        {step === 2 && renderStepEngine()}
        {step === 3 && renderStepReady()}
      </View>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {step > 0 ? (
            <Button mode="text" onPress={handleBack} style={styles.navButton}>
              {t('common:back', 'Back')}
            </Button>
          ) : (
            <View style={styles.navButton} />
          )}

          <Button
            mode="contained"
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton]}
            contentStyle={{ height: 50 }}
          >
            {step === stepsCount - 1 ? t('onboarding:start', 'Begin') : t('common:next', 'Next')}
          </Button>
        </View>

        {/* Indicators */}
        <View style={styles.dotsContainer}>
          {[...Array(stepsCount)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === step ? theme.colors.primary : theme.colors.outlineVariant,
                  width: i === step ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  slide: {
    alignItems: 'center',
    width: '100%',
  },
  mainIcon: {
    marginBottom: 0,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
    paddingHorizontal: 10,
  },
  input: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  smallNote: {
    opacity: 0.5,
    fontSize: 12,
  },
  instructionBox: {
    marginTop: 30,
    borderRadius: 16,
    width: '100%',
    overflow: 'hidden',
  },
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 24,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  readyTextContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  italicText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  footer: {
    width: '100%',
    paddingBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  nextButton: {
    borderRadius: 25,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default OnboardingScreen;

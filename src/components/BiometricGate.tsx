import React, { useEffect, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import * as LocalAuthentication from 'expo-local-authentication';

import { useTranslation } from 'react-i18next';
import { Avatar, Button, Text, useTheme } from 'react-native-paper';

import { useHaptics } from '../hooks/useHaptics';
import { useSettingsStore } from '../store/useSettingsStore';
import { GlassSurface } from './GlassSurface';

export const BiometricGate = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation();
  const { preferences } = useSettingsStore();
  const theme = useTheme();
  const haptics = useHaptics();

  const [unlocked, setUnlocked] = useState(!preferences.biometricsEnabled);

  const handleAuthenticate = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setUnlocked(true);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('common:biometrics_login_title', 'Log into your memories'),
        fallbackLabel: t('common:biometrics_login_fallback', 'Use code'),
        disableDeviceFallback: false,
      });

      if (result.success) {
        haptics.notification('success');
        setUnlocked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (preferences.biometricsEnabled) {
      setUnlocked(false);
    } else {
      setUnlocked(true);
    }
  }, [preferences.biometricsEnabled]);

  if (unlocked) return <>{children}</>;

  return (
    <View style={styles.container}>
      <GlassSurface intensity={40} style={styles.gateBox}>
        <Avatar.Icon
          size={64}
          icon="lock-outline"
          style={{ backgroundColor: 'transparent' }}
          color={theme.colors.primary}
        />
        <Text variant="titleLarge" style={styles.title}>
          {t('common:biometrics_journal_title', 'Chronicles Protected')}
        </Text>
        <Text variant="bodyMedium" style={styles.desc}>
          {t(
            'common:biometrics_journal_description',
            'Access to your memories requires authentication'
          )}
        </Text>
        <Button
          mode="contained"
          onPress={handleAuthenticate}
          style={styles.btn}
          contentStyle={{ height: 48 }}
        >
          {t('common:biometrics_journal_button', 'Unlock Journal')}
        </Button>
      </GlassSurface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  gateBox: {
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { marginTop: 16, fontFamily: 'serif', fontWeight: 'bold' },
  desc: { textAlign: 'center', opacity: 0.6, marginVertical: 16, lineHeight: 20 },
  btn: { width: '100%', borderRadius: 12 },
});

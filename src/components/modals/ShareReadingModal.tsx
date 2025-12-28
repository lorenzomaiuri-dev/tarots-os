import React from 'react';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { IconButton, Text, useTheme } from 'react-native-paper';

import { GlassSurface } from '../GlassSurface';
import { GlassyModal } from './GlassyModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  onShareSquare: () => void;
  // onShareFull: () => void;
}

export const ShareReadingModal = ({ visible, onClose, onShareSquare }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <GlassyModal
      visible={visible}
      onClose={onClose}
      title={t('common:share_reading', 'Share your Destiny')}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.option} onPress={onShareSquare}>
          <GlassSurface intensity={20} style={styles.iconBox}>
            <IconButton icon="instagram" size={32} iconColor={theme.colors.primary} />
          </GlassSurface>
          <Text variant="labelLarge" style={styles.text}>
            {t('common:card', 'Card')}
          </Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.option} onPress={onShareFull}>
          <GlassSurface intensity={20} style={styles.iconBox}>
            <IconButton icon="file-document-outline" size={32} iconColor={theme.colors.secondary} />
          </GlassSurface>
          <Text variant="labelLarge" style={styles.text}>
            {t('common:share_journal', 'Journal Entry')}
          </Text>
        </TouchableOpacity> */}
      </View>
    </GlassyModal>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
  option: { alignItems: 'center', gap: 12 },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { fontWeight: 'bold', opacity: 0.8 },
});

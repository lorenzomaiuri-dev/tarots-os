import React from 'react';
import { Modal, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Text, IconButton, Button, useTheme, Surface } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string | null;
  error: string | null;
  title?: string;
}

export const InterpretationModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  isLoading, 
  content, 
  error,
  title
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  if (!title) {
    title = t('common:interpretation_title', "Interpretation")
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        {/* HEADER */}
        <View style={[styles.header, { marginTop: insets.top }]}>
          <Text variant="headlineSmall" style={styles.title}>{title}</Text>
          <IconButton icon="close" onPress={onClose} />
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ marginTop: 20, opacity: 0.7 }}>
                {t('common:interpretation_loading_message', "Searching among the infinite meaning")}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <IconButton icon="alert-circle" size={40} iconColor={theme.colors.error} />
              <Text style={{ color: theme.colors.error, textAlign: 'center', marginHorizontal: 20 }}>
                {error}
              </Text>
              <Button mode="contained" onPress={onClose} style={{ marginTop: 20 }}>
                {t('common:cancel', "Cancel")}
              </Button>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <Markdown style={markdownStyles(theme)}>
                {content || ''}
              </Markdown>
              
              <Button mode="outlined" onPress={onClose} style={{ marginTop: 40, marginBottom: 20 }}>
                {t('common:close', "Close")} {t('common:interpretation', "Interpretation")}
              </Button>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};


const markdownStyles = (theme: any) => ({
  body: {
    color: theme.colors.onBackground,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System', 
  },
  heading1: {
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  heading2: {
    color: theme.colors.secondary,
    marginTop: 15,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  strong: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  blockquote: {
    backgroundColor: theme.colors.elevation.level1,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 4,
    padding: 10,
    marginTop: 10,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
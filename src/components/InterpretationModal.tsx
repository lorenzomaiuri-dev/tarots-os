import React, { useEffect, useRef } from 'react';
import { Modal, ScrollView, StyleSheet, View, ActivityIndicator, Animated } from 'react-native';
import { Text, IconButton, Button, useTheme, Surface, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
  isLoading: boolean;
  content: string | null;
  error: string | null;
  title?: string;
  actions?: React.ReactNode;
}

export const InterpretationModal: React.FC<Props> = ({ 
  visible, 
  onClose, 
  isLoading, 
  content, 
  error,
  title,
  actions
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse effect for loading state
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoading]);

  const modalTitle = title || t('common:interpretation_title', "Oracle Insight");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        
        {/* HEADER SECTION */}
        <View style={[styles.header, { paddingTop: 20 }]}>
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={styles.title}>{modalTitle}</Text>
            <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
          </View>
          <IconButton icon="close-circle-outline" size={28} onPress={onClose} />
        </View>

        {/* CONTENT AREA */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.center}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Avatar.Icon 
                    size={80} 
                    icon="auto-fix" 
                    style={{ backgroundColor: 'transparent' }} 
                    color={theme.colors.primary} 
                />
              </Animated.View>
              <Text variant="titleMedium" style={styles.loadingTitle}>
                {t('common:consulting_stars', "Consulting the Arcana...")}
              </Text>
              <Text style={styles.loadingSubtitle}>
                {t('common:loading_desc', "Searching the infinite threads of destiny")}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Avatar.Icon size={64} icon="alert-decagram-outline" style={{ backgroundColor: 'transparent' }} color={theme.colors.error} />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <Button mode="contained" onPress={onClose} style={styles.actionButton}>
                {t('common:return', "Return to Table")}
              </Button>
            </View>
          ) : (
            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
            >
              <Surface style={styles.interpretationSurface} elevation={1}>
                 <Markdown style={markdownStyles(theme)}>
                    {content || ''}
                 </Markdown>

                 {/* --- ACTIONS SECTION */}
                 {actions && (
                   <View style={styles.actionsContainer}>
                     {actions}
                   </View>
                 )}
                 
                 <View style={styles.scrollDecoration}>
                    <View style={styles.dot} />
                    <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
                    <View style={styles.dot} />
                 </View>
              </Surface>

              <Button 
                mode="text" 
                onPress={onClose} 
                style={styles.closeFooterBtn}
                labelStyle={{ letterSpacing: 2 }}
              >
                {t('common:close_insight', "DISMISS INSIGHT")}
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
    color: theme.colors.onSurface,
    fontSize: 17,
    lineHeight: 28,
    fontFamily: 'serif', 
    opacity: 0.9,
  },
  heading1: {
    color: theme.colors.primary,
    marginTop: 24,
    marginBottom: 12,
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  heading2: {
    color: theme.colors.secondary,
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  strong: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
    opacity: 0.8,
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 3,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 16,
    fontStyle: 'italic',
    borderRadius: 4,
  },
  hr: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 1,
    marginVertical: 20,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
      flex: 1,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  accentLine: {
    height: 3,
    width: 30,
    marginTop: 8,
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  interpretationSurface: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontFamily: 'serif',
    marginTop: 24,
    fontWeight: 'bold',
  },
  loadingSubtitle: {
    marginTop: 8,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  actionButton: {
    borderRadius: 12,
  },
  closeFooterBtn: {
      marginTop: 30,
      opacity: 0.5,
  },
  scrollDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    opacity: 0.2,
  },
  line: {
    height: 1,
    width: 40,
    marginHorizontal: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  actionsContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center'
  }
});
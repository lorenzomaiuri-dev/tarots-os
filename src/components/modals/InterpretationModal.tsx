import React, { useEffect, useRef } from 'react';

import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { BlurView } from 'expo-blur';

import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { Button, Icon, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHaptics } from '../../hooks/useHaptics';
import { LiquidGlass } from '../LiquidGlass';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  actions,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      if (content) haptics.notification('success');
    }
  }, [isLoading, content]);

  useEffect(() => {
    if (visible) panY.setValue(0);
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          haptics.selection();
          Animated.timing(panY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const modalTitle = title || t('common:interpretation_title', 'Insights');

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        <BlurView
          intensity={100}
          tint={theme.dark ? 'systemThickMaterialDark' : 'systemThickMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: theme.colors.background, opacity: 0.7 },
          ]}
        />

        <Animated.View
          style={[
            styles.animatedWrapper,
            {
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: panY }],
            },
          ]}
        >
          <LiquidGlass style={styles.liquidCard} intensity={90} cornerRadius={40}>
            {/* DRAG HEADER */}
            <View style={styles.header} {...panResponder.panHandlers}>
              <View style={styles.dragHandleContainer}>
                <View
                  style={[styles.dragHandle, { backgroundColor: theme.colors.onSurfaceVariant }]}
                />
              </View>
              <Text
                variant="headlineSmall"
                style={[styles.title, { textShadowColor: theme.colors.primary }]}
              >
                {modalTitle}
              </Text>
              <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
            </View>

            {/* CONTENT */}
            <View style={styles.contentFlex}>
              {isLoading ? (
                <View style={styles.center}>
                  <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: 32 }}>
                    <View style={styles.glowContainer}>
                      <Icon source="creation" size={80} color={theme.colors.primary} />
                    </View>
                  </Animated.View>
                  <Text
                    variant="titleMedium"
                    style={[styles.loadingTitle, { color: theme.colors.primary }]}
                  >
                    {t('common:consulting_stars', 'Consulting the Arcana...')}
                  </Text>
                </View>
              ) : error ? (
                <View style={styles.center}>
                  <Icon source="alert-decagram-outline" size={60} color={theme.colors.error} />
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
                  <Button mode="contained" onPress={onClose} style={styles.actionButton}>
                    {t('common:back', 'Back')}
                  </Button>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  bounces={false}
                >
                  <Markdown style={markdownStyles(theme)}>{content || ''}</Markdown>

                  {actions && <View style={styles.actionsContainer}>{actions}</View>}

                  <View style={styles.footerDecoration}>
                    <Text style={{ opacity: 0.3, fontSize: 12, letterSpacing: 4 }}>✦ ✦ ✦</Text>
                  </View>
                </ScrollView>
              )}
            </View>
          </LiquidGlass>
        </Animated.View>
      </View>
    </Modal>
  );
};

const markdownStyles = (theme: any) => ({
  body: {
    color: theme.colors.onSurface,
    fontSize: 18,
    lineHeight: 32,
    fontFamily: 'serif',
    textShadowColor: 'rgba(208, 188, 255, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  heading1: {
    color: theme.colors.primary,
    marginTop: 20,
    marginBottom: 16,
    fontFamily: 'serif',
    fontWeight: 'bold' as const,
    fontSize: 28,
    textAlign: 'center',
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heading2: {
    color: theme.colors.secondary,
    marginTop: 24,
    marginBottom: 8,
    fontFamily: 'serif',
    fontWeight: 'bold' as const,
    fontSize: 22,
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 6,
  },
  strong: {
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic',
    opacity: 0.8,
    color: theme.colors.tertiary,
  },
  blockquote: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 3,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginVertical: 16,
    borderRadius: 4,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  animatedWrapper: { flex: 1, paddingHorizontal: 12 },
  liquidCard: {
    flex: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 20,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  dragHandleContainer: {
    width: '100%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dragHandle: { width: 40, height: 5, borderRadius: 3, opacity: 0.3 },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 26,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  accentLine: {
    height: 2,
    width: 40,
    marginTop: 12,
    borderRadius: 2,
    opacity: 0.8,
  },
  contentFlex: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 0, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  glowContainer: {
    shadowColor: '#D0BCFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  loadingTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  actionButton: { borderRadius: 16, width: 200 },
  footerDecoration: { alignItems: 'center', marginTop: 40 },
  actionsContainer: {
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});

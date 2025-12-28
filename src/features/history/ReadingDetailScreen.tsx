import React, { useLayoutEffect, useRef, useState } from 'react';

import {
  Alert,
  ImageStyle,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
} from 'react-native';

import * as Sharing from 'expo-sharing';

import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Markdown from 'react-native-markdown-display';
import { Avatar, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { captureRef } from 'react-native-view-shot';

// Components
import { CardImage } from '../../components/CardImage';
import { GlassSurface } from '../../components/GlassSurface';
import { ShareableReadingCard } from '../../components/ShareableReadingCard';
// Logic
import { useHaptics } from '../../hooks/useHaptics';
import { useHistoryStore } from '../../store/useHistoryStore';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';

type DetailRouteProp = RouteProp<RootStackParamList, 'ReadingDetail'>;

const ReadingDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { readings, updateUserNotes } = useHistoryStore();
  const reading = readings.find((r) => r.id === route.params.readingId);

  const [notes, setNotes] = useState(reading?.userNotes || '');
  const [isEditing, setIsEditing] = useState(false);

  // Ref for the hidden shareable card
  const squareCardRef = useRef<View>(null);

  /**
   * Directly captures the hidden high-fidelity square card and opens system share.
   */
  const handleShare = async () => {
    haptics.impact('medium');

    try {
      // Capture the high-res 1080x1080 hidden component
      const uri = await captureRef(squareCardRef, {
        format: 'jpg',
        quality: 0.9,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: t('common:share_reading', 'Share your destiny'),
        });
      }
    } catch (e) {
      console.error('Share generation failed', e);
      Alert.alert(t('common:error'), t('common:error_sharing', 'Failed to generate image'));
    }
  };

  // Attach share trigger to navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton
          icon="share-variant-outline"
          onPress={handleShare}
          iconColor={theme.colors.primary}
        />
      ),
    });
  }, [navigation, theme.colors.primary, handleShare]);

  if (!reading) return null;

  const dateStr = new Date(reading.timestamp)
    .toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  const handleSaveNotes = () => {
    updateUserNotes(reading.id, notes);
    setIsEditing(false);
    haptics.notification('success');
    Keyboard.dismiss();
  };

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      {/* 
        HIDDEN SHAREABLE ENGINE
        This renders off-screen at 1080x1080 to provide the high-quality 
        SocialMedia-style card when handleShare is pressed.
      */}
      <View style={styles.hiddenContainer} pointerEvents="none">
        <ShareableReadingCard ref={squareCardRef} reading={reading} t={t} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text variant="labelSmall" style={[styles.dateText, { color: theme.colors.primary }]}>
              {dateStr}
            </Text>
            <Text variant="headlineSmall" style={styles.title}>
              {t(`spreads:${reading.spreadId}.name`)}
            </Text>
            <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
          </View>

          {/* ASSEMBLY SECTION */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
              {t('common:assembly', 'THE ASSEMBLY')}
            </Text>
          </View>

          <View style={styles.cardsGrid}>
            {reading.cards.map((drawn, index) => (
              <GlassSurface key={index} intensity={15} style={styles.cardItemSurface}>
                <View style={styles.cardItemRow}>
                  <View style={styles.cardImageFrame}>
                    <CardImage
                      deckId={reading.deckId}
                      cardId={drawn.cardId}
                      style={
                        [
                          styles.cardImage,
                          drawn.isReversed ? { transform: [{ rotate: '180deg' }] } : undefined,
                        ] as StyleProp<ImageStyle>
                      }
                    />
                  </View>

                  <View style={styles.cardTextInfo}>
                    <Text
                      variant="labelSmall"
                      style={[styles.positionLabel, { color: theme.colors.primary }]}
                    >
                      {index + 1}.{' '}
                      {t(
                        `spreads:${reading.spreadId}.positions.${drawn.positionId}.label`
                      ).toUpperCase()}
                    </Text>
                    <Text variant="titleMedium" style={styles.cardNameText}>
                      {t(`decks:${reading.deckId}.cards.${drawn.cardId}.name`)}
                    </Text>
                    <GlassSurface intensity={10} style={styles.orientationBadge}>
                      <Text style={styles.orientationText}>
                        {drawn.isReversed
                          ? t('common:reversed', 'REVERSED')
                          : t('common:upright', 'UPRIGHT')}
                      </Text>
                    </GlassSurface>
                  </View>
                </View>
              </GlassSurface>
            ))}
          </View>

          {/* INTERPRETATION SECTION */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
              {t('common:interpretation_title', 'SACRED INSIGHT')}
            </Text>
          </View>

          <GlassSurface intensity={25} style={styles.aiInterpretationBox}>
            <View style={styles.aiHeader}>
              <Avatar.Icon
                size={32}
                icon="creation"
                style={{ backgroundColor: 'transparent' }}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={[styles.aiTitle, { color: theme.colors.primary }]}>
                {t('common:ai_insight', 'Spirit Message')}
              </Text>
            </View>

            {reading.aiInterpretation ? (
              <Markdown
                style={{
                  body: {
                    color: theme.colors.onSurface,
                    fontSize: 16,
                    lineHeight: 26,
                    fontFamily: 'serif',
                    opacity: 0.9,
                  },
                }}
              >
                {reading.aiInterpretation}
              </Markdown>
            ) : (
              <Text style={styles.emptyText}>
                {t('common:no_interpretation', 'No interpretation recorded.')}
              </Text>
            )}
          </GlassSurface>

          {/* REFLECTIONS SECTION */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
              {t('common:personal_reflections', 'REFLECTIONS')}
            </Text>
            <IconButton
              icon={isEditing ? 'check-circle' : 'pencil-circle-outline'}
              size={28}
              iconColor={isEditing ? theme.colors.primary : theme.colors.onSurfaceVariant}
              onPress={
                isEditing
                  ? handleSaveNotes
                  : () => {
                      haptics.impact('light');
                      setIsEditing(true);
                    }
              }
            />
          </View>

          <GlassSurface
            intensity={isEditing ? 40 : 10}
            style={[styles.notesBox, isEditing && styles.notesBoxEditing]}
          >
            {isEditing ? (
              <TextInput
                multiline
                value={notes}
                onChangeText={setNotes}
                autoFocus
                placeholder={t('common:write_reflections', 'Describe your energy...')}
                style={styles.notesInput}
                textColor={theme.colors.onSurface}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
              />
            ) : (
              <Text style={notes ? styles.notesText : styles.emptyText}>
                {notes || t('common:no_notes_yet', 'Your pages are waiting...')}
              </Text>
            )}
          </GlassSurface>

          <Text style={styles.footerBranding}>
            {t('common:app_footer', 'CHRONICLED BY TAROTS OS')}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    left: -5000,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 24,
    marginBottom: 40,
    alignItems: 'center',
  },
  dateText: {
    letterSpacing: 3,
    fontWeight: '900',
    fontSize: 10,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 28,
  },
  accentLine: {
    height: 1,
    width: 60,
    marginTop: 20,
    opacity: 0.3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  sectionLabel: {
    letterSpacing: 2,
    opacity: 0.5,
    fontWeight: '900',
    fontSize: 11,
  },
  cardsGrid: {
    gap: 16,
    marginBottom: 40,
  },
  cardItemSurface: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardItemRow: {
    flexDirection: 'row',
    padding: 14,
    alignItems: 'center',
  },
  cardImageFrame: {
    width: 75,
    height: 125,
    borderRadius: 12,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardTextInfo: {
    flex: 1,
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: 1,
  },
  cardNameText: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  orientationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  orientationText: {
    fontSize: 9,
    fontWeight: '900',
    opacity: 0.6,
    letterSpacing: 1,
  },
  aiInterpretationBox: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 40,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -4,
  },
  aiTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  notesBox: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 140,
  },
  notesBoxEditing: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  notesInput: {
    backgroundColor: 'transparent',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 0,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 26,
    opacity: 0.8,
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
  emptyText: {
    opacity: 0.4,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  footerBranding: {
    textAlign: 'center',
    opacity: 0.2,
    marginTop: 60,
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: 'bold',
  },
});

export default ReadingDetailScreen;

import React, { useRef, useState, useLayoutEffect } from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { Text, useTheme, Surface, TextInput, IconButton, Avatar } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { CardImage } from '../../components/CardImage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type DetailRouteProp = RouteProp<RootStackParamList, 'ReadingDetail'>;
const { width } = Dimensions.get('window');

const ReadingDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const { readings, updateUserNotes } = useHistoryStore();
  const reading = readings.find(r => r.id === route.params.readingId);
  
  const viewShotRef = useRef(null);
  const [notes, setNotes] = useState(reading?.userNotes || '');
  const [isEditing, setIsEditing] = useState(false);    

  if (!reading) return null;

  const dateStr = new Date(reading.timestamp).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
  }).toUpperCase();

  const handleSaveNotes = () => {
    updateUserNotes(reading.id, notes);
    setIsEditing(false);
  };

  const handleShare = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await captureRef(viewShotRef.current, {
          format: 'jpg',
          quality: 0.8,
          result: 'tmpfile'
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/jpeg',
            dialogTitle: t('common:share_reading', 'Share your destiny')
          });
        }
      }
    } catch (e) {
      console.error("Error sharing", e);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <IconButton icon="share-variant-outline" onPress={handleShare} />
      )
    });
  }, [navigation]);

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}>
      <ViewShot 
        ref={viewShotRef} 
        options={{ format: 'jpg', quality: 0.9 }} 
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER SECTION */}
          <View style={styles.header}>
            <Text variant="labelSmall" style={[styles.dateText, { color: theme.colors.primary }]}>
                {dateStr}
            </Text>
            <Text variant="headlineSmall" style={styles.title}>
                {t(`spreads:${reading.spreadId}.name`)}
            </Text>
            <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
          </View>

          {/* CARDS ASSEMBLY */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
                {t('common:assembly', 'THE ASSEMBLY')}
            </Text>
          </View>

          <View style={styles.cardsGrid}>
            {reading.cards.map((drawn, index) => (
              <Surface key={index} style={styles.cardItemSurface} elevation={1}>
                <View style={styles.cardItemRow}>
                  {/* Card Image with Shadow */}
                  <View style={styles.cardImageFrame}>
                     <CardImage 
                       deckId={reading.deckId} 
                       cardId={drawn.cardId} 
                       style={[
                         styles.cardImage, 
                         drawn.isReversed && { transform: [{ rotate: '180deg' }] }
                       ]} 
                     />
                  </View>

                  {/* Card Info */}
                  <View style={styles.cardTextInfo}>
                    <Text variant="labelSmall" style={[styles.positionLabel, { color: theme.colors.secondary }]}>
                      {index + 1}. {t(`spreads:${reading.spreadId}.positions.${drawn.positionId}.label`).toUpperCase()}
                    </Text>
                    <Text variant="titleMedium" style={styles.cardNameText}>
                      {t(`decks:${reading.deckId}.cards.${drawn.cardId}.name`)}
                    </Text>
                    <View style={styles.orientationBadge}>
                        <Text style={styles.orientationText}>
                          {drawn.isReversed ? t('common:reversed', 'REVERSED') : t('common:upright', 'UPRIGHT')}
                        </Text>
                    </View>
                  </View>
                </View>
              </Surface>
            ))}
          </View>

          {/* AI INTERPRETATION SECTION */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
                {t('common:interpretation_title', 'SACRED INSIGHT')}
            </Text>
          </View>

          <Surface style={styles.aiInterpretationBox} elevation={1}>
            <View style={styles.aiHeader}>
                <Avatar.Icon size={32} icon="creation" style={{ backgroundColor: 'transparent' }} color={theme.colors.tertiary} />
                <Text variant="titleMedium" style={[styles.aiTitle, { color: theme.colors.tertiary }]}>
                    {t('common:ai_insight', 'Spirit Message')}
                </Text>
            </View>
            
            {reading.aiInterpretation ? (
              <Markdown style={{ 
                  body: { color: theme.colors.onSurface, fontSize: 16, lineHeight: 24, fontFamily: 'serif', opacity: 0.9 } 
              }}>
                {reading.aiInterpretation}
              </Markdown>
            ) : (
              <Text style={styles.emptyText}>
                {t('common:no_interpretation', 'No interpretation was sought for this reading.')}
              </Text>
            )}
            
            <View style={styles.scrollDecoration}>
                <View style={styles.dot} />
                <View style={[styles.line, { backgroundColor: theme.colors.outlineVariant }]} />
                <View style={styles.dot} />
            </View>
          </Surface>

          {/* PERSONAL NOTES SECTION */}
          <View style={styles.sectionHeader}>
            <Text variant="labelMedium" style={styles.sectionLabel}>
                {t('common:personal_reflections', 'REFLECTIONS')}
            </Text>
            <IconButton 
                icon={isEditing ? "check-circle" : "pencil-circle-outline"} 
                size={24} 
                iconColor={isEditing ? theme.colors.primary : theme.colors.onSurface}
                onPress={isEditing ? handleSaveNotes : () => setIsEditing(true)} 
            />
          </View>

          {isEditing ? (
            <TextInput
              mode="outlined"
              multiline
              value={notes}
              onChangeText={setNotes}
              placeholder={t('common:write_reflections', 'Describe how you feel...')}
              style={styles.notesInput}
              outlineStyle={{ borderRadius: 16 }}
            />
          ) : (
            <Surface style={styles.notesBox} elevation={1}>
              <Text style={notes ? styles.notesText : styles.emptyText}>
                {notes || t('common:no_notes_yet', 'The pages of your reflection are empty...')}
              </Text>
            </Surface>
          )}

          <Text style={styles.footerBranding}>
             {t('common:app_footer', 'CHRONICLED BY AI TAROTS')}
          </Text>
        </ScrollView>
      </ViewShot>      
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  dateText: {
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 26,
  },
  accentLine: {
    height: 3,
    width: 40,
    marginTop: 16,
    borderRadius: 2,
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
    opacity: 0.6,
    fontWeight: 'bold',
  },
  cardsGrid: {
    gap: 16,
    marginBottom: 32,
  },
  cardItemSurface: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  cardItemRow: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardImageFrame: {
    width: 70,
    height: 110,
    borderRadius: 8,
    marginRight: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardTextInfo: {
    flex: 1,
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
  },
  cardNameText: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orientationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  orientationText: {
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.5,
    letterSpacing: 1,
  },
  aiInterpretationBox: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 32,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -8,
  },
  aiTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollDecoration: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    opacity: 0.2,
  },
  line: {
    height: 1,
    width: 60,
    marginHorizontal: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  notesBox: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    minHeight: 120,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontSize: 16,
    minHeight: 150,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
  },
  emptyText: {
    opacity: 0.4,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  footerBranding: {
    textAlign: 'center',
    opacity: 0.2,
    marginTop: 40,
    fontSize: 10,
    letterSpacing: 2,
  }
});

export default ReadingDetailScreen;
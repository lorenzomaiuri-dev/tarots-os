import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Text, useTheme, Divider, Surface } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { CardImage } from '../../components/CardImage';

type DetailRouteProp = RouteProp<RootStackParamList, 'ReadingDetail'>;

const ReadingDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const route = useRoute<DetailRouteProp>();
  const { readings } = useHistoryStore();

  const reading = readings.find(r => r.id === route.params.readingId);

  if (!reading) return null;

  const dateStr = new Date(reading.timestamp).toLocaleString();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>
            {t(`spreads:${reading.spreadId}.name`)}
          </Text>
          <Text variant="bodyMedium" style={{ opacity: 0.6, marginTop: 4 }}>
            {dateStr}
          </Text>
        </View>

        <Divider style={{ marginVertical: 16 }} />

        {/* CARDS GRID (Simple Layout) */}
        <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold' }}>
           {t('common:drawn_cards', 'Drawn cards')}
        </Text>
        
        <View style={styles.cardsContainer}>
          {reading.cards.map((drawn, index) => (
            <View key={index} style={styles.cardRow}>
              {/* Image Thumbnail */}
              <View style={styles.cardImageWrapper}>
                 <CardImage 
                   deckId={reading.deckId} 
                   cardId={drawn.cardId} 
                   style={[
                     styles.cardImage, 
                     drawn.isReversed && { transform: [{ rotate: '180deg' }] }
                   ]} 
                 />
              </View>

              {/* Text Info */}
              <View style={styles.cardInfo}>
                <Text variant="labelSmall" style={{ color: theme.colors.primary }}>
                  {t(`spreads:${reading.spreadId}.positions.${drawn.positionId}.label`)}
                </Text>
                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                  {t(`decks:${reading.deckId}.cards.${drawn.cardId}.name`)}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  {drawn.isReversed ? t('common:reversed', 'Reversed') : t('common:upright', 'Upright')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Divider style={{ marginVertical: 24 }} />

        {/* AI INTERPRETATION */}
        {reading.aiInterpretation ? (
          <Surface style={[styles.aiSurface, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="titleMedium" style={{ marginBottom: 12, fontWeight: 'bold', color: theme.colors.tertiary }}>
              {t('common:interpretation', 'Interpretation')}
            </Text>
            <Markdown style={{ 
                body: { color: theme.colors.onSurface, fontSize: 16, lineHeight: 24 } 
            }}>
              {reading.aiInterpretation}
            </Markdown>
          </Surface>
        ) : (
           <Text style={{ opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>
             {t('common:no_interpretation', 'No interpretation found')}
           </Text>
        )}

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 16,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImageWrapper: {
    width: 60,
    height: 100,
    marginRight: 16,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  cardInfo: {
    flex: 1,
  },
  aiSurface: {
    padding: 16,
    borderRadius: 12,
  }
});

export default ReadingDetailScreen;
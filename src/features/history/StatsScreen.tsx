import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Surface, ProgressBar, Divider } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { calculateStats } from '../../utils/statistics';
import { CardImage } from '../../components/CardImage';
import { getDeck } from '../../services/deckRegistry';

const StatsScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { readings } = useHistoryStore();
  const { activeDeckId } = useSettingsStore();

  // 1. Get the deck definition
  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);
  
  // 2. Calculate stats
  const stats = useMemo(() => calculateStats(readings, activeDeckId), [readings, activeDeckId]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text variant="headlineSmall" style={styles.header}>
            {t('common:insights', 'Insights')}
        </Text>

        {/* SUMMARY CARDS */}
        <View style={styles.row}>
            <Surface style={[styles.statBox, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.onPrimaryContainer }}>
                    {stats.totalReadings}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer }}>
                    {t('common:total_readings', 'Total Readings')}
                </Text>
            </Surface>
            
            <Surface style={[styles.statBox, { backgroundColor: theme.colors.secondaryContainer }]}>
                <Text variant="displaySmall" style={{ fontWeight: 'bold', color: theme.colors.onSecondaryContainer }}>
                    {stats.totalCards}
                </Text>
                <Text variant="labelMedium" style={{ color: theme.colors.onSecondaryContainer }}>
                    {t('common:drawn_cards', 'Drawn Cards')}
                </Text>
            </Surface>
        </View>

        <Divider style={{ marginVertical: 24 }} />

        {/* TOP CARD */}
        {stats.topCardId && (
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>{t('common:recurring_card_title', 'Your recurring card')}</Text>
                <View style={styles.topCardContainer}>
                    <CardImage 
                        deckId={activeDeckId} 
                        cardId={stats.topCardId} 
                        style={styles.topCardImage} 
                    />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
                            {t(`decks:${activeDeckId}.cards.${stats.topCardId}.name`)}
                        </Text>
                        <Text variant="bodyMedium">
                            {t('common:drawn', 'Drawn')} {stats.topCardCount} {t('common:times', 'times')}
                        </Text>
                        <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
                          {t('common:recurring_card_message', 'This card seems to always come to you...')}
                        </Text>
                    </View>
                </View>
            </View>
        )}

        <Divider style={{ marginVertical: 24 }} />

        {/* DYNAMIC SUIT DISTRIBUTION */}
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('common:elemental_balance_title', 'Elemental Balance')}
          </Text>
          
          {deck && Object.entries(deck.info.groups).map(([groupKey, config]) => {
            const count = stats.suitCounts[groupKey] || 0;
            const percentage = stats.totalCards > 0 ? count / stats.totalCards : 0;

            return (
              <View key={groupKey} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text variant="bodyMedium">
                    {/* Translate using the labelKey from JSON */}
                    {t(`common:${config.labelKey}`, groupKey)}
                  </Text>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {Math.round(percentage * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={percentage} 
                  color={config.color} 
                  style={{ height: 8, borderRadius: 4 }} 
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  topCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCardImage: {
    width: 80,
    height: 130,
    borderRadius: 8,
  }
});

export default StatsScreen;
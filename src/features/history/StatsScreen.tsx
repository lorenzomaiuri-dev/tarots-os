import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Surface, ProgressBar, Avatar } from 'react-native-paper';
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

  // 1. Get the current deck configuration
  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);

  // 2. Calculate stats (filtered by deckId inside the utility)
  const stats = useMemo(() => calculateStats(readings, activeDeckId), [readings, activeDeckId]);

  // 3. CRASH PROTECTION: Ensure topCardId exists in the current deck's card list
  // This prevents trying to translate/render a Card ID that doesn't exist in the active deck
  const isValidTopCard = useMemo(() => {
    if (!stats.topCardId || !deck) return false;
    return deck.cards.some(c => c.id === stats.topCardId);
  }, [stats.topCardId, deck]);

  // Map suit/group keys to mystical icons
  const getGroupIcon = (key: string) => {
    switch (key.toLowerCase()) {
      case 'swords': return 'sword';
      case 'cups': return 'cup-water';
      case 'wands': return 'auto-fix';
      case 'pentacles':
      case 'coins': return 'pentagram';
      case 'major': return 'star-shooting';
      default: return 'cards-diamond';
    }
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
            <Text variant="headlineMedium" style={styles.headerTitle}>
                {t('common:insights', 'Your Patterns')}
            </Text>
            <Text variant="labelLarge" style={[styles.headerSubtitle, { color: theme.colors.primary }]}>
                {t('common:stats_subtitle', 'ELEMENTAL ALIGNMENT')}
            </Text>
        </View>

        {/* TOP LEVEL STATS TILES */}
        <View style={styles.summaryRow}>
            <Surface style={styles.summaryTile} elevation={1}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>{stats.totalReadings}</Text>
                <Text variant="labelSmall" style={styles.summaryLabel}>{t('common:readings', 'READINGS')}</Text>
            </Surface>
            
            <Surface style={styles.summaryTile} elevation={1}>
                <Text variant="headlineMedium" style={styles.summaryNumber}>{stats.totalCards}</Text>
                <Text variant="labelSmall" style={styles.summaryLabel}>{t('common:cards', 'CARDS')}</Text>
            </Surface>
        </View>

        {/* TOP CARD SPOTLIGHT */}
        {isValidTopCard && stats.topCardId && (
            <Surface style={styles.spotlightCard} elevation={2}>
                <View style={[styles.spotlightGlow, { backgroundColor: theme.colors.primary, opacity: 0.1 }]} />
                <Text variant="labelMedium" style={styles.spotlightHeader}>
                    {t('common:recurring_card_title', 'THE RECURRING SHADOW')}
                </Text>
                
                <View style={styles.spotlightContent}>
                    <View style={styles.cardFrame}>
                        <CardImage 
                            deckId={activeDeckId} 
                            cardId={stats.topCardId} 
                            style={styles.spotlightImage} 
                        />
                    </View>
                    
                    <View style={styles.spotlightText}>
                        <Text variant="titleLarge" style={styles.topCardName}>
                            {t(`decks:${activeDeckId}.cards.${stats.topCardId}.name`, { defaultValue: 'Unknown Card' })}
                        </Text>
                        <View style={styles.countBadge}>
                            <Text style={styles.countBadgeText}>
                                {stats.topCardCount} {t('common:times', 'times')}
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={styles.spotlightDesc}>
                          {t('common:recurring_card_message', 'This energy consistently manifests in your journey.')}
                        </Text>
                    </View>
                </View>
            </Surface>
        )}

        {/* ELEMENTAL BALANCE SECTION */}
        <Surface style={styles.balanceSection} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            {t('common:elemental_balance_title', 'Elemental Balance')}
          </Text>
          
          {deck?.info?.groups && Object.entries(deck.info.groups).map(([groupKey, config]: [string, any]) => {
            const count = stats.suitCounts[groupKey] || 0;
            const percentage = stats.totalCards > 0 ? count / stats.totalCards : 0;

            return (
              <View key={groupKey} style={styles.progressItem}>
                <View style={styles.progressLabelRow}>
                  <View style={styles.iconAndLabel}>
                    <Avatar.Icon 
                        size={24} 
                        icon={getGroupIcon(groupKey)} 
                        style={{ backgroundColor: 'transparent' }} 
                        color={config.color || theme.colors.onSurface}
                    />
                    <Text variant="bodyMedium" style={styles.groupName}>
                        {t(`common:${config.labelKey}`, groupKey)}
                    </Text>
                  </View>
                  <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
                    {Math.round(percentage * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={percentage} 
                  color={config.color} 
                  style={styles.progressBar} 
                />
              </View>
            );
          })}
          
          {stats.totalReadings === 0 && (
            <Text style={{ textAlign: 'center', opacity: 0.5, marginTop: 10 }}>
                {t('common:no_data_yet', 'Your journey has just begun.')}
            </Text>
          )}
        </Surface>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    letterSpacing: 2,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  summaryTile: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  summaryNumber: {
    fontWeight: '900',
    fontFamily: 'serif',
  },
  summaryLabel: {
    opacity: 0.5,
    letterSpacing: 1,
    marginTop: 4,
  },
  spotlightCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  spotlightGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  spotlightHeader: {
    letterSpacing: 2,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 12,
  },
  spotlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFrame: {
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  spotlightImage: {
    width: 100,
    height: 170,
    borderRadius: 12,
  },
  spotlightText: {
    flex: 1,
    marginLeft: 20,
  },
  topCardName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginVertical: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  spotlightDesc: {
    opacity: 0.5,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  balanceSection: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  progressItem: {
    marginBottom: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconAndLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupName: {
    marginLeft: 4,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.05)',
  }
});

export default StatsScreen;
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, useTheme, IconButton, Surface } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types/navigation';
import { AI_CONFIG } from "../../constants";

import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useDailyDraw } from '../../hooks/useDailyDraw';
import { CardFlip } from '../../components/CardFlip';
import { useInterpretation } from '../../hooks/useInterpretation';
import { InterpretationModal } from '../../components/InterpretationModal';
import { Spread } from '../../types/reading';
import { useState } from 'react';

// TODO: SPREADS CONFIG
const DAILY_SPREAD: Spread = {
  id: 'one-card',
  slots: [{ id: 'daily' }]
};

// TODO: CONST
const question: string = "What is the main energy for my day?"

const HomeScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const { activeDeckId } = useSettingsStore();
  const { dailyCard, drawNow, isLoading: isDrawLoading } = useDailyDraw();
  const [modalVisible, setModalVisible] = useState(false);
  const { result, isLoading: isAiLoading, error, interpretReading } = useInterpretation();

  const handleInterpret = () => {
    if (!dailyCard) return;
    
    setModalVisible(true);
    
    // TODO: Use result from history
    // Regenerate if null
    if (!result) {
      interpretReading(
        activeDeckId,
        DAILY_SPREAD,
        [dailyCard], // one card
        question
      );
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text variant="headlineMedium" style={styles.greeting}>{AI_CONFIG.APP_NAME}</Text>
          <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <IconButton 
          icon="cog-outline" 
          size={24} 
          onPress={() => navigation.navigate('Settings')} 
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* DAILY CARD WIDGET */}
        <Surface style={[styles.dailyCardSurface, { backgroundColor: theme.colors.elevation.level1 }]} elevation={2}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            {t('common:daily_card_title', 'Daily Card')}
          </Text>
          <Text variant="bodySmall" style={{ marginBottom: 24, opacity: 0.6 }}>
            {dailyCard 
              ? t(`decks:${activeDeckId}.cards.${dailyCard.cardId}.name`, 'Name of the card you extracted')
              : t('common:daily_card_subtitle', "Uncover your card for the day")
            }
          </Text>

          <View style={styles.dailyCardPlaceholder}>
             {/* 
                - If dailyCard is null, show back.
                - When the pressed, call drawNow().
                - drawNow set the dailyCard -> CardFlip see the ID and get flipped
             */}
             <CardFlip 
               deckId={activeDeckId}
               cardId={dailyCard?.cardId || null}
               isReversed={dailyCard?.isReversed}
               onFlip={drawNow}
               width={160}
               height={260}
             />

             {/* ADDITIONAL INFO */}
             {dailyCard && (
               <View style={{ marginTop: 20, alignItems: 'center' }}>
                 <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                   {dailyCard.isReversed ? t('common:reversed', "Reversed") : t('common:upright', "Upright")}
                 </Text>
                 
                 <Button 
                   icon="creation" 
                   mode="contained-tonal" 
                   style={{ marginTop: 12 }}
                   onPress={handleInterpret}
                 >
                   {t('common:interpretation', "Interpretation")}
                 </Button>
               </View>
             )}
          </View>
        </Surface>

        {/* ACTIVE DECK INFO */}
        <View style={styles.deckSection}>
          <View style={styles.rowBetween}>
            <Text variant="titleMedium">{t('common:active_deck', 'Active Deck')}</Text>
            <Button mode="text" onPress={() => navigation.navigate('DeckSelection')}>
              {t('common:change', 'Change')}
            </Button>
          </View>
          <Text variant="bodyLarge" style={{ color: theme.colors.primary }}>
            {t(`decks:${activeDeckId}.name`)}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsContainer}>
          <Button 
            mode="contained" 
            icon="cards-playing-outline"
            contentStyle={{ height: 56 }}
            style={styles.actionButton}
            onPress={() => navigation.navigate('SpreadSelection')} 
          >
            {t('common:new_reading', 'New Reading')}
          </Button>

          <Button 
            mode="outlined" 
            icon="history"
            style={styles.actionButton}
            onPress={() => console.log('Navigate to History')}
          >
            {t('common:history', 'History')}
          </Button>
        </View>

      </ScrollView>

      {/* AI MODAL */}
      <InterpretationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isLoading={isAiLoading}
        content={result}
        error={error}
        title={t('common:daily_reading_title', 'Daily Reading')}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  dailyCardSurface: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
  },
  dailyCardPlaceholder: {
    alignItems: 'center',
    marginTop: 8,
  },
  deckSection: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 8,
  }
});

export default HomeScreen;
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { Text, Button, useTheme, Surface, IconButton, Avatar } from 'react-native-paper';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../../types/navigation';
import { AI_CONFIG } from "../../constants";

import { ScreenContainer } from '../ScreenContainer';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useDailyDraw } from '../../hooks/useDailyDraw';
import { useHaptics } from '../../hooks/useHaptics';
import { CardFlip } from '../../components/CardFlip';
import { useInterpretation } from '../../hooks/useInterpretation';
import { useHistoryStore } from '../../store/useHistoryStore';
import { InterpretationModal } from '../../components/InterpretationModal';
import { ReadingSession, Spread } from '../../types/reading';

const { width } = Dimensions.get('window');

const DAILY_SPREAD: Spread = {
  id: 'one-card',
  slots: [{ id: 'daily' }]
};

const question = "What is the main energy for my day?";

const HomeScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const { activeDeckId } = useSettingsStore();
  const { addReading } = useHistoryStore();
  const haptics = useHaptics();
  const { dailyCard, drawNow, isLoading: isDrawLoading } = useDailyDraw();
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { result, isLoading: isAiLoading, error, interpretReading } = useInterpretation();

  const handleInterpret = () => {
    if (!dailyCard) return;
    setModalVisible(true);
    if (!result) {
      interpretReading(activeDeckId, DAILY_SPREAD, [dailyCard], question);
    }
  };

  const handleSaveToJournal = () => {
    if (!dailyCard || !result) return;
    
    const session: ReadingSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      spreadId: 'one-card',
      deckId: activeDeckId,
      cards: [dailyCard],
      aiInterpretation: result,
      userNotes: ''
    };
    
    addReading(session);
    setIsSaved(true);
    Alert.alert(t('common:saved', 'Saved'), t('common:saved_to_journal', 'Saved to journal'));
  };

  const formattedDate = new Date().toLocaleDateString(undefined, { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'long' 
  }).toUpperCase();

  return (
    <ScreenContainer>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text variant="labelMedium" style={[styles.dateText, { color: theme.colors.primary }]}>
            {formattedDate}
          </Text>
          <Text variant="headlineMedium" style={styles.appName}>{AI_CONFIG.APP_NAME}</Text>
        </View>
        <IconButton 
          icon="cog-outline" 
          onPress={() => navigation.navigate('MainTabs', { screen: 'SettingsTab' })} 
          style={styles.settingsBtn}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* DAILY CARD FOCUS BOX */}
        <Surface style={styles.dailyFocusContainer} elevation={1}>
          <View style={styles.focusHeader}>
            <View style={[styles.ornamentLine, { backgroundColor: theme.colors.primary }]} />
            <Text variant="titleMedium" style={styles.focusTitle}>
              {t('common:daily_card_title', 'Daily Reflection')}
            </Text>
            <View style={[styles.ornamentLine, { backgroundColor: theme.colors.primary }]} />
          </View>

          <View style={styles.cardDisplayArea}>
             <CardFlip 
               deckId={activeDeckId}
               cardId={dailyCard?.cardId || null}
               isReversed={dailyCard?.isReversed}
               onFlip={drawNow}
               width={width * 0.45}
               height={width * 0.75}
             />
             
             {!dailyCard && (
               <Text variant="labelSmall" style={styles.tapPrompt}>
                 {t('common:tap_to_reveal', 'TAP TO REVEAL')}
               </Text>
             )}
          </View>

          {dailyCard ? (
            <View style={styles.cardInfoArea}>
              <Text variant="headlineSmall" style={styles.revealedCardName}>
                {t(`decks:${activeDeckId}.cards.${dailyCard.cardId}.name`)}
              </Text>
              <Text variant="labelLarge" style={[styles.orientationText, { color: theme.colors.secondary }]}>
                 {dailyCard.isReversed ? t('common:reversed', "Reversed") : t('common:upright', "Upright")}
              </Text>
              
              <Button 
                icon="creation" 
                mode="contained" 
                onPress={handleInterpret}
                style={styles.interpretButton}
                contentStyle={{ height: 48 }}
              >
                {t('common:get_interpretation', "Reveal Meaning")}
              </Button>
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.dailySubtitle}>
              {t('common:daily_card_subtitle', "Focus your energy and reveal your guidance for today.")}
            </Text>
          )}
        </Surface>

        {/* PRIMARY ACTIONS GRID */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.mainAction, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => navigation.navigate('SpreadSelection')}
          >
            <Avatar.Icon size={48} icon="cards-playing-outline" style={{ backgroundColor: 'transparent' }} color={theme.colors.onPrimaryContainer} />
            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onPrimaryContainer }}>
              {t('common:new_reading', 'New Reading')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryAction, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
            onPress={() => navigation.navigate('MainTabs', { screen: 'HistoryTab' })}
          >
            <IconButton icon="history" size={24} />
            <Text variant="labelLarge">{t('common:history', 'History')}</Text>
          </TouchableOpacity>
        </View>

        {/* ACTIVE DECK STATUS */}
        <Surface style={styles.deckStatusCard} elevation={0}>
          <View style={styles.deckInfoLeft}>
            <Text variant="labelSmall" style={{ opacity: 0.5, letterSpacing: 1 }}>{t('common:active_deck', 'ACTIVE DECK')}</Text>
            <Text variant="bodyLarge" style={styles.deckName} numberOfLines={1}>
              {t(`decks:${activeDeckId}.info.name`)}
            </Text>
          </View>
          <Button mode="text" compact onPress={() => navigation.navigate('DeckSelection')}>
            {t('common:change', 'Switch')}
          </Button>
          <Button mode="text" compact onPress={() => navigation.navigate('DeckExplorer')}>
            {t('common:explore', 'Explore')}
          </Button>
        </Surface>

      </ScrollView>

      <InterpretationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isLoading={isAiLoading}
        content={result}
        error={error}
        title={t('common:daily_reading_title', 'Daily Insight')}
        actions={
          !isSaved ? (
            <Button 
              mode="contained-tonal" 
              icon="notebook-plus-outline" 
              onPress={handleSaveToJournal}
              style={{ width: '100%' }}
            >
              {t('common:save_to_journal', "Save to Journal")}
            </Button>
          ) : (
            <Button 
              mode="outlined" 
              icon="check" 
              disabled 
              style={{ width: '100%', borderColor: theme.colors.primary }}
              textColor={theme.colors.primary}
            >
              {t('common:saved', "Salvato")}
            </Button>
          )
        }
      />
    </ScreenContainer>
  );
};

// Helper for the grid buttons
const TouchableOpacity = require('react-native').TouchableOpacity;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  dateText: {
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appName: {
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  settingsBtn: {
    marginTop: -4,
  },
  scrollPadding: {
    paddingBottom: 40,
  },
  dailyFocusContainer: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ornamentLine: {
    height: 1,
    width: 30,
    opacity: 0.3,
  },
  focusTitle: {
    marginHorizontal: 15,
    fontFamily: 'serif',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 14,
  },
  cardDisplayArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapPrompt: {
    marginTop: 12,
    opacity: 0.5,
    letterSpacing: 3,
  },
  dailySubtitle: {
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.6,
    paddingHorizontal: 20,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  cardInfoArea: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  revealedCardName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  orientationText: {
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
    fontSize: 12,
  },
  interpretButton: {
    marginTop: 20,
    width: '80%',
    borderRadius: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mainAction: {
    flex: 2,
    height: 120,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deckStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deckInfoLeft: {
    flex: 1,
  },
  deckName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginTop: 2,
  }
});

export default HomeScreen;
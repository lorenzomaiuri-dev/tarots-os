import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Text, Button, useTheme, SegmentedButtons, Surface } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { CardFlip } from '../../components/CardFlip';
import { InterpretationModal } from '../../components/InterpretationModal';
import { SpreadVisualizer } from '../../components/SpreadVisualizer';

import { useSettingsStore } from '../../store/useSettingsStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useInterpretation } from '../../hooks/useInterpretation';
import { useHaptics } from '../../hooks/useHaptics';
import { getDeck } from '../../services/deckRegistry';
import { drawCards } from '../../services/rng';
import { DrawnCard, ReadingSession, Spread } from '../../types/reading';
import spreadsData from '../../data/spreads.json';

type ReadingTableRouteProp = RouteProp<RootStackParamList, 'ReadingTable'>;

const { width } = Dimensions.get('window');

const ReadingTableScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReadingTableRouteProp>();

  const { activeDeckId, preferences } = useSettingsStore();
  const { addReading } = useHistoryStore();

  const [spread, setSpread] = useState<Spread | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [viewMode, setViewMode] = useState('table');
  
  const [modalVisible, setModalVisible] = useState(false);
  const { result, isLoading, error, interpretReading } = useInterpretation();

  useEffect(() => {
    const foundSpread = spreadsData.find(s => s.id === route.params.spreadId);
    if (foundSpread) {
      setSpread(foundSpread as Spread);
    }
  }, [route.params.spreadId]);

  const handleDrawCard = (slotId: string) => {
    const deck = getDeck(activeDeckId);
    if (!deck) return;

    let deckToUse = deck;
    if (preferences.onlyMajorArcana) {
      deckToUse = { ...deck, cards: deck.cards.filter(c => c.meta.type === 'major') };
    }

    const alreadyDrawnIds = drawnCards.map(d => d.cardId);
    const availableCardsDeck = {
        ...deckToUse,
        cards: deckToUse.cards.filter(c => !alreadyDrawnIds.includes(c.id))
    };

    if (availableCardsDeck.cards.length === 0) {
        Alert.alert(t('common:error_deck_empty', "Empty Deck!"));
        return;
    }

    const results = drawCards(availableCardsDeck, 1, undefined, preferences.allowReversed);
    const newCard: DrawnCard = {
      cardId: results[0].card.id,
      deckId: activeDeckId,
      positionId: slotId,
      isReversed: results[0].isReversed
    };
    haptics.medium(); 
    setDrawnCards(prev => [...prev, newCard]);
  };

  const handleInterpret = async () => {
    if (!spread) return;
    setModalVisible(true);
    if (!result) {
      let questionToAsk = route.params.customQuestion;
        
        if (!questionToAsk && spread.defaultQuestionKey) {
            questionToAsk = t(`prompts:${spread.defaultQuestionKey}`);
        }
        
        if (!questionToAsk) {
             questionToAsk = t('prompts:general_guidance', "Please interpret this reading.");
        }

        await interpretReading(activeDeckId, spread, drawnCards, questionToAsk);
    }
  };

  const handleSaveAndExit = () => {
      const session: ReadingSession = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          spreadId: spread?.id || '',
          deckId: activeDeckId,
          cards: drawnCards,
          aiInterpretation: result || undefined
      };
      addReading(session);
      navigation.navigate('MainTabs', { screen: 'HomeTab' });
  };

  if (!spread) return null;

  const isReadingComplete = drawnCards.length === spread.slots.length;

  return (
    <ScreenContainer style={{ paddingHorizontal: 0 }}> 
      {/* HEADER */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>
            {t(`spreads:${spread.id}.name`)}
        </Text>
        
        <View style={{ marginTop: 12, width: 220 }}>
          <SegmentedButtons
            value={viewMode}
            onValueChange={setViewMode}
            buttons={[
              { value: 'table', label: t('common:table', 'Table'), icon: 'view-grid-outline' },
              { value: 'list', label: t('common:list', 'List'), icon: 'format-list-bulleted' },
            ]}
            density="small"
          />
        </View>
      </View>

      {/* CONTENT AREA */}
      <View style={{ flex: 1 }}>
        {viewMode === 'table' ? (
              <SpreadVisualizer 
                  spread={spread}
                  deckId={activeDeckId}
                  drawnCards={drawnCards}
                  onSlotPress={handleDrawCard}
              />
          ) : (
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
              {spread.slots.map((slot, index) => {
                const drawn = drawnCards.find(c => c.positionId === slot.id);
                
                return (
                  <View key={slot.id} style={styles.slotContainer}>
                    {/* ENHANCED TEXT SECTION */}
                    <Surface style={styles.slotTextCard} elevation={1}>
                        <Text variant="labelLarge" style={[styles.slotLabel, { color: theme.colors.primary }]}>
                          {index + 1} — {t(`spreads:${spread.id}.positions.${slot.id}.label`)}
                        </Text>
                        <Text variant="bodyMedium" style={styles.slotDesc}>
                          {t(`spreads:${spread.id}.positions.${slot.id}.description`)}
                        </Text>
                    </Surface>

                    <View style={styles.cardWrapper}>
                      <CardFlip 
                        deckId={activeDeckId}
                        cardId={drawn?.cardId || null}
                        isReversed={drawn?.isReversed}
                        onFlip={() => !drawn && handleDrawCard(slot.id)}
                        width={140}
                        height={230}
                      />
                      
                      {!drawn && (
                        <View style={styles.tapHint}>
                            <Text style={styles.tapHintText}>{t('common:tap', 'TAP TO DRAW')}</Text>
                        </View>
                      )}
                    </View>

                    {drawn && (
                        <Text variant="titleMedium" style={styles.cardName}>
                          {t(`decks:${activeDeckId}.cards.${drawn.cardId}.name`)}
                          {drawn.isReversed ? ` (${t('common:reversed', 'Reversed')})` : ''}
                        </Text>
                    )}
                  </View>
                );
              })}
              <View style={styles.footerSpace} />
            </ScrollView>
          )}
      </View>
    
      {/* BOTTOM ACTION BAR */}
      {isReadingComplete && (
          <View style={[styles.actionBar, { backgroundColor: theme.colors.elevation.level2 }]}>
              <Button mode="outlined" onPress={handleSaveAndExit} style={{flex: 1, marginRight: 8}}>
                  {t('common:save', 'Save')}
              </Button>
              <Button mode="contained" icon="creation" onPress={handleInterpret} style={{flex: 1}}>
                  {t('common:ai', 'AI Reading')}
              </Button>
          </View>
      )}

      <InterpretationModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        isLoading={isLoading}
        content={result}
        error={error}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
      fontWeight: 'bold',
      fontFamily: 'serif',
      letterSpacing: 1,
  },
  scrollContent: {
      paddingBottom: 120,
      paddingTop: 10,
      alignItems: 'center',
  },
  slotContainer: {
      marginBottom: 50,
      alignItems: 'center',
      width: '100%',
  },
  slotTextCard: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 20,
      width: width * 0.85,
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  slotLabel: {
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 6,
      fontSize: 13,
  },
  slotDesc: {
      textAlign: 'center',
      opacity: 0.7,
      fontStyle: 'italic',
      fontFamily: 'serif',
      lineHeight: 20,
  },
  cardWrapper: {
      position: 'relative',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.44,
      shadowRadius: 10.32,
      elevation: 16,
  },
  tapHint: {
      position: 'absolute',
      bottom: 15,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
  },
  tapHintText: {
      color: 'white', 
      fontSize: 10, 
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  cardName: {
      marginTop: 16,
      fontWeight: 'bold',
      fontFamily: 'serif',
  },
  footerSpace: {
      height: 100,
  },
  actionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      paddingBottom: 34, 
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
  }
});

export default ReadingTableScreen;
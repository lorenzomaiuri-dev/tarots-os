import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, useTheme, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { CardFlip } from '../../components/CardFlip';
import { InterpretationModal } from '../../components/InterpretationModal';

import { useSettingsStore } from '../../store/useSettingsStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useInterpretation } from '../../hooks/useInterpretation';
import { getDeck } from '../../services/deckRegistry';
import { drawCards } from '../../services/rng';
import { DrawnCard, ReadingSession, Spread } from '../../types/reading';
import spreadsData from '../../data/spreads.json';

type ReadingTableRouteProp = RouteProp<RootStackParamList, 'ReadingTable'>;

const ReadingTableScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<ReadingTableRouteProp>();

  // GLOBAL STATE
  const { activeDeckId, preferences } = useSettingsStore();
  const { addReading } = useHistoryStore();

  // LOCAL STATE
  const [spread, setSpread] = useState<Spread | null>(null);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  
  // AI STATE
  const [modalVisible, setModalVisible] = useState(false);
  const { result, isLoading, error, interpretReading } = useInterpretation();

  // INIT
  useEffect(() => {
    const foundSpread = spreadsData.find(s => s.id === route.params.spreadId);
    if (foundSpread) {
      setSpread(foundSpread);
    }
  }, [route.params.spreadId]);

  // LOGIC: Draw a single card for a specific slot
  const handleDrawCard = (slotId: string) => {
    const deck = getDeck(activeDeckId);
    if (!deck) return;

    // Filter deck logic
    let deckToUse = deck;
    if (preferences.onlyMajorArcana) {
      deckToUse = { ...deck, cards: deck.cards.filter(c => c.meta.type === 'major') };
    }

    // Exclude cards already drawn to avoid duplicates in the same spread
    const alreadyDrawnIds = drawnCards.map(d => d.cardId);
    const availableCardsDeck = {
        ...deckToUse,
        cards: deckToUse.cards.filter(c => !alreadyDrawnIds.includes(c.id))
    };

    if (availableCardsDeck.cards.length === 0) {
        Alert.alert("Mazzo esaurito!");
        return;
    }

    // Draw 1 card
    const result = drawCards(availableCardsDeck, 1, undefined, preferences.allowReversed);
    const newCard: DrawnCard = {
      cardId: result[0].card.id,
      deckId: activeDeckId,
      positionId: slotId,
      isReversed: result[0].isReversed
    };

    setDrawnCards(prev => [...prev, newCard]);
  };

  // LOGIC: Interpret
  const handleInterpret = async () => {
    if (!spread) return;
    setModalVisible(true);
    
    if (!result) {
        await interpretReading(activeDeckId, spread, drawnCards);
        // TODO: Save to history here or after success
    }
  };

  // LOGIC: Save & Exit
  const handleSaveAndExit = () => {
      // Create session object
      const session: ReadingSession = {
          id: Date.now().toString(), // UUID ideally
          timestamp: new Date().getUTCMilliseconds(),
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
    <ScreenContainer>
      {/* HEADER */}
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.title}>
            {t(`spreads:${spread.id}.name`)}
        </Text>
        <Text variant="bodySmall" style={{opacity: 0.6}}>
            {drawnCards.length} / {spread.slots.length}
        </Text>
      </View>

      {/* TABLE (Slots List) */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {spread.slots.map((slot, index) => {
          const drawn = drawnCards.find(c => c.positionId === slot.id);
          
          return (
            <View key={slot.id} style={styles.slotContainer}>
               {/* SLOT LABEL */}
               <Text variant="labelMedium" style={styles.slotLabel}>
                 {index + 1}. {t(`spreads:${spread.id}.positions.${slot.id}.label`)}
               </Text>
               <Text variant="bodySmall" style={styles.slotDesc}>
                 {t(`spreads:${spread.id}.positions.${slot.id}.description`)}
               </Text>

               {/* CARD INTERACTION */}
               <View style={styles.cardWrapper}>
                 <CardFlip 
                   deckId={activeDeckId}
                   cardId={drawn?.cardId || null}
                   isReversed={drawn?.isReversed}
                   onFlip={() => !drawn && handleDrawCard(slot.id)}
                   width={120}
                   height={200}
                 />
                 
                 {!drawn && (
                   <View style={styles.tapHint}>
                      <Text style={{color: 'white', fontSize: 10}}>Tap</Text>
                   </View>
                 )}
               </View>

               {/* REVEALED CARD NAME */}
               {drawn && (
                  <Text style={styles.cardName}>
                    {t(`decks:${activeDeckId}.cards.${drawn.cardId}.name`)}
                  </Text>
               )}
            </View>
          );
        })}

        {/* ACTIONS */}
        <View style={styles.footerSpace} />
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      {isReadingComplete && (
          <View style={[styles.actionBar, { backgroundColor: theme.colors.elevation.level2 }]}>
              <Button mode="outlined" onPress={handleSaveAndExit} style={{flex: 1, marginRight: 8}}>
                  {t('common:save', 'Save')}
              </Button>
              <Button mode="contained" icon="creation" onPress={handleInterpret} style={{flex: 1}}>
                  {t('common:ai', 'AI')}
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
    paddingVertical: 16,
    alignItems: 'center',
  },
  title: {
      fontWeight: 'bold',
      fontFamily: 'serif',
  },
  scrollContent: {
      paddingBottom: 100,
      alignItems: 'center',
  },
  slotContainer: {
      marginBottom: 32,
      alignItems: 'center',
      width: '100%',
  },
  slotLabel: {
      fontWeight: 'bold',
      color: '#D0BCFF',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  slotDesc: {
      marginBottom: 12,
      opacity: 0.7,
      fontStyle: 'italic',
  },
  cardWrapper: {
      position: 'relative',
  },
  tapHint: {
      position: 'absolute',
      bottom: 10,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: 8,
      borderRadius: 4,
  },
  cardName: {
      marginTop: 8,
      fontWeight: 'bold',
  },
  footerSpace: {
      height: 80,
  },
  actionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
  }
});

export default ReadingTableScreen;
import React, { useMemo, useState, useCallback } from 'react';
import { SectionList, StyleSheet, TouchableOpacity, View, Modal, ScrollView, Dimensions } from 'react-native';
import { Text, useTheme, Searchbar, IconButton, Button, Surface, Avatar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../ScreenContainer';
import { CardImage } from '../../components/CardImage';
import { getDeck } from '../../services/deckRegistry';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Card, Deck } from '../../types/deck';
import { useInterpretation } from '../../hooks/useInterpretation';
import { InterpretationModal } from '../../components/InterpretationModal';

const { width, height } = Dimensions.get('window');
const PAGE_SIZE = 20;

const groupCards = (cards: Card[], deck: Deck, t: any) => {
  const groupConfigs = deck.info.groups;
  const groupKeys = Object.keys(groupConfigs);

  // 1. Initialize the structure based on the deck's defined groups
  const groupsMap: Record<string, { title: string; type: string; color: string; data: Card[] }> = {};
  
  groupKeys.forEach((key) => {
    groupsMap[key] = {
      title: t(`common:${groupConfigs[key].labelKey}`),
      type: key,
      color: groupConfigs[key].color,
      data: [],
    };
  });

  // 2. Distribute cards into buckets
  cards.forEach((card) => {
    // Priority 1: Match by type (e.g., 'major')
    if (groupsMap[card.meta.type]) {
      groupsMap[card.meta.type].data.push(card);
    } 
    // Priority 2: Match by suit (e.g., 'wands', 'coins')
    else if (card.meta.suit && groupsMap[card.meta.suit]) {
      groupsMap[card.meta.suit].data.push(card);
    }
  });

  // 3. Convert back to array, preserving the order defined in deck.info.groups
  return groupKeys
    .map((key) => groupsMap[key])
    .filter((group) => group.data.length > 0);
};

const DeckExplorerScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { activeDeckId } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [displayLimit, setDisplayLimit] = useState(PAGE_SIZE);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  
  const { result, isLoading, error, interpretReading } = useInterpretation();
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const prompt = t('questions:symbolism_analysis', "Analyze the visual symbolism...");

  const deck = useMemo(() => getDeck(activeDeckId), [activeDeckId]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setDisplayLimit(PAGE_SIZE); 
  };

  const sections = useMemo(() => {
    if (!deck) return [];
    
    // 1. FILTERING
    let filtered = [...deck.cards];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        t(`decks:${activeDeckId}.cards.${c.id}.name`).toLowerCase().includes(q)
      );
    }

    // 2. ORDERING
    const groupOrder = Object.keys(deck.info.groups);
    filtered.sort((a, b) => {
      const indexA = groupOrder.indexOf(a.meta.type) !== -1 ? groupOrder.indexOf(a.meta.type) : groupOrder.indexOf(a.meta?.suit ?? "none");
      const indexB = groupOrder.indexOf(b.meta.type) !== -1 ? groupOrder.indexOf(b.meta.type) : groupOrder.indexOf(b.meta?.suit ?? "none");
      return indexA - indexB;
    });

    // 3. PAGINATION
    const paginatedCards = filtered.slice(0, displayLimit);
    
    // 4. GROUPING
    return groupCards(paginatedCards, deck, t);
  }, [deck, searchQuery, activeDeckId, t, displayLimit]);

  const loadMore = useCallback(() => {
    if (deck && displayLimit < deck.cards.length) {
      setDisplayLimit(prev => prev + PAGE_SIZE);
    }
  }, [displayLimit, deck]);

  const getGroupIcon = (type: string) => {
    switch (type) {
        case 'major': return 'star-shooting-outline';
        case 'swords': return 'sword';
        case 'cups': return 'cup-water';
        case 'wands': return 'auto-fix';
        case 'pentacles': 
        case 'coins': return 'pentagram'; 
        default: return 'cards-outline';
    }
  };

  const handleAnalyzeSymbolism = () => {
    if (!selectedCard || !deck) return;
    setAiModalVisible(true);
    if (!result) {
        interpretReading(
            activeDeckId, 
            { id: 'study', slots: [{id: 'main'}] }, 
            [{ cardId: selectedCard.id, deckId: activeDeckId, positionId: 'main', isReversed: false }],
            prompt
        );
    }
  };

  if (!deck) return null;

  return (
    <ScreenContainer>
      {/* HEADER */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>{t('common:explorer', 'The Archive')}</Text>
        <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
      </View>

      <Searchbar
        placeholder={t('common:search_cards', "Search the cards...")}
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={{ fontSize: 14 }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={PAGE_SIZE}
        windowSize={PAGE_SIZE}
        removeClippedSubviews={true} 
        renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Avatar.Icon 
            size={24} 
            icon={getGroupIcon(section.type)} 
            style={{ backgroundColor: 'transparent' }} 
            color={section.color || theme.colors.primary} 
          />
          <Text 
            variant="labelLarge" 
            style={[styles.sectionHeaderText, { color: section.color || theme.colors.onSurfaceVariant }]}
          >
            {section.title.toUpperCase()}
          </Text>
        </View>
      )}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedCard(item)} activeOpacity={0.7}>
            <Surface style={styles.cardItem} elevation={1}>
               <CardImage deckId={activeDeckId} cardId={item.id} style={styles.thumbnail} />
               <View style={styles.itemInfo}>
                 <Text variant="titleMedium" style={styles.cardName}>
                    {t(`decks:${activeDeckId}.cards.${item.id}.name`)}
                 </Text>
                 <Text variant="labelSmall" style={styles.cardMeta}>
                    {item.meta.type === 'major' ? t('common:major', 'Major') : t(`common:${item.meta.suit}`, item.meta.suit)}
                 </Text>
               </View>
               <IconButton icon="chevron-right" size={20} opacity={0.3} />
            </Surface>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* MODAL CARD STUDY */}
      <Modal visible={!!selectedCard} animationType="slide" transparent>
         <View style={[styles.modalOverlay, { backgroundColor: theme.colors.background }]}>
            {selectedCard && (
                <View style={{ flex: 1 }}>
                    {/* CLOSE BUTTON */}
                    <IconButton 
                        icon="close" 
                        size={28} 
                        style={styles.closeBtn}
                        onPress={() => setSelectedCard(null)} 
                    />

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <View style={styles.imageShadowFrame}>
                            <CardImage 
                                deckId={activeDeckId} 
                                cardId={selectedCard.id} 
                                style={styles.largeImage} 
                            />
                        </View>

                        <Text variant="headlineMedium" style={styles.modalCardTitle}>
                            {t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`)}
                        </Text>
                        
                        <View style={styles.badgeRow}>
                            <View style={styles.tagBadge}>
                                <Text style={styles.tagText}>{selectedCard.meta.type.toUpperCase()}</Text>
                            </View>
                            {selectedCard.meta.suit && (
                                <View style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{selectedCard.meta.suit.toUpperCase()}</Text>
                                </View>
                            )}
                        </View>

                        <Surface style={styles.keywordsBox} elevation={0}>
                            <Text variant="bodyLarge" style={styles.keywordsText}>
                                {t(`decks:${activeDeckId}.cards.${selectedCard.id}.keywords`)}
                            </Text>
                        </Surface>
                        
                        <Button 
                            mode="contained" 
                            icon="creation" 
                            onPress={handleAnalyzeSymbolism}
                            style={styles.studyButton}
                            contentStyle={{ height: 54 }}
                        >
                            {t('common:study_symbolism', "Study Symbolism")}
                        </Button>
                        
                        <View style={styles.footerSpacing} />
                    </ScrollView>
                </View>
            )}
         </View>
      </Modal>

      <InterpretationModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        isLoading={isLoading}
        content={result}
        error={error}
        title={selectedCard ? t(`decks:${activeDeckId}.cards.${selectedCard.id}.name`) : ''}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  accentLine: {
    height: 3,
    width: 30,
    marginTop: 8,
    borderRadius: 2,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    gap: 8,
  },
  sectionHeaderText: {
    letterSpacing: 2,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  thumbnail: {
    width: 50,
    height: 85,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  cardMeta: {
    opacity: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalOverlay: {
      flex: 1,
  },
  closeBtn: {
      position: 'absolute',
      top: 40,
      left: 10,
      zIndex: 10,
  },
  modalContent: {
      paddingTop: 80,
      paddingHorizontal: 24,
      alignItems: 'center',
  },
  imageShadowFrame: {
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.6,
      shadowRadius: 20,
      marginBottom: 32,
  },
  largeImage: {
      width: width * 0.65,
      height: height * 0.5,
      borderRadius: 20,
  },
  modalCardTitle: {
      fontWeight: 'bold',
      fontFamily: 'serif',
      marginBottom: 12,
      textAlign: 'center',
  },
  badgeRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 24,
  },
  tagBadge: {
      backgroundColor: 'rgba(255,255,255,0.06)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  tagText: {
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  keywordsBox: {
      padding: 20,
      backgroundColor: 'rgba(255,255,255,0.02)',
      borderRadius: 16,
      width: '100%',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
  },
  keywordsText: {
      textAlign: 'center',
      opacity: 0.7,
      fontStyle: 'italic',
      fontFamily: 'serif',
      lineHeight: 24,
  },
  studyButton: {
      marginTop: 32,
      width: '100%',
      borderRadius: 12,
  },
  footerSpacing: {
      height: 60,
  }
});

export default DeckExplorerScreen;
import React, { useMemo, useState } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  LayoutAnimation, 
  Platform, 
  UIManager 
} from 'react-native';
import { Text, useTheme, Surface, IconButton, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../ScreenContainer';
import { CardImage } from '../../components/CardImage';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getAvailableDecks } from '../../services/deckRegistry';
import { DeckInfo } from '../../types/deck';
import { useHaptics } from '../../hooks/useHaptics';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DeckSelectionScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const haptics = useHaptics();
  
  const { activeDeckId, setActiveDeckId } = useSettingsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const decks = useMemo(() => getAvailableDecks(), []);

  const handleSelect = (id: string) => {
    setActiveDeckId(id);
    haptics.medium();
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
    haptics.light();
  };

  const renderItem = ({ item }: { item: DeckInfo }) => {
    const isActive = item.id === activeDeckId;
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.cardWrapper}>
        <Surface 
          style={[
            styles.deckCard, 
            isActive && { borderColor: theme.colors.primary, backgroundColor: 'rgba(255,255,255,0.06)' }
          ]} 
          elevation={isActive ? 4 : 1}
        >
          {/* Main Selectable Area */}
          <TouchableOpacity 
            onPress={() => handleSelect(item.id)} 
            activeOpacity={0.8}
            style={styles.cardContent}
          >
            {/* LEFT: DECK PREVIEW */}
            <View style={styles.imageFrame}>
              <CardImage 
                deckId={item.id} 
                style={styles.deckPreviewImage} 
              />
              {isActive && (
                <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]}>
                   <IconButton icon="check" size={14} iconColor="white" />
                </View>
              )}
            </View>

            {/* RIGHT: DECK DETAILS */}
            <View style={styles.infoContainer}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.deckName}>
                    {t(`decks:${item.id}.info.name`)}
                </Text>
              </View>

              <View>
                <Text 
                  variant="bodySmall" 
                  numberOfLines={isExpanded ? undefined : 2} 
                  style={styles.deckDescription}
                >
                  {t(`decks:${item.id}.info.description`)}
                </Text>
                
                {/* Expand Toggle Button */}
                <TouchableOpacity 
                  onPress={() => toggleExpand(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>
                    {isExpanded ? t('common:show_less', 'Show Less') : t('common:read_more', 'Read More')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                    <Text style={styles.metaText}>{item.totalCards} {t('common:cards', 'CARDS')}</Text>
                </View>
                <Text style={styles.authorText}>by {item.author}</Text>
              </View>
            </View>
          </TouchableOpacity>
          
          {/* DECORATIVE ACTIVE BAR */}
          {isActive && <View style={[styles.activeAccentBar, { backgroundColor: theme.colors.primary }]} />}
        </Surface>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          {t('common:select_deck', 'Choose your Deck')}
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          {t('common:deck_subtitle', 'The visual portal to your intuition')}
        </Text>
        <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
      </View>

      <FlatList
        data={decks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 2,
  },
  accentLine: {
    height: 3,
    width: 40,
    marginTop: 12,
    borderRadius: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  deckCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  imageFrame: {
    width: 75,
    height: 120,
    marginRight: 20,
    borderRadius: 8,
    backgroundColor: '#000',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    position: 'relative',
  },
  deckPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    opacity: 0.9,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deckName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  deckDescription: {
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textDecorationLine: 'underline',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 'auto', // Pushes to bottom of container
  },
  metaBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  metaText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    opacity: 0.7,
  },
  authorText: {
    fontSize: 10,
    opacity: 0.4,
    fontStyle: 'italic',
  },
  activeAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  }
});

export default DeckSelectionScreen;
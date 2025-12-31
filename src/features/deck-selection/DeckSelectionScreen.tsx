import React, { useMemo, useState } from 'react';

import {
  FlatList,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

import { useTranslation } from 'react-i18next';
import { IconButton, Text, useTheme } from 'react-native-paper';

// Components
import { CardImage } from '../../components/CardImage';
import { GlassSurface } from '../../components/GlassSurface';
// Logic
import { useHaptics } from '../../hooks/useHaptics';
import { getAvailableDecks } from '../../services/deckRegistry';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DeckInfo } from '../../types/deck';
import { ScreenContainer } from '../ScreenContainer';

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
    if (id === activeDeckId) return;
    setActiveDeckId(id);
    haptics.impact('medium');
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
    haptics.selection();
  };

  const renderItem = ({ item }: { item: DeckInfo }) => {
    const isActive = item.id === activeDeckId;
    const isExpanded = expandedId === item.id;

    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity onPress={() => handleSelect(item.id)} activeOpacity={0.9}>
          <GlassSurface
            intensity={isActive ? 40 : 15}
            style={[styles.deckCard, isActive && { borderColor: theme.colors.primary + '60' }]}
          >
            {/* Active Glow Effect */}
            {isActive && (
              <View style={[styles.activeGlow, { backgroundColor: theme.colors.primary }]} />
            )}

            <View style={styles.cardContent}>
              {/* LEFT: DECK PREVIEW (The Physical Artifact) */}
              <View style={styles.imageFrame}>
                <CardImage deckId={item.id} style={styles.deckPreviewImage} />
                {isActive && (
                  <View style={[styles.activeIndicator, { backgroundColor: theme.colors.primary }]}>
                    <IconButton icon="check" size={14} iconColor="white" />
                  </View>
                )}
              </View>

              {/* RIGHT: DECK DETAILS */}
              <View style={styles.infoContainer}>
                <Text variant="titleMedium" style={styles.deckName}>
                  {t(`decks:${item.id}.info.name`)}
                </Text>

                <View>
                  <Text
                    variant="bodySmall"
                    numberOfLines={isExpanded ? undefined : 2}
                    style={[styles.deckDescription, isExpanded && { marginBottom: 10 }]}
                  >
                    {t(`decks:${item.id}.info.description`)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => toggleExpand(item.id)}
                    style={styles.expandButton}
                  >
                    <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>
                      {isExpanded
                        ? t('common:show_less', 'Show Less').toUpperCase()
                        : t('common:read_more', 'Read More').toUpperCase()}
                    </Text>
                    <IconButton
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      style={styles.expandIcon}
                      iconColor={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <GlassSurface intensity={10} style={styles.metaBadge}>
                    <Text style={styles.metaText}>
                      {item.totalCards} {t('common:cards', 'CARDS')}
                    </Text>
                  </GlassSurface>
                  {/* <Text style={styles.authorText}>by {item.author}</Text> */}
                </View>
              </View>
            </View>
          </GlassSurface>
        </TouchableOpacity>
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
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 26,
  },
  headerSubtitle: {
    opacity: 0.5,
    fontStyle: 'italic',
    marginTop: 4,
    fontSize: 13,
  },
  accentLine: {
    height: 1,
    width: 50,
    marginTop: 16,
    opacity: 0.4,
  },
  listContent: {
    paddingBottom: 60,
    paddingHorizontal: 16,
  },
  cardWrapper: {
    marginBottom: 20,
  },
  deckCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  activeGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.15, // Subtle primary color glow
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  imageFrame: {
    width: 85,
    height: 140,
    marginRight: 20,
    borderRadius: 12,
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    position: 'relative',
  },
  deckPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  activeIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(18, 18, 18, 0.8)',
    zIndex: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  deckName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 6,
  },
  deckDescription: {
    opacity: 0.7,
    lineHeight: 18,
    fontSize: 13,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: -4,
  },
  readMoreText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  expandIcon: {
    margin: 0,
    padding: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  metaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  metaText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.8,
  },
  authorText: {
    fontSize: 11,
    opacity: 0.4,
    fontStyle: 'italic',
  },
});

export default DeckSelectionScreen;

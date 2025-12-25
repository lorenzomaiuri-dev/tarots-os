import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CardFlip } from './CardFlip';
import { Spread, DrawnCard } from '../types/reading';
import { useTranslation } from 'react-i18next';

// Configuration for visual sizing
const CARD_WIDTH = 100;
const CARD_HEIGHT = 160;
const GUTTER = 20;

interface Props {
  spread: Spread;
  deckId: string;
  drawnCards: DrawnCard[];
  onSlotPress: (slotId: string) => void;
}

export const SpreadVisualizer: React.FC<Props> = ({ 
  spread, 
  deckId, 
  drawnCards, 
  onSlotPress 
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // 1. Calculate Canvas Size
  // We need to know the max X and Y to set the container size
  let maxX = 0;
  let maxY = 0;

  spread.slots.forEach(slot => {
    if (slot.layout) {
      if (slot.layout.x > maxX) maxX = slot.layout.x;
      if (slot.layout.y > maxY) maxY = slot.layout.y;
    }
  });

  const canvasWidth = (maxX + 1) * (CARD_WIDTH + GUTTER) + GUTTER * 2;
  const canvasHeight = (maxY + 1) * (CARD_HEIGHT + GUTTER) + GUTTER * 2;

  return (
    <ScrollView 
      horizontal 
      contentContainerStyle={{ width: Math.max(canvasWidth, 400) }}
      showsHorizontalScrollIndicator={false}
    >
      <ScrollView contentContainerStyle={{ height: Math.max(canvasHeight, 500) }}>
        <View style={[styles.tableMat, { width: canvasWidth, height: canvasHeight }]}>
          
          {spread.slots.map((slot, index) => {
            const layout = slot.layout || { x: 0, y: 0 };
            const drawn = drawnCards.find(c => c.positionId === slot.id);
            
            // Calculate absolute position
            const top = layout.y * (CARD_HEIGHT + GUTTER) + GUTTER;
            const left = layout.x * (CARD_WIDTH + GUTTER) + GUTTER;

            // Handle rotation (e.g., Celtic Cross crossing card)
            const rotation = layout.rotation || 0;
            const isRotated = rotation !== 0;

            // Z-Index: ensure crossing cards (usually higher index) are on top
            const zIndex = (layout.zIndex ?? index) + 10;

            return (
              <View 
                key={slot.id} 
                pointerEvents="box-none" // Allows tapping cards underneath
                style={[
                  styles.slotContainer, 
                  { top, left, width: CARD_WIDTH, height: CARD_HEIGHT, zIndex }
                ]}
              >
                {/* 
                  LABEL POSITIONING:
                  If the card is rotated (crossing), move the label to the side 
                  so it doesn't overlap the vertical card's label.
                */}
                {!drawn && (
                  <View 
                    pointerEvents="none"
                    style={[
                      styles.labelPill, 
                      { backgroundColor: theme.colors.surfaceVariant },
                      isRotated ? styles.labelRotated : styles.labelStandard
                    ]}
                  >
                    <Text 
                      variant="labelSmall" 
                      style={{ color: theme.colors.onSurfaceVariant, fontSize: 9, textAlign: 'center' }}
                      numberOfLines={2}
                    >
                      {t(`spreads:${spread.id}.positions.${slot.id}.label`)}
                    </Text>
                  </View>
                )}

                <TouchableOpacity 
                    onPress={() => onSlotPress(slot.id)}
                    activeOpacity={0.9}
                    // Rotate the touchable itself so the hitbox matches the visual
                    style={{ transform: [{ rotate: `${rotation}deg` }] }}
                >
                    <View style={styles.cardPlaceholder}>
                        <CardFlip
                            deckId={deckId}
                            cardId={drawn?.cardId || null}
                            isReversed={drawn?.isReversed}
                            onFlip={() => onSlotPress(slot.id)}
                            width={CARD_WIDTH}
                            height={CARD_HEIGHT}
                        />
                    </View>
                </TouchableOpacity>

                {/* 
                  BADGE POSITIONING:
                  If rotated, move badge to the top-right instead of bottom-right
                */}
                <View 
                  pointerEvents="none"
                  style={[
                    styles.badge, 
                    { 
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.surface,
                    },
                    isRotated ? { top: -5, right: -5 } : { bottom: -5, right: -5 }
                  ]}
                >
                  <Text style={{ fontSize: 10, color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                    {index + 1}
                  </Text>
                </View>

              </View>
            );
          })}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tableMat: {
    position: 'relative',
  },
  slotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholder: {
    borderRadius: 8,
  },
  labelPill: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 50,
    elevation: 3,
    maxWidth: 90,
  },
  labelStandard: {
    top: -25,
    alignSelf: 'center',
  },
  labelRotated: {
    left: CARD_WIDTH - 20, // Push to the right side
    top: CARD_HEIGHT / 2 - 10,
  },
  badge: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 60,
    elevation: 4,
  }
});
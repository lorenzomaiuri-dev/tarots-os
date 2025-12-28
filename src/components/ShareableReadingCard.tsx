import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { Text } from 'react-native-paper';

import spreadsData from '../data/spreads.json';
import { DrawnCard, Spread } from '../types/reading';
import { CardImage } from './CardImage';

const CANVAS_SIZE = 1080;

// Layout Configuration
const HEADER_HEIGHT = 260;
const FOOTER_HEIGHT = 120;
const HORIZONTAL_PADDING = 80;

// Safe Area
const SAFE_WIDTH = CANVAS_SIZE - HORIZONTAL_PADDING * 2;
const SAFE_HEIGHT = CANVAS_SIZE - HEADER_HEIGHT - FOOTER_HEIGHT;

interface Props {
  reading: { spreadId: string; deckId: string; cards: DrawnCard[]; timestamp: number };
  t: any;
}

export const ShareableReadingCard = React.forwardRef<View, Props>(({ reading, t }, ref) => {
  const spread = useMemo<Spread | undefined>(
    () => spreadsData.find((s) => s.id === reading.spreadId),
    [reading.spreadId]
  );

  // 1. Metrics Calculation
  const layoutMetrics = useMemo(() => {
    if (!spread) return { minX: 0, minY: 0, spanX: 1, spanY: 1 };

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    spread.slots.forEach((slot) => {
      const lx = slot.layout?.x || 0;
      const ly = slot.layout?.y || 0;
      if (lx < minX) minX = lx;
      if (ly < minY) minY = ly;
      if (lx > maxX) maxX = lx;
      if (ly > maxY) maxY = ly;
    });

    return {
      minX,
      minY,
      spanX: maxX - minX,
      spanY: maxY - minY,
    };
  }, [spread]);

  const dateStr = new Date(reading.timestamp)
    .toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();

  if (!spread) return null;

  // 2. Dynamic Scaling Logic
  const BASE_CARD_W = 180;
  const BASE_CARD_H = 300;

  // Calculate required space including buffers for labels (+100px vertical)
  const requiredWidth = layoutMetrics.spanX * (BASE_CARD_W + 40) + BASE_CARD_W;
  const requiredHeight = layoutMetrics.spanY * (BASE_CARD_H + 40) + BASE_CARD_H + 100;

  const scaleX = SAFE_WIDTH / Math.max(requiredWidth, 1);
  const scaleY = SAFE_HEIGHT / Math.max(requiredHeight, 1);

  // Cap scaling at 1.2 so cards don't look comically large on simple spreads
  const finalScale = Math.min(scaleX, scaleY, 1.2);

  const cardW = BASE_CARD_W * finalScale;
  const cardH = BASE_CARD_H * finalScale;

  // Calculate Grid Steps
  const stepX =
    layoutMetrics.spanX === 0 ? 0 : (requiredWidth * finalScale - cardW) / layoutMetrics.spanX;
  const stepY =
    layoutMetrics.spanY === 0
      ? 0
      : (requiredHeight * finalScale - cardH - 100 * finalScale) / layoutMetrics.spanY;

  // 3. Centering Offsets
  const totalSpreadW = layoutMetrics.spanX * stepX + cardW;
  const totalSpreadH = layoutMetrics.spanY * stepY + cardH;

  const offsetX = (CANVAS_SIZE - totalSpreadW) / 2;
  const offsetY = HEADER_HEIGHT + (SAFE_HEIGHT - totalSpreadH) / 2;

  return (
    <View ref={ref} style={styles.canvas} collapsable={false}>
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        <Text style={styles.date}>{dateStr}</Text>
        <Text style={styles.spreadName} numberOfLines={2}>
          {t(`spreads:${reading.spreadId}.name`)}
        </Text>
        <View style={styles.divider} />
      </View>

      {/* SPREAD AREA */}
      <View style={styles.layoutContainer}>
        {spread.slots.map((slot, index) => {
          const drawn = reading.cards.find((c) => c.positionId === slot.id);
          const lx = slot.layout?.x || 0;
          const ly = slot.layout?.y || 0;
          const rotation = slot.layout?.rotation || 0;
          const isRotated = rotation !== 0;

          const top =
            (ly - layoutMetrics.minY) * stepY + offsetY + (isRotated ? 20 * finalScale : 0);
          const left = (lx - layoutMetrics.minX) * stepX + offsetX;

          return (
            <View
              key={slot.id}
              style={[
                styles.slotContainer,
                { top, left, width: cardW, height: cardH, zIndex: slot.layout?.zIndex || index },
              ]}
            >
              {/* CARD (Rendered First = Bottom Layer) */}
              <View style={[styles.cardShadow, { transform: [{ rotate: `${rotation}deg` }] }]}>
                {drawn ? (
                  <CardImage
                    deckId={reading.deckId}
                    cardId={drawn.cardId}
                    style={[
                      styles.cardImage,
                      { width: cardW, height: cardH, borderRadius: 12 * finalScale },
                      drawn.isReversed && { transform: [{ rotate: '180deg' }] },
                    ]}
                  />
                ) : (
                  <View style={[styles.emptySlot, { width: cardW, height: cardH }]} />
                )}
              </View>

              {/* LABEL PILL (Rendered Second = Top Layer) */}
              <View
                style={[
                  styles.labelPill,
                  isRotated
                    ? { left: cardW - 20 * finalScale, top: -(20 * finalScale) }
                    : { top: -(40 * finalScale), alignSelf: 'center' },
                ]}
              >
                <Text style={[styles.labelText, { fontSize: 12 * finalScale }]}>
                  {t(`spreads:${reading.spreadId}.positions.${slot.id}.label`).toUpperCase()}
                </Text>
              </View>

              {/* BADGE (Top Layer) */}
              <View
                style={[
                  styles.badge,
                  {
                    width: 36 * finalScale,
                    height: 36 * finalScale,
                    borderRadius: 18 * finalScale,
                    bottom: -(10 * finalScale),
                    right: -(10 * finalScale),
                  },
                ]}
              >
                <Text style={[styles.badgeText, { fontSize: 16 * finalScale }]}>{index + 1}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* FOOTER */}
      <View style={[styles.footer, { height: FOOTER_HEIGHT }]}>
        <Text style={styles.brand}>{t('common:app_footer', 'CHRONICLED BY TAROTS OS')}</Text>
      </View>
    </View>
  );
});

ShareableReadingCard.displayName = 'ShareableReadingCard';

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#000',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 60,
  },
  date: {
    color: '#D0BCFF',
    fontSize: 22,
    letterSpacing: 5,
    fontWeight: '900',
    marginBottom: 10,
  },
  spreadName: {
    color: '#FFF',
    fontSize: 50,
    fontFamily: 'serif',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  divider: {
    width: 80,
    height: 3,
    backgroundColor: '#D0BCFF',
    marginTop: 25,
    opacity: 0.6,
  },
  layoutContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  slotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 20,
  },
  cardImage: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  emptySlot: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  labelPill: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    zIndex: 100,
    elevation: 30,
    minWidth: 80,
    alignItems: 'center',
  },
  labelText: {
    color: '#D0BCFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#302b63',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    zIndex: 101,
    elevation: 35,
  },
  badgeText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    color: '#FFF',
    fontSize: 14,
    letterSpacing: 4,
    opacity: 0.4,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { CardImage } from './CardImage';

interface Props {
  deckId: string;
  cardId: string | null; // Null = mostriamo il retro
  isReversed?: boolean;  // Se la carta è al rovescio
  onFlip?: () => void;   // Callback quando l'utente tocca per girare
  style?: ViewStyle;
  width?: number;
  height?: number;
}

export const CardFlip: React.FC<Props> = ({ 
  deckId, 
  cardId, 
  isReversed = false, 
  onFlip, 
  style,
  width = 200, 
  height = 340 
}) => {
  // 0 = Back, 180 = Front
  const animatedValue = useRef(new Animated.Value(0)).current;

  // If cardId 180 (Front)
  // If not 0 (Back)
  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: cardId ? 180 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
  }, [cardId]);

  // Front Interpolation (visible from 90 to 270)
  const frontAnimatedStyle = {
    transform: [
      { rotateY: animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
      })},
      // Reverse
      { rotateZ: isReversed ? '180deg' : '0deg' }
    ],
    opacity: animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [0, 1], // Half visible
    })
  };

  // Back Interpolation (visible from 0 to 90)
  const backAnimatedStyle = {
    transform: [
      { rotateY: animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
      })}
    ],
    opacity: animatedValue.interpolate({
        inputRange: [89, 90],
        outputRange: [1, 0], // Half invisible
    })
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={onFlip} 
      disabled={!!cardId} // Disable click on flipped card
      style={[style, { width, height }]}
    >
      <View style={styles.container}>
        {/* BACK */}
        <Animated.View style={[styles.cardFace, backAnimatedStyle]}>
          <CardImage deckId={deckId} style={styles.image} />
        </Animated.View>

        {/* FRONT (Card Image) */}
        <Animated.View style={[styles.cardFace, frontAnimatedStyle]}>
          {cardId && (
            <CardImage deckId={deckId} cardId={cardId} style={styles.image} />
          )}
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  }
});
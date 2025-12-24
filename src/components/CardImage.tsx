import React from 'react';
import { Image, ImageStyle, View } from 'react-native';
import { getCardImageSource, getCardBackImage } from '../services/deckRegistry';

interface Props {
  deckId: string;
  cardId?: string; // If null, shows back of card
  style?: ImageStyle;
}

export const CardImage: React.FC<Props> = ({ deckId, cardId, style }) => {
  const source = cardId 
    ? getCardImageSource(deckId, cardId) 
    : getCardBackImage(deckId);

  // Fallback if image not found (shouldn't happen with generated script)
  if (!source) {
    return <View style={[style, { backgroundColor: '#333' }]} />;
  }

  return (
    <Image 
      source={source} 
      style={style} 
      resizeMode="contain" 
    />
  );
};
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import spreadsData from '../../data/spreads.json';
import { Spread } from '../../types/reading';

const SpreadSelectionScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const selectableSpreads = useMemo(() => {
    return spreadsData.filter(s => s.id !== 'daily');
  }, []);

  const handleSelect = (spread: Spread) => {
    navigation.navigate('ReadingTable', { spreadId: spread.id });
  };

  const renderItem = ({ item }: { item: Spread }) => {
    return (
      <TouchableOpacity 
        onPress={() => handleSelect(item)} 
        activeOpacity={0.7}
        style={styles.cardContainer}
      >
        <Surface style={styles.surface} elevation={1}>
          <View style={styles.contentRow}>
            {/* LEFT: ICON/ILLUSTRATION */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryContainer }]}>
              <IconButton 
                icon={item.icon || 'cards-playing-outline'} 
                size={28} 
                iconColor={theme.colors.onPrimaryContainer}
              />
            </View>

            {/* MIDDLE: TEXT INFO */}
            <View style={styles.textContainer}>
              <Text variant="titleMedium" style={styles.spreadName}>
                {t(`spreads:${item.id}.name`, item.id)}
              </Text>
              <Text variant="bodySmall" numberOfLines={2} style={styles.spreadDesc}>
                {t(`spreads:${item.id}.description`)}
              </Text>
            </View>

            {/* RIGHT: CARD COUNT BADGE */}
            <View style={styles.badgeContainer}>
               <View style={[styles.countBadge, { borderColor: theme.colors.outlineVariant }]}>
                  <Text style={styles.countText}>{item.slots.length}</Text>
                  <Text style={styles.cardsLabel}>{t('common:cards', 'cards').toUpperCase()}</Text>
               </View>
            </View>
          </View>
          
          {/* DECORATIVE BOTTOM LINE */}
          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.headerContainer}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          {t('common:select_spread', 'Choose your Spread')}
        </Text>
        <View style={[styles.headerDivider, { backgroundColor: theme.colors.primary }]} />
      </View>
      
      <FlatList
        data={selectableSpreads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerDivider: {
    height: 3,
    width: 40,
    marginTop: 8,
    borderRadius: 2,
  },
  listPadding: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 16,
  },
  surface: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  spreadName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  spreadDesc: {
    opacity: 0.6,
    lineHeight: 16,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  countText: {
    fontWeight: '900',
    fontSize: 16,
  },
  cardsLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    opacity: 0.5,
    marginTop: -2,
  },
  accentLine: {
    height: 2,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  }
});

export default SpreadSelectionScreen;
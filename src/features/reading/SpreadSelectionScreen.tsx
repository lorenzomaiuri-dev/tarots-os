import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Card, Avatar, useTheme } from 'react-native-paper';
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

  const handleSelect = (spread: Spread) => {
    navigation.navigate('ReadingTable', { spreadId: spread.id });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity onPress={() => handleSelect(item)} activeOpacity={0.8}>
        <Card style={styles.card}>
          <Card.Title
            title={t(`spreads:${item.id}.name`, item.id)} // Fallback to ID
            subtitle={t(`spreads:${item.id}.description`, `${item.slots.length} cards`)}
            left={(props) => (
              <Avatar.Icon 
                {...props} 
                icon={item.icon || 'cards'} 
                style={{ backgroundColor: theme.colors.primaryContainer }} 
                color={theme.colors.onPrimaryContainer}
              />
            )}
            right={(props) => (
              <View {...props} style={styles.countBadge}>
                <Text style={{ fontWeight: 'bold' }}>{item.slots.length}</Text>
              </View>
            )}
          />
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <Text variant="titleMedium" style={styles.header}>
        {t('common:select_spread', 'Select Spread Method')}
      </Text>
      
      <FlatList
        data={spreadsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    marginBottom: 8,
    opacity: 0.7
  },
  card: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  countBadge: {
    marginRight: 16,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    minWidth: 30,
    alignItems: 'center',
  }
});

export default SpreadSelectionScreen;
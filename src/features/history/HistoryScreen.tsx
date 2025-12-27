import React, { useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, useTheme, Searchbar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

import { RootStackParamList } from '../../types/navigation';
import { ScreenContainer } from '../ScreenContainer';
import { useHistoryStore } from '../../store/useHistoryStore';
import { ReadingSession } from '../../types/reading';

const HistoryScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { readings, deleteReading } = useHistoryStore();

  const dynamicCardStyle = {
    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    borderColor: theme.dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
  };

  const filteredReadings = useMemo(() => {
    let result = [...readings].sort((a, b) => b.timestamp - a.timestamp);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => {
        const spreadName = t(`spreads:${r.spreadId}.name`).toLowerCase();
        return spreadName.includes(q) || r.userNotes?.toLowerCase().includes(q);
      });
    }
    return result;
  }, [readings, searchQuery, t]);

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common:delete_reading', 'Elimina Lettura'),
      t('common:confirm_delete', 'Vuoi rimuovere questo ricordo dalle tue cronache?'),
      [
        { text: t('common:cancel', 'Annulla'), style: 'cancel' },
        { 
          text: t('common:delete', 'Elimina'), 
          style: 'destructive', 
          onPress: () => deleteReading(id) 
        }
      ]
    );
  };

  const renderRightActions = (id: string) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => handleDelete(id)}
        activeOpacity={0.6}
      >
        <Avatar.Icon 
          size={44} 
          icon="trash-can-outline" 
          style={{ backgroundColor: theme.colors.errorContainer }} 
          color={theme.colors.error} 
        />
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: ReadingSession }) => {
    const dateObj = new Date(item.timestamp);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();

    return (
      <View style={styles.cardWrapper}>
        <Swipeable 
          renderRightActions={() => renderRightActions(item.id)}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity 
            onPress={() => navigation.navigate('ReadingDetail', { readingId: item.id })}
            activeOpacity={0.7}
          >
            <Surface style={[styles.journalCard, dynamicCardStyle]} elevation={0}>
              <View style={styles.dateSide}>
                <Text style={[styles.dateDay, { color: theme.colors.primary }]}>{day}</Text>
                <Text style={styles.dateMonth}>{month}</Text>
              </View>

              <View style={styles.contentMain}>
                <Text variant="labelSmall" style={[styles.deckName, { color: theme.colors.secondary }]}>
                  {t(`decks:${item.deckId}.info.name`)}
                </Text>
                <Text variant="titleMedium" style={styles.spreadTitle}>
                  {t(`spreads:${item.spreadId}.name`)}
                </Text>
                
                <View style={styles.badgeRow}>
                  <View style={[styles.miniBadge, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                     <Text style={styles.miniBadgeText}>{item.cards.length} {t('common:cards', 'CARDS')}</Text>
                  </View>
                  {item.aiInterpretation && (
                    <View style={[styles.miniBadge, { backgroundColor: theme.colors.primaryContainer }]}>
                      <Text style={[styles.miniBadgeText, { color: theme.colors.onPrimaryContainer }]}>AI SPIRIT</Text>
                    </View>
                  )}
                </View>
              </View>
            </Surface>
          </TouchableOpacity>
        </Swipeable>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenContainer>
        <FlatList
          data={filteredReadings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.headerContainer}>
                <Text variant="headlineMedium" style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
                  {t('common:journal_title', 'Chronicles')}
                </Text>
                <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
              </View>

              <Searchbar
                placeholder={t('common:search_journal', 'Search destiny...')}
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                mode="bar"
                elevation={0}
              />

              <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.primary }]}>
                {t('common:past_readings', 'RECENT MEMORIES')}
              </Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={{ opacity: 0.5 }}>{t('common:no_history_yet', 'No memories recorded yet...')}</Text>
            </View>
          }
          contentContainerStyle={styles.listPadding}
        />
      </ScreenContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  listPadding: {
    paddingBottom: 40,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  pageTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  accentLine: {
    height: 3,
    width: 30,
    marginTop: 8,
    borderRadius: 2,
  },
  sectionLabel: {
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    opacity: 0.8,
  },
  searchBar: {
    marginBottom: 32,
    backgroundColor: 'rgba(128, 128, 128, 0.08)',
    borderRadius: 16,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  journalCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 100,
  },
  dateSide: {
    width: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(128, 128, 128, 0.1)',
  },
  dateDay: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.5,
  },
  contentMain: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  deckName: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  spreadTitle: {
    fontFamily: 'serif',
    fontWeight: '600',
    fontSize: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    opacity: 0.7,
  },
  deleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  }
});

export default HistoryScreen;
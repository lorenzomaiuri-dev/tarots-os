import React, { useMemo, useState } from 'react';
import { FlatList, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Surface, IconButton, useTheme, Searchbar, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

  const filteredReadings = useMemo(() => {
    let result = [...readings].sort((a, b) => b.timestamp - a.timestamp);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => {
        const spreadName = t(`spreads:${r.spreadId}.name`).toLowerCase();
        const notesMatch = r.userNotes?.toLowerCase().includes(q);
        const aiMatch = r.aiInterpretation?.toLowerCase().includes(q);
        return spreadName.includes(q) || notesMatch || aiMatch;
      });
    }
    return result;
  }, [readings, searchQuery, t]);

  const handleDelete = (id: string) => {
    Alert.alert(
      t('common:delete_reading', 'Delete Reading'),
      t('common:confirm_delete', 'Do you wish to remove this memory from your history?'),
      [
        { text: t('common:cancel', 'Keep'), style: 'cancel' },
        { text: t('common:delete', 'Remove'), style: 'destructive', onPress: () => deleteReading(id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: ReadingSession }) => {
    const dateObj = new Date(item.timestamp);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString(undefined, { month: 'short' }).toUpperCase();
    const year = dateObj.getFullYear();

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ReadingDetail', { readingId: item.id })}
        activeOpacity={0.8}
        style={styles.cardWrapper}
      >
        <Surface style={styles.journalCard} elevation={1}>
          {/* DATE COLUMN */}
          <View style={styles.dateColumn}>
            <Text style={[styles.dateDay, { color: theme.colors.primary }]}>{day}</Text>
            <Text style={styles.dateMonth}>{month}</Text>
            <View style={[styles.dateDivider, { backgroundColor: theme.colors.outlineVariant }]} />
            <Text style={styles.dateYear}>{year}</Text>
          </View>

          {/* CONTENT COLUMN */}
          <View style={styles.contentColumn}>
            <Text variant="labelSmall" style={[styles.deckLabel, { color: theme.colors.secondary }]}>
              {t(`decks:${item.deckId}.info.name`)}
            </Text>
            <Text variant="titleMedium" style={styles.spreadName}>
              {t(`spreads:${item.spreadId}.name`)}
            </Text>
            
            <View style={styles.metadataRow}>
              <View style={styles.tag}>
                <IconButton icon="cards-outline" size={12} style={styles.tagIcon} />
                <Text style={styles.tagText}>{item.cards.length} {t('common:cards', 'Cards')}</Text>
              </View>
              {item.aiInterpretation && (
                <View style={styles.tag}>
                  <IconButton icon="creation" size={12} style={styles.tagIcon} />
                  <Text style={styles.tagText}>AI</Text>
                </View>
              )}
            </View>
          </View>

          {/* ACTION COLUMN */}
          <View style={styles.actionColumn}>
            <IconButton 
              icon="chevron-right" 
              size={20} 
              onPress={() => navigation.navigate('ReadingDetail', { readingId: item.id })} 
            />
            <IconButton 
              icon="delete-outline" 
              size={18} 
              iconColor={theme.colors.error}
              onPress={() => handleDelete(item.id)} 
              style={{ opacity: 0.4 }}
            />
          </View>
          
          <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />
        </Surface>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            {t('common:journal_title', 'Your Journal')}
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            {readings.length} {t('common:total_readings', 'readings recorded')}
          </Text>
        </View>
        <IconButton 
          icon="chart-bell-curve-cumulative" 
          onPress={() => navigation.navigate('Stats')} 
          mode="contained-tonal"
          size={24}
        />
      </View>      

      {/* SEARCH */}
      <Searchbar
        placeholder={t('common:search_journal', 'Search your destiny...')}
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        iconColor={theme.colors.primary}
      />

      {/* LIST */}
      {readings.length === 0 ? (
        <View style={styles.emptyState}>
          <Avatar.Icon size={80} icon="book-outline" style={{ backgroundColor: 'transparent', opacity: 0.2 }} />
          <Text variant="titleMedium" style={styles.emptyText}>
            {t('common:no_history_yet', 'Your story hasn’t begun...')}
          </Text>
          <Text style={styles.emptySubtext}>
            {t('common:draw_to_start', 'Perform your first reading to see it here.')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredReadings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  searchBar: {
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 16,
  },
  journalCard: {
    borderRadius: 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  dateColumn: {
    width: 65,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dateDay: {
    fontSize: 22,
    fontWeight: '900',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  dateDivider: {
    height: 1,
    width: 20,
    marginVertical: 4,
    opacity: 0.3,
  },
  dateYear: {
    fontSize: 10,
    opacity: 0.4,
  },
  contentColumn: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  deckLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  spreadName: {
    fontFamily: 'serif',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    paddingRight: 8,
    height: 22,
  },
  tagIcon: {
    margin: -8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.7,
  },
  actionColumn: {
    paddingVertical: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'serif',
    textAlign: 'center',
    marginTop: 10,
  },
  emptySubtext: {
    textAlign: 'center',
    opacity: 0.5,
    marginTop: 8,
    fontSize: 13,
  }
});

export default HistoryScreen;
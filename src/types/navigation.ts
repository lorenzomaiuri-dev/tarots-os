import HomeScreen from '../features/home/HomeScreen';
import DeckSelectionScreen from '../features/deck-selection/DeckSelectionScreen';
import SettingsScreen from '../features/settings/SettingsScreen';
import SpreadSelectionScreen from '../features/reading/SpreadSelectionScreen';
import ReadingTableScreen from '../features/reading/ReadingTableScreen';

export type RootStackParamList = {
  Home: undefined;
  DeckSelection: undefined;
  ReadingTable: { spreadId: string };
  SpreadSelection: undefined;
  Settings: undefined;
};
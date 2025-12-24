export type BottomTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen: string };
  Home: undefined;
  DeckSelection: undefined;
  ReadingTable: { spreadId: string };
  SpreadSelection: undefined;
  ReadingDetail: { readingId: string };
  Settings: undefined;
};
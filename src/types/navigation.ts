export type BottomTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen: string };
  Home: undefined;
  DeckSelection: undefined;
  DeckExplorer: undefined;
  ReadingTable: { spreadId: string; customQuestion?: string };
  SpreadSelection: undefined;
  ReadingDetail: { readingId: string };
  Stats: undefined;
  Settings: undefined;
  Onboarding: undefined;
};
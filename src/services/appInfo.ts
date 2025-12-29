import { Platform } from 'react-native';

import Constants from 'expo-constants';

export interface ChangelogEntry {
  version: string;
  date?: string;
  changes: string[];
}

const CHANGELOG_URL =
  'https://raw.githubusercontent.com/lorenzomaiuri-dev/tarots-os/main/changelog.json';

// Fallback data if the network fails
const STATIC_CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.0.0',
    changes: ['Initial release', 'Glassmorphism UI', 'AI Interpretation'],
  },
];

let cachedChangelog: ChangelogEntry[] | null = null;

export const AppInfoService = {
  getVersion: (): string => Constants.expoConfig?.version || '1.0.0',

  getBuildNumber: (): string | number =>
    Platform.select({
      ios: Constants.expoConfig?.ios?.buildNumber || 1,
      android: Constants.expoConfig?.android?.versionCode || 1,
      default: 1,
    }),

  getFullVersionString: (): string => {
    return `v${AppInfoService.getVersion()} (${AppInfoService.getBuildNumber()})`;
  },

  /**
   * Fetches the changelog from a remote source with local caching.
   * Follows the "Stale-While-Revalidate" or "Fallback" pattern.
   */
  getChangelog: async (): Promise<ChangelogEntry[]> => {
    if (cachedChangelog) return cachedChangelog;

    try {
      const response = await fetch(CHANGELOG_URL, {
        headers: { 'Cache-Control': 'no-cache' },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      cachedChangelog = data;
      return data;
    } catch (error) {
      console.warn('AppInfoService: Failed to fetch remote changelog, using static data.', error);
      return STATIC_CHANGELOG;
    }
  },
};

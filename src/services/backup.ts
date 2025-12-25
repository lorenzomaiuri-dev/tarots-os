import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

export const BackupService = {
  /**
   * Exports an object to a JSON file and opens the native share dialog
   */
  exportJson: async (data: object, filename: string = 'backup.json') => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const backupFile = new File(Paths.cache, filename);

      // Clean up existing file if it exists
      if (backupFile.exists) {
        backupFile.delete();
      }

      backupFile.create();
      backupFile.write(jsonString);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup',
          UTI: 'public.json',
        });
        return true;
      } else {
        throw new Error('Sharing is not available on this device');
      }
    } catch (error) {
      console.error('BackupService Export Error:', error);
      throw error;
    }
  },

  /**
   * Opens document picker and returns the parsed JSON content
   */
  importJson: async <T>(): Promise<T | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.canceled) return null;

      const pickedFile = new File(result.assets[0].uri);
      const content = pickedFile.textSync();
      
      return JSON.parse(content) as T;
    } catch (error) {
      console.error('BackupService Import Error:', error);
      throw error;
    }
  },
};
import { MMKV } from 'react-native-mmkv';
import { STORAGE_KEYS } from "../constants";

// storage
export const storage = new MMKV();

// Wrapper to save JSON with typing
export const StorageService = {
  getString: (key: string) => storage.getString(key),
  
  setString: (key: string, value: string) => storage.set(key, value),
  
  getNumber: (key: string) => storage.getNumber(key),
  
  setNumber: (key: string, value: number) => storage.set(key, value),
  
  getBoolean: (key: string) => storage.getBoolean(key),
  
  setBoolean: (key: string, value: boolean) => storage.set(key, value),

  // Helper
  getItem: <T>(key: string): T | null => {
    const value = storage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`Errore parsing storage key: ${key}`, e);
      return null;
    }
  },

  setItem: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },

  delete: (key: string) => storage.delete(key),
  
  clearAll: () => storage.clearAll(),
};
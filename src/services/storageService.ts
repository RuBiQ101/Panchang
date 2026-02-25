import { calculatePanchang, PanchangData } from './panchangService';

const STORAGE_KEY = 'siddhidatri_offline_data';

export interface OfflineCache {
  [dateKey: string]: PanchangData;
}

export const storageService = {
  savePanchangData: (date: Date, data: PanchangData) => {
    const key = date.toISOString().split('T')[0];
    const existing = storageService.getAllCached();
    existing[key] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  },

  getCachedPanchang: (date: Date): PanchangData | null => {
    const key = date.toISOString().split('T')[0];
    const all = storageService.getAllCached();
    return all[key] || null;
  },

  getAllCached: (): OfflineCache => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  downloadMonth: (year: number, month: number, lat: number, lon: number, elevation: number) => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const data = calculatePanchang(new Date(d), lat, lon, elevation);
      storageService.savePanchangData(new Date(d), data);
    }
  },

  clearCache: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};


import { GarbageReport, TrashType, TrashSeverity } from '../types';

const STORAGE_KEY = 'prakriti_darpan_reports_v1';

export const getReports = (): GarbageReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load reports", e);
    return [];
  }
};

export const getReportById = (id: string): GarbageReport | undefined => {
  const reports = getReports();
  return reports.find(r => r.id === id);
};

export const saveReport = (report: GarbageReport): void => {
  try {
    const reports = getReports();
    const newReports = [report, ...reports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
  } catch (e: any) {
    // Handle Storage Quota Exceeded
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn("Storage full. Attempting to free space by removing old records.");
      
      const reports = getReports();
      // If we have records, try to remove the oldest ones (last in the array)
      if (reports.length > 0) {
        // Keep the newest 75% or at least remove 1
        const keepCount = Math.max(Math.floor(reports.length * 0.75), 0);
        // Ensure we actually remove something if keepCount equals length (e.g. length 1)
        const effectiveKeepCount = keepCount === reports.length ? reports.length - 1 : keepCount;
        
        const trimmedReports = reports.slice(0, effectiveKeepCount);
        const finalReports = [report, ...trimmedReports];
        
        try {
           localStorage.setItem(STORAGE_KEY, JSON.stringify(finalReports));
           return; // Success after trim
        } catch (retryError) {
           console.error("Still failed to save after trimming", retryError);
           throw new Error("Storage is full and could not be cleared.");
        }
      }
    }
    console.error("Failed to save report", e);
    throw e;
  }
};

export const updateReport = (updatedReport: GarbageReport): void => {
  const reports = getReports();
  const index = reports.findIndex(r => r.id === updatedReport.id);
  if (index !== -1) {
    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

export const deleteReport = (id: string): void => {
    const reports = getReports();
    const newReports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
};

export const clearReports = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Seed some data for visualization purposes if empty
export const seedDemoData = (): void => {
  try {
    if (getReports().length > 0) return;

    const demoData: GarbageReport[] = [
      {
        id: '1',
        timestamp: Date.now() - 10000000,
        imageUrl: 'https://picsum.photos/400/300?random=1',
        locationName: 'Beniya Bagh Park',
        latitude: 25.3176,
        longitude: 83.0062,
        trashType: TrashType.PLASTIC,
        severity: TrashSeverity.MEDIUM,
        description: 'Plastic bottles scattered near the bench.'
      },
      {
        id: '2',
        timestamp: Date.now() - 8000000,
        imageUrl: 'https://picsum.photos/400/300?random=2',
        locationName: 'Godowlia Market',
        latitude: 25.3109,
        longitude: 83.0107,
        trashType: TrashType.MIXED,
        severity: TrashSeverity.HIGH,
        description: 'Overflowing dumpster in the alley.'
      },
      {
        id: '3',
        timestamp: Date.now() - 600000,
        imageUrl: 'https://picsum.photos/400/300?random=3',
        locationName: 'Beniya Bagh Park',
        latitude: 25.3176,
        longitude: 83.0062,
        trashType: TrashType.PAPER,
        severity: TrashSeverity.LOW,
        description: 'Newspapers left on the grass.'
      }
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
  } catch (e) {
    console.error("Failed to seed demo data", e);
  }
};

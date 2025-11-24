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
  const reports = getReports();
  const newReports = [report, ...reports];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
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
    },
    {
      id: '4',
      timestamp: Date.now() - 200000,
      imageUrl: 'https://picsum.photos/400/300?random=4',
      locationName: 'Assi Ghat',
      latitude: 25.2952,
      longitude: 83.0063,
      trashType: TrashType.METAL,
      severity: TrashSeverity.MEDIUM,
      description: 'Rusted cans near the water.'
    },
    {
      id: '5',
      timestamp: Date.now() - 100000,
      imageUrl: 'https://picsum.photos/400/300?random=5',
      locationName: 'Godowlia Market',
      latitude: 25.3109,
      longitude: 83.0107,
      trashType: TrashType.PLASTIC,
      severity: TrashSeverity.CRITICAL,
      description: 'Massive pile of plastic waste.'
    },
    {
      id: '6',
      timestamp: Date.now() - 50000,
      imageUrl: 'https://picsum.photos/400/300?random=6',
      locationName: 'Luxa Road',
      latitude: 25.3120,
      longitude: 83.0050,
      trashType: TrashType.ORGANIC,
      severity: TrashSeverity.MEDIUM,
      description: 'Vegetable waste scattered near the road.'
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
};
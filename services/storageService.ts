import { GarbageReport, TrashType, TrashSeverity } from '../types';
import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'prakriti_darpan_reports_v1';

// Supabase Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Helper to check if we are using Supabase
const isSupabaseEnabled = () => !!supabase;

export const getReports = async (): Promise<GarbageReport[]> => {
  if (isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase!
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      return data as GarbageReport[];
    } catch (e) {
      console.error("Supabase fetch error:", e);
      // Fallback to local storage if network fails? 
      // For now, let's just return local storage as fallback or empty
      return getLocalReports();
    }
  }
  return getLocalReports();
};

export const getReportById = async (id: string): Promise<GarbageReport | undefined> => {
  if (isSupabaseEnabled()) {
    try {
      const { data, error } = await supabase!
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as GarbageReport;
    } catch (e) {
      console.error("Supabase fetch single error:", e);
      return getLocalReports().find(r => r.id === id);
    }
  }
  return getLocalReports().find(r => r.id === id);
};

export const saveReport = async (report: GarbageReport): Promise<void> => {
  if (isSupabaseEnabled()) {
    try {
      // If image is base64, we should ideally upload to storage bucket
      // But for simplicity in this step, we'll try to save as is (might be too large for DB text field)
      // A proper implementation would upload image to Storage first.
      
      // Let's assume for now we just save the record. 
      // If image is too big, this might fail.
      const { error } = await supabase!
        .from('reports')
        .insert([report]);

      if (error) throw error;
      return;
    } catch (e) {
      console.error("Supabase save error:", e);
      // Fallback
      saveLocalReport(report);
    }
  } else {
    saveLocalReport(report);
  }
};

export const updateReport = async (updatedReport: GarbageReport): Promise<void> => {
  if (isSupabaseEnabled()) {
    try {
      const { error } = await supabase!
        .from('reports')
        .update(updatedReport)
        .eq('id', updatedReport.id);

      if (error) throw error;
    } catch (e) {
      console.error("Supabase update error:", e);
      updateLocalReport(updatedReport);
    }
  } else {
    updateLocalReport(updatedReport);
  }
};

export const deleteReport = async (id: string): Promise<void> => {
  if (isSupabaseEnabled()) {
    try {
      const { error } = await supabase!
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error("Supabase delete error:", e);
      deleteLocalReport(id);
    }
  } else {
    deleteLocalReport(id);
  }
};

export const clearReports = async (): Promise<void> => {
  if (isSupabaseEnabled()) {
    // Dangerous operation in cloud DB, maybe disable or just clear local
    console.warn("Clear reports not fully implemented for Supabase to prevent accidental data loss.");
  }
  localStorage.removeItem(STORAGE_KEY);
};

export const seedDemoData = async (): Promise<void> => {
  const reports = await getReports();
  if (reports.length > 0) return;

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

  if (isSupabaseEnabled()) {
    // Seed to Supabase
    await supabase!.from('reports').insert(demoData);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
  }
};


// --- Local Storage Implementation (Internal) ---

const getLocalReports = (): GarbageReport[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load reports", e);
    return [];
  }
};

const saveLocalReport = (report: GarbageReport): void => {
  try {
    const reports = getLocalReports();
    const newReports = [report, ...reports];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      console.warn("Storage full. Attempting to free space.");
      const reports = getLocalReports();
      if (reports.length > 0) {
        const keepCount = Math.max(Math.floor(reports.length * 0.75), 0);
        const effectiveKeepCount = keepCount === reports.length ? reports.length - 1 : keepCount;
        const trimmedReports = reports.slice(0, effectiveKeepCount);
        const finalReports = [report, ...trimmedReports];
        try {
           localStorage.setItem(STORAGE_KEY, JSON.stringify(finalReports));
           return;
        } catch (retryError) {
           throw new Error("Storage is full and could not be cleared.");
        }
      }
    }
    throw e;
  }
};

const updateLocalReport = (updatedReport: GarbageReport): void => {
  const reports = getLocalReports();
  const index = reports.findIndex(r => r.id === updatedReport.id);
  if (index !== -1) {
    reports[index] = updatedReport;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
};

const deleteLocalReport = (id: string): void => {
    const reports = getLocalReports();
    const newReports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
};

export enum TrashSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum TrashType {
  PLASTIC = 'Plastic',
  PAPER = 'Paper',
  METAL = 'Metal',
  ORGANIC = 'Organic',
  ELECTRONIC = 'Electronic',
  MIXED = 'Mixed',
  LARGE_ITEM = 'Large Item',
  UNKNOWN = 'Unknown'
}

export interface GarbageReport {
  id: string;
  timestamp: number;
  imageUrl: string; // Base64
  locationName: string; // User provided or reverse geocoded (mock)
  latitude?: number;
  longitude?: number;
  trashType: TrashType;
  severity: TrashSeverity;
  description: string;
  analysisRaw?: string;
}

export interface AnalysisResult {
  isGarbage: boolean;
  trashType: TrashType;
  severity: TrashSeverity;
  description: string;
  suggestedLocationType: string;
}

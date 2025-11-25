
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, MapPin, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
// const analyzeImage = async (base64: string) => { return { isGarbage: false, trashType: 'Unknown', severity: 'Low', description: 'Mock', suggestedLocationType: 'Mock' } as any; };
import { saveReport } from '../services/storageService';
import { AnalysisResult, GarbageReport, TrashSeverity, TrashType } from '../types';

// Helper to compress images before storage/analysis
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Target 800px width - good balance for AI analysis and storage size
        const MAX_WIDTH = 800; 
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
             resolve(event.target?.result as string);
             return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG at 0.7 quality
        resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // 1. Compress Image first
      const compressedBase64 = await compressImage(file);
      setImagePreview(compressedBase64);

      // 2. Get Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (geoError) => {
            console.warn("Geolocation denied or unavailable", geoError);
          }
        );
      }

      // 3. Start AI Analysis
      await startAnalysis(compressedBase64);

    } catch (e) {
      console.error("Error processing file:", e);
      setError("Failed to process image. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const startAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeImage(base64);
      
      if (!result.isGarbage) {
        setError(`Our AI didn't detect significant garbage. (AI said: ${result.description})`);
      } else {
        setAnalysisResult(result);
        setLocationName(result.suggestedLocationType); // Pre-fill with suggestion
      }
    } catch (e) {
      setError("AI analysis failed. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = () => {
    if (!analysisResult || !imagePreview || !locationName) return;

    const report: GarbageReport = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      imageUrl: imagePreview,
      locationName: locationName,
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      trashType: analysisResult.trashType,
      severity: analysisResult.severity,
      description: analysisResult.description,
    };

    try {
      saveReport(report);
      navigate('/analytics');
    } catch (e) {
      setError("Failed to save report. Storage might be full.");
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setAnalysisResult(null);
    setLocationName('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="pb-24 md:pt-20 px-4 max-w-2xl mx-auto h-screen flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800 my-6">Report Garbage</h1>

      {!imagePreview ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-3xl bg-green-50 p-8 animate-in fade-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Camera className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-900 mb-2">Capture or Upload</h2>
          <p className="text-green-700 text-center mb-8 max-w-xs">
            Take a photo of waste to create a permanent record and help track pollution.
          </p>
          
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-xs bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 text-sm text-green-600 font-medium hover:underline"
          >
            upload from gallery
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6 max-h-80 bg-black group">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            <button 
              onClick={resetForm}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors backdrop-blur-sm pointer-events-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center justify-center py-12 animate-in fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-25"></div>
                <Loader2 className="w-12 h-12 text-green-600 animate-spin relative z-10" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-1">Analyzing Image</h3>
              <p className="text-gray-500 text-center max-w-xs">Identifying trash type, severity, and location details...</p>
            </div>
          )}

          {/* Error State */}
          {!isAnalyzing && error && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center animate-in zoom-in-95 duration-300">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h3 className="text-red-800 font-bold mb-2">Analysis Failed</h3>
              <p className="text-red-700 font-medium mb-6">{error}</p>
              <button 
                onClick={resetForm}
                className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success / Form State */}
          {!isAnalyzing && analysisResult && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500 fade-in">
              
              {/* Analysis Results Card */}
              <div className="bg-white p-5 rounded-2xl shadow-md border border-green-100">
                <div className="flex items-center gap-2 mb-4 text-green-700 font-bold text-lg border-b border-gray-100 pb-3">
                  <CheckCircle className="w-6 h-6 fill-green-100" />
                  Analysis Complete
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Type</span>
                    <p className="font-bold text-gray-800 text-lg">{analysisResult.trashType}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Severity</span>
                    <p className={`font-bold text-lg ${
                      analysisResult.severity === TrashSeverity.HIGH || analysisResult.severity === TrashSeverity.CRITICAL 
                      ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {analysisResult.severity}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">AI Observation</span>
                  <p className="text-gray-700 text-sm mt-1 italic">"{analysisResult.description}"</p>
                </div>
              </div>

              {/* Location Input Card */}
              <div className="bg-white p-5 rounded-2xl shadow-md border border-green-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Tag Location
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Central Park, Main St..."
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 font-medium"
                />
                <p className="text-xs text-gray-400 mt-2 px-1">
                  Name this spot to help organize your records.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!locationName.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform flex items-center justify-center gap-2
                  ${locationName.trim() 
                    ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Save Record
              </button>
            </div>
          )}
          
          <div className="h-10"></div>
        </div>
      )}
    </div>
  );
};

export default Report;

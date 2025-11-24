import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, MapPin, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { saveReport } from '../services/storageService';
import { AnalysisResult, GarbageReport, TrashSeverity, TrashType } from '../types';

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

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      startAnalysis(base64);
    };
    reader.readAsDataURL(file);
    
    // Get geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Ignore error, just proceed without exact coords
          console.warn("Geolocation denied or unavailable");
        }
      );
    }
  };

  const startAnalysis = async (base64: string) => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      const result = await analyzeImage(base64);
      
      if (!result.isGarbage) {
        setError("Our AI didn't detect any garbage in this image. Please try another angle if this is a mistake.");
      } else {
        setAnalysisResult(result);
        setLocationName(result.suggestedLocationType); // Pre-fill with suggestion
      }
    } catch (e) {
      setError("Analysis failed. Please try again.");
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

    saveReport(report);
    navigate('/analytics');
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
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-green-300 rounded-3xl bg-green-50 p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Camera className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-green-900 mb-2">Capture or Upload</h2>
          <p className="text-green-700 text-center mb-8 max-w-xs">
            Take a photo of the waste found in your area.
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
            className="w-full max-w-xs bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Take Photo
          </button>
          
          <p className="mt-4 text-sm text-green-600">
            or <span className="underline cursor-pointer font-semibold" onClick={() => fileInputRef.current?.click()}>upload from gallery</span>
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Image Preview */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-6 max-h-80 bg-black">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
            <button 
              onClick={resetForm}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex flex-col items-center justify-center py-12">
              <Loader2 className="w-10 h-10 text-green-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium animate-pulse">Analyzing image with AI...</p>
            </div>
          )}

          {/* Error State */}
          {!isAnalyzing && error && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-red-700 font-medium mb-4">{error}</p>
              <button 
                onClick={resetForm}
                className="px-6 py-2 bg-white border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success / Form State */}
          {!isAnalyzing && analysisResult && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 fade-in">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
                <div className="flex items-center gap-2 mb-4 text-green-700 font-semibold border-b border-gray-100 pb-2">
                  <CheckCircle className="w-5 h-5" />
                  Analysis Complete
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Type</span>
                    <p className="font-medium text-gray-800">{analysisResult.trashType}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-bold">Severity</span>
                    <p className={`font-medium ${
                      analysisResult.severity === TrashSeverity.HIGH || analysisResult.severity === TrashSeverity.CRITICAL 
                      ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {analysisResult.severity}
                    </p>
                  </div>
                </div>
                <div className="mb-2">
                  <span className="text-xs text-gray-500 uppercase font-bold">AI Description</span>
                  <p className="text-gray-600 text-sm mt-1 bg-gray-50 p-3 rounded-lg">{analysisResult.description}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-green-100">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Where is this?
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Central Park, Main St, My Backyard"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Help us identify the most affected areas by naming this location.
                </p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!locationName.trim()}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2
                  ${locationName.trim() 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                Submit Report
              </button>
            </div>
          )}
          
          {/* Spacer for navbar */}
          <div className="h-10"></div>
        </div>
      )}
    </div>
  );
};

export default Report;

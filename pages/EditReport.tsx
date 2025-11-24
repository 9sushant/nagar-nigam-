
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Trash2, MapPin, AlertTriangle, Check } from 'lucide-react';
import { getReportById, updateReport, deleteReport } from '../services/storageService';
import { GarbageReport, TrashType, TrashSeverity } from '../types';

const EditReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<GarbageReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [locationName, setLocationName] = useState('');
  const [trashType, setTrashType] = useState<TrashType>(TrashType.UNKNOWN);
  const [severity, setSeverity] = useState<TrashSeverity>(TrashSeverity.LOW);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      const foundReport = getReportById(id);
      if (foundReport) {
        setReport(foundReport);
        setLocationName(foundReport.locationName);
        setTrashType(foundReport.trashType);
        setSeverity(foundReport.severity);
        setDescription(foundReport.description);
      } else {
        // Handle not found
        navigate('/');
      }
      setLoading(false);
    }
  }, [id, navigate]);

  const handleSave = () => {
    if (!report) return;

    const updatedReport: GarbageReport = {
      ...report,
      locationName,
      trashType,
      severity,
      description
    };

    updateReport(updatedReport);
    navigate(-1); // Go back
  };

  const handleDelete = () => {
    if (id && confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      deleteReport(id);
      navigate('/');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!report) {
    return <div className="min-h-screen flex items-center justify-center">Report not found</div>;
  }

  return (
    <div className="pb-24 md:pt-20 px-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between my-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Edit Report</h1>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>

      <div className="space-y-6">
        {/* Image Preview */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50 h-64">
          <img 
            src={report.imageUrl} 
            alt="Report" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Form Fields */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 space-y-4">
          
          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-green-600" />
              Location Name
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Trash Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Trash Type</label>
              <select
                value={trashType}
                onChange={(e) => setTrashType(e.target.value as TrashType)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                {Object.values(TrashType).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as TrashSeverity)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                {Object.values(TrashSeverity).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
          
          <button
            onClick={handleDelete}
            className="w-full py-4 bg-white text-red-600 border border-red-200 rounded-xl font-bold text-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditReport;

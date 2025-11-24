
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Camera, MapPin, Activity, Edit } from 'lucide-react';
import { getReports, seedDemoData } from '../services/storageService';
import { GarbageReport } from '../types';

const Home: React.FC = () => {
  const [recentReports, setRecentReports] = useState<GarbageReport[]>([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, areas: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    seedDemoData(); // Ensure we have data to show on first load for better UX
    const reports = getReports();
    setRecentReports(reports.slice(0, 3)); // Top 3 recent

    const uniqueAreas = new Set(reports.map(r => r.locationName)).size;
    const criticalCount = reports.filter(r => r.severity === 'Critical' || r.severity === 'High').length;

    setStats({
      total: reports.length,
      critical: criticalCount,
      areas: uniqueAreas
    });
  }, []);

  return (
    <div className="pb-24 md:pt-20 px-4 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-3xl p-8 text-white shadow-xl mb-8 mt-6">
        <h1 className="text-3xl font-bold mb-2">Keep Your Community Clean</h1>
        <p className="text-green-100 mb-6 max-w-lg">
          Snap a photo of litter, let AI analyze it, and help us visualize the most affected areas in your neighborhood.
        </p>
        <Link 
          to="/report" 
          className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition-transform hover:scale-105 active:scale-95 shadow-md"
        >
          <Camera className="w-5 h-5" />
          Report Garbage Now
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Reports</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">High Severity</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.areas}</div>
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Areas</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recent Reports</h2>
        <Link to="/analytics" className="text-sm text-green-600 font-medium hover:underline flex items-center">
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="space-y-4">
        {recentReports.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400">No reports yet. Be the first!</p>
          </div>
        ) : (
          recentReports.map((report) => (
            <div key={report.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-start relative group">
              <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800 truncate">{report.locationName}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    report.severity === 'Critical' || report.severity === 'High' ? 'bg-red-100 text-red-700' : 
                    report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {report.severity}
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {report.trashType}
                  </p>
                </div>
                <p className="text-sm text-gray-400 mt-1 truncate">{report.description}</p>
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                   <MapPin className="w-3 h-3" /> {new Date(report.timestamp).toLocaleDateString()}
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/edit/${report.id}`);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                aria-label="Edit Report"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;

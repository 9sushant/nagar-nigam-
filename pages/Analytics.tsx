
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { getReports, clearReports } from '../services/storageService';
import { GarbageReport } from '../types';
import { Trash2, AlertOctagon, Edit, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#3b82f6', '#8b5cf6'];

const Analytics: React.FC = () => {
  const [reports, setReports] = useState<GarbageReport[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    setReports(getReports());
  }, []);

  // 1. Process Data for "Garbage by Area" Chart
  const areaDataMap: Record<string, number> = {};
  reports.forEach(r => {
    // Normalize location name
    const loc = r.locationName.trim() || "Unknown";
    areaDataMap[loc] = (areaDataMap[loc] || 0) + 1;
  });
  
  const areaChartData = Object.keys(areaDataMap).map(area => ({
    name: area,
    count: areaDataMap[area]
  })).sort((a, b) => b.count - a.count).slice(0, 10); // Top 10 areas

  // 2. Process Data for "Trash Types" Chart
  const typeDataMap: Record<string, number> = {};
  reports.forEach(r => {
    typeDataMap[r.trashType] = (typeDataMap[r.trashType] || 0) + 1;
  });

  const typeChartData = Object.keys(typeDataMap).map(type => ({
    name: type,
    value: typeDataMap[type]
  }));

  const handleClear = () => {
    if(confirm("Are you sure you want to clear all data?")) {
        clearReports();
        setReports([]);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen pb-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <BarChart className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">No Data Available</h2>
        <p className="text-gray-500 max-w-xs">Start reporting garbage to see analytics about your surroundings.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pt-20 px-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold text-gray-800">Garbage Analytics</h1>
        <button onClick={handleClear} className="text-xs text-red-500 hover:underline">Reset Data</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* Main Chart: Areas with Most Garbage */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <AlertOctagon className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-bold text-gray-800">Areas with Most Garbage</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaChartData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                />
                <Tooltip 
                    cursor={{ fill: '#f0fdf4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                  {areaChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-400 text-center mt-4">
            Shows the total number of reports submitted per location name.
          </p>
        </div>

        {/* Secondary Chart: Trash Composition */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 mb-6">
            <Trash2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Composition</h2>
          </div>
          <div className="h-64 w-full flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Stats</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 font-medium">Total Reports</span>
                    <span className="text-2xl font-bold text-gray-800">{reports.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                    <span className="text-red-500 font-medium">Critical Issues</span>
                    <span className="text-2xl font-bold text-red-600">
                        {reports.filter(r => r.severity === 'Critical').length}
                    </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-green-600 font-medium">Most Polluted</span>
                    <span className="text-sm font-bold text-green-700 text-right">
                        {areaChartData[0]?.name || "N/A"}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Report History List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-800">All Reports</h2>
        </div>
        <div className="divide-y divide-gray-100">
            {reports.map((report) => (
                <div key={report.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                             <img src={report.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                             <h4 className="font-semibold text-gray-800 text-sm">{report.locationName}</h4>
                             <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded ${
                                    report.severity === 'Critical' || report.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                    report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                }`}>
                                    {report.severity}
                                </span>
                                <span>•</span>
                                <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                             </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate(`/edit/${report.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;

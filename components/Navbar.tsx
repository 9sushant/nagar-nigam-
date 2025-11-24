import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, BarChart2, Home, Trash2 } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => `
    flex flex-col items-center justify-center w-full h-full py-2 text-xs font-medium transition-colors
    ${isActive(path) ? 'text-green-600 bg-green-50 border-t-2 border-green-600' : 'text-gray-500 hover:text-green-500 hover:bg-gray-50'}
  `;

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto md:h-16 md:border-t-0 md:border-b">
      <div className="flex items-center justify-between h-full max-w-4xl mx-auto px-4 md:px-0">
        
        {/* Mobile: Space out evenly. Desktop: Logo left, links right */}
        <div className="hidden md:flex items-center gap-2 font-bold text-xl text-green-700">
            <Trash2 className="w-6 h-6" />
            <span>Prakriti Darpan</span>
        </div>

        <div className="flex w-full md:w-auto h-full md:gap-8 justify-around">
          <Link to="/" className={linkClass('/')}>
            <Home className="w-6 h-6 mb-1" />
            <span>Home</span>
          </Link>
          <Link to="/report" className={linkClass('/report')}>
            <Camera className="w-6 h-6 mb-1" />
            <span>Report</span>
          </Link>
          <Link to="/analytics" className={linkClass('/analytics')}>
            <BarChart2 className="w-6 h-6 mb-1" />
            <span>Analytics</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
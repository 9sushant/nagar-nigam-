import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Report from './pages/Report';
import Analytics from './pages/Analytics';
import EditReport from './pages/EditReport';

const App: React.FC = () => {
  console.log("App rendering");
  return (
    <HashRouter>
      <div className="min-h-screen text-gray-900 font-sans">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/edit/:id" element={<EditReport />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TaxGroupPage from './pages/TaxGroupPage';
import TaxDetailPage from './pages/TaxDetailPage';
import WorkMasterPage from './pages/WorkMasterPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f9fd] flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {/* Top Navigation Bar */}
        <Header />

        {/* Main Application Body: Sidebar + Content */}
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />

          <main className="flex-1 overflow-y-auto min-h-[calc(100vh-65px)]">
            <Routes>
              <Route path="/tax-group" element={<TaxGroupPage />} />
              <Route path="/tax-master" element={<TaxDetailPage />} />
              <Route path="/tax-details" element={<Navigate to="/tax-master" replace />} />
              <Route path="/work-master" element={<WorkMasterPage />} />
              <Route path="/" element={<Navigate to="/tax-group" replace />} />
              <Route path="*" element={<Navigate to="/tax-group" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
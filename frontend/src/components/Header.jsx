import React, { useState } from 'react';
import { Search, Bell, ChevronDown, CheckCircle2, ShieldCheck, Command } from 'lucide-react';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      {/* Left: CA ProFlow Logo & Brand */}
      <div className="flex items-center gap-3.5">
        {/* Stylized CA Emblem */}
        <div className="relative flex items-center justify-center">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-[#0052cc] via-[#0066f5] to-[#388bfd] flex items-center justify-center shadow-xs text-white">
            <svg
              className="w-5 h-5 select-none"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* White 'C' arc */}
              <path
                d="M19 14C13.4772 14 9 18.4772 9 24C9 29.5228 13.4772 34 19 34C22.2 34 24.8 32.5 26.2 30"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* White 'A' shape */}
              <path
                d="M25 34L31 15L37 34"
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M27.5 28H34.5"
                stroke="white"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              {/* Dot above A */}
              <circle cx="37" cy="13" r="2.5" fill="#facc15" />
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[#0f172a] font-bold text-base leading-tight tracking-tight">
            CA ProFlow
          </span>
          <span className="text-slate-400 text-[11px] font-normal leading-tight">
            Compliance Management
          </span>
        </div>
      </div>

      {/* Middle: Professional Search Bar with Command Hint */}
      <div className="flex-1 max-w-lg mx-6 hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tax groups, compliance tasks, work masters..."
            className="w-full pl-10 pr-16 py-2 bg-slate-50/80 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/90 focus:border-[#0066f5] focus:outline-none focus:ring-3 focus:ring-blue-100/60 transition-all duration-200 shadow-2xs"
          />
          <div className="absolute right-2.5 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">
              Ctrl K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Status Pill, Notifications & Firm Profile */}
      <div className="flex items-center gap-3">
        {/* Live Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/60 rounded-full text-[11px] font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Synced</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 text-slate-600 hover:text-[#0066f5] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
        >
          <Bell className="w-4.5 h-4.5 stroke-[2]" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
            3
          </span>
        </button>

        {/* Company Profile Dropdown */}
        <div className="relative pl-1 border-l border-slate-200/80">
          <button
            type="button"
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-slate-800 transition-all border border-slate-200/70 shadow-2xs cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              RA
            </div>
            <div className="text-left hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-tight group-hover:text-[#0066f5] transition-colors">
                RIZ & Associates
              </span>
              <span className="block text-[10px] font-medium text-slate-400 leading-tight">
                Chartered Accountants
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
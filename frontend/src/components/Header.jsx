import React from 'react';
import { Bell } from 'lucide-react';

const Header = () => {
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
      </div>
    </header>
  );
};

export default Header;
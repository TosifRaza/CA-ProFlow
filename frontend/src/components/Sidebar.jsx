import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarClock,
  Briefcase,
  FolderTree,
  ShieldCheck,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      to: '/tax-group',
      label: 'Tax Group',
      icon: FolderTree,
    },
    {
      to: '/tax-master',
      label: 'Tax Master',
      icon: CalendarClock,
    },
    {
      to: '/work-master',
      label: 'Work Master',
      icon: Briefcase,
    },
  ];

  return (
    <aside className="w-64 min-h-[calc(100vh-60px)] bg-white border-r border-slate-200/80 p-3.5 flex flex-col justify-between select-none shadow-[1px_0_3px_0_rgba(15,23,42,0.02)]">
      {/* Navigation Section */}
      <div className="space-y-4">
        {/* Section Label */}
        <div className="px-3 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Compliance Masters
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full h-10 px-3 rounded-lg flex items-center gap-3 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-[#0066f5] font-semibold border border-blue-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#0066f5] stroke-[2.4]' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 px-2 flex items-center justify-between text-xs text-slate-400">
        <div>
          <p className="font-semibold text-slate-700 text-xs">RIZ & Associates</p>
          <p className="text-[11px] text-slate-400">FY 2026–27 Statutory</p>
        </div>
        <div className="flex items-center gap-1.5" title="Compliance Active">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-medium text-emerald-600">Active</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
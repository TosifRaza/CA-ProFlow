import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  ChevronDown,
  CalendarClock,
  Briefcase,
  ShieldCheck,
  FolderTree,
  Sliders,
  Sparkles,
} from 'lucide-react';

const Sidebar = () => {
  const [isMasterOpen, setIsMasterOpen] = useState(true);

  const navItems = [
    {
      to: '/tax-group',
      label: 'Tax Group',
      icon: FolderTree,
      badge: 'Head',
      description: 'Tax Classifications',
    },
    {
      to: '/tax-master',
      label: 'Tax Master',
      icon: CalendarClock,
      badge: 'Rules',
      description: 'Filing & Deadlines',
    },
    {
      to: '/work-master',
      label: 'Work Master',
      icon: Briefcase,
      badge: 'Tasks',
      description: 'Work Allocation',
    },
  ];

  return (
    <aside className="w-68 min-h-[calc(100vh-65px)] bg-white/80 backdrop-blur-md p-4 flex flex-col justify-between border-r border-slate-200/80 select-none shadow-[1px_0_4px_0_rgba(15,23,42,0.02)]">
      {/* Top Menu Section */}
      <div className="space-y-4">
        {/* Category Header */}
        <div className="px-2 pt-1 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Compliance Masters
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <Sparkles className="w-2.5 h-2.5" />
            3 Active
          </span>
        </div>

        {/* Master Management Menu Accordion */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setIsMasterOpen(!isMasterOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-100/80 hover:bg-slate-200/70 text-slate-800 rounded-xl transition-all duration-150 cursor-pointer border border-slate-200/60 group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                Master Management
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                isMasterOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </button>

          {/* Submenu Links */}
          {isMasterOpen && (
            <div className="space-y-1 pt-1 pl-1 transition-all duration-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50/50 text-[#0066f5] font-bold border border-blue-200/80 shadow-2xs shadow-blue-500/5'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/90 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-[#0066f5] stroke-[2.4]' : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          <div className="truncate text-left">
                            <span className="block leading-tight">{item.label}</span>
                            <span className="block text-[10px] text-slate-400 font-normal leading-tight">
                              {item.description}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ml-1 ${
                            isActive
                              ? 'bg-blue-100 text-blue-700 border border-blue-200/80'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Compliance & Security Card */}
      <div className="pt-4 mt-6 border-t border-slate-200/70">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-800">CA Compliance Guard</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Statutory tax schedules and compliance deadlines active for <strong className="text-slate-700">FY 2026-27</strong>.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>RIZ & Associates</span>
            <span className="font-semibold text-blue-600">v2.4 Enterprise</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
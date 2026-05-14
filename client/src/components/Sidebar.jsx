import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Settings2,
  CheckSquare,
  FileText,
  FileSearch,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileStack
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tenders', label: 'Tenders', icon: Briefcase },
  { id: 'ai-configure', label: 'AI Configure', icon: Settings2 },
  { id: 'proposals', label: 'Proposals', icon: FileStack },
  { id: 'evaluations', label: 'Evaluations', icon: CheckSquare },
  { id: 'reports', label: 'Reports', icon: FileText },
];

const Sidebar = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 320 }}
      className="bg-white border-r border-slate-200 flex flex-col relative z-20 h-full transition-all duration-300 ease-in-out"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-6 flex flex-col h-full overflow-hidden">
        {/* Logo Section */}
        <div className={`flex items-center space-x-3 mb-10 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="min-w-[40px] h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 shrink-0">
            <FileStack className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="font-semibold text-xl tracking-tight text-slate-700 uppercase">TenderAI</span>
              <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                <Shield className="w-2.5 h-2.5 mr-1.5" />
                govt of odisha
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center p-3 rounded-2xl text-sm font-semibold transition-all group relative ${isActive
                    ? 'bg-orange-600 text-white shadow-xl shadow-orange-100'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'group-hover:text-slate-600'}`} />
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  />
                )}

                {/* Tooltip for Collapsed State */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Integrity Box */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-auto pt-6 border-t border-slate-100"
          >
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">System Integrity</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
                Gov-grade encryption active. All sessions are audited for compliance.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;

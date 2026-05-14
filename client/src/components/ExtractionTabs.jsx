import React from 'react';
import { ShieldCheck, Cpu, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { id: 'general', label: 'General Info', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'pq', label: 'Pre-Qualification', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'tq', label: 'Technical Qualification', icon: Cpu, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'other', label: 'Compliance & Others', icon: FileText, color: 'text-slate-600', bg: 'bg-slate-100' },
];

const ExtractionTabs = ({ activeTab, setActiveTab, completedSections }) => {
  return (
    <div className="flex space-x-1 p-1 bg-slate-100 rounded-xl mb-6 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isCompleted = completedSections.includes(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative flex items-center shrink-0 flex-1 min-w-fit justify-center py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-tight transition-all duration-200 whitespace-nowrap
              ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
            `}
          >
            <div className="flex items-center space-x-2 relative z-10">
              <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isCompleted && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />
              )}
            </div>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ExtractionTabs;

import React, { useState } from 'react';
import { 
  ChevronRight, Edit3, ArrowLeft, CheckCircle2, AlertCircle, FileText, Settings2, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TemplateView = ({ tender, onBack }) => {
  const [activeTab, setActiveTab] = useState('pq');

  const tabs = [
    { id: 'pq', label: 'Pre-Qualification (PQ)' },
    { id: 'tq', label: 'Technical Qualification (TQ)' },
    { id: 'checklist', label: 'Document Checklist' },
  ];

  const pqCriteria = [
    { id: 1, title: 'Company Registration', description: 'Valid company registration certificate', status: 'Mandatory' },
    { id: 2, title: 'Financial Turnover', description: 'Minimum turnover of ₹5 Cr in last 3 years', status: 'Mandatory' },
    { id: 3, title: 'Similar Project Experience', description: 'Completed at least 2 similar projects in last 5 years', status: 'Mandatory' },
  ];

  const tqCriteria = [
    { id: 1, title: 'Technical Methodology', description: 'Detailed project execution plan and timeline', status: 'Mandatory' },
    { id: 2, title: 'Key Personnel', description: 'CVs of project manager and technical leads', status: 'Mandatory' },
    { id: 3, title: 'Equipment Capability', description: 'List of machinery and software tools available', status: 'Optional' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Configure</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">View Template</span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Evaluation Template</h1>
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-bold">Tender ID:</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-black">{tender?.tender_id || 'TND-2026-001'}</span>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95">
            <Edit3 size={18} />
            <span>Edit Template</span>
          </button>
        </div>

        {/* Custom Tab Bar */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-fit mb-10 border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all relative ${
                activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 min-h-[500px]"
        >
          <div className="flex items-center space-x-3 mb-8">
            <div className={`p-2 rounded-lg ${activeTab === 'pq' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {activeTab === 'pq' ? <ShieldCheck size={20} /> : <Settings2 size={20} />}
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label} Criteria
            </h3>
          </div>

          <div className="space-y-4">
            {(activeTab === 'pq' ? pqCriteria : tqCriteria).map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-100 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-black text-slate-900">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ${
                      item.status === 'Mandatory' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowLeft size={14} className="text-slate-400 rotate-180" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-500">{item.description}</p>
                
                {/* Visual Indicator Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-slate-100 rounded-r-full group-hover:bg-emerald-400 transition-colors" />
              </motion.div>
            ))}

            {activeTab === 'checklist' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-5 bg-slate-50 rounded-full mb-4">
                  <FileText size={40} className="text-slate-300" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">Document Checklist Generated</h4>
                <p className="text-sm font-bold text-slate-400 max-w-sm">All required document categories have been identified and mapped to PQ/TQ criteria.</p>
                <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                  Download Checklist (PDF)
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateView;

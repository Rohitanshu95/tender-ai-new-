import React, { useState } from 'react';
import { 
  ChevronRight, ArrowLeft, CheckCircle2, ChevronDown, 
  Wand2, Save, FileText, Settings, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenerateTemplate = ({ tender, onBack, onSave }) => {
  const [expandedSection, setExpandedSection] = useState('pq');

  const sections = [
    {
      id: 'pq',
      title: 'Pre-Qualification (PQ) Criteria',
      count: '4 Criteria',
      color: 'indigo',
      content: [
        { label: 'Financial Turnover', detail: 'Minimum average annual turnover of ₹50 Cr in last 3 years.' },
        { label: 'Technical Experience', detail: 'Completion of at least 2 similar projects in the last 5 years.' },
        { label: 'Net Worth', detail: 'Positive net worth as per the latest audited balance sheet.' },
        { label: 'Blacklisting Declaration', detail: 'Affidavit confirming no blacklisting by any Govt. agency.' }
      ]
    },
    {
      id: 'tq',
      title: 'Technical Qualification (TQ) Criteria',
      count: '5 Criteria',
      color: 'emerald',
      content: [
        { label: 'Project Methodology', detail: 'Detailed approach and work plan for project execution.' },
        { label: 'Key Personnel', detail: 'Availability of qualified Project Manager and Technical Experts.' },
        { label: 'Equipment List', detail: 'Ownership or lease agreement for critical machinery.' },
        { label: 'Quality Certification', detail: 'Valid ISO 9001:2015 certification for quality management.' },
        { label: 'Site Visit Report', detail: 'Confirmation of site visit and understanding of constraints.' }
      ]
    },
    {
      id: 'checklist',
      title: 'Document Checklist',
      count: '10 Documents',
      color: 'blue',
      content: [
        { label: 'Registration Certificate', detail: 'Copy of valid firm/company registration.' },
        { label: 'GST Registration', detail: 'Copy of GST certificate and latest returns.' },
        { label: 'IT Returns', detail: 'Audited IT returns for the last 3 financial years.' },
        { label: 'Bank Solvency', detail: 'Solvency certificate from a scheduled bank.' },
        { label: 'Performance Certificates', detail: 'Completion certificates from previous clients.' }
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={() => onBack()} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <button onClick={() => onBack()} className="hover:text-slate-900 transition-colors">Configure</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">Generate Template</span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onBack()}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">Generate Evaluation Template</h1>
              <p className="text-slate-500 font-bold tracking-tight uppercase text-[11px]">Tender ID: <span className="text-emerald-600">{tender?.tender_id || 'TND-2026-002'}</span></p>
            </div>
          </div>
          
          <button 
            onClick={() => onSave()}
            className="flex items-center space-x-2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Save size={16} />
            <span>Save Template</span>
          </button>
        </div>

        {/* Success Alert */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center space-x-4 shadow-sm"
        >
          <div className="p-2 bg-white rounded-full text-emerald-600 shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight">Template Generated Successfully</h4>
            <p className="text-emerald-700/70 text-xs font-bold">Review and edit the criteria below before saving</p>
          </div>
        </motion.div>

        {/* Accordion Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <div 
              key={section.id}
              className={`bg-white rounded-[2.5rem] border transition-all ${expandedSection === section.id ? 'border-slate-300 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <button 
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="w-full p-8 flex items-center justify-between group"
              >
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{section.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-tight">AI Generated</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-tight border border-slate-100">{section.count}</span>
                  </div>
                </div>
                <div className={`p-2 rounded-xl transition-all ${expandedSection === section.id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100'}`}>
                  <ChevronDown size={20} className={`transition-transform duration-300 ${expandedSection === section.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.content.map((item, i) => (
                          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requirement {i+1}</span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings size={14} className="text-slate-400 hover:text-slate-900 cursor-pointer" />
                              </div>
                            </div>
                            <h5 className="font-black text-slate-900 mb-2">{item.label}</h5>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateTemplate;

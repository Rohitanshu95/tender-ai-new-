import React, { useState } from 'react';
import { 
  ChevronRight, Settings, Download, Building2, IndianRupee, 
  Calendar, Clock, FileText, LayoutList, Layers, ClipboardCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

const InfoCard = ({ icon: Icon, label, value, colorClass, iconBg }) => (
  <div className="flex-1 min-w-[240px] bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center space-x-4">
    <div className={`p-3 rounded-xl ${iconBg} ${colorClass}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</p>
    </div>
  </div>
);

const TenderDetail = ({ tender = {}, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Use passed tender data or fallback to the specific one in the image
  const data = tender.id ? tender : {
    tender_id: 'TND-2026-001',
    title: 'Road Construction - Phase 2',
    status: 'Published',
    organization: 'Public Works',
    estimated_value: '₹12,50,00,000',
    date_of_publish: '2026-03-15',
    date_of_closing: '2026-04-15',
    description: 'Construction of 45 km rural roads with proper drainage systems connecting 12 villages in Khordha district.',
    scope: 'The project includes road construction, drainage systems, signage installation, and quality certification as per IRC standards.',
    type: 'RFP'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutList },
    { id: 'specifications', label: 'Specifications', icon: Layers },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'corrigendum', label: 'Corrigendum', icon: ClipboardCheck, count: 2 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Tenders</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">{data.tender_id}</span>
        </div>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{data.tender_id}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-bold">
                {data.status}
              </span>
            </div>
            <p className="text-slate-500 text-lg font-medium tracking-tight">{data.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all">
              <Settings size={18} />
              <span>Configure Template</span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all">
              <Download size={18} />
              <span>Download All</span>
            </button>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="flex flex-wrap gap-4 mb-10">
          <InfoCard 
            icon={Building2} 
            label="Department" 
            value={data.organization} 
            iconBg="bg-orange-50" 
            colorClass="text-orange-500" 
          />
          <InfoCard 
            icon={IndianRupee} 
            label="Estimated Value" 
            value={data.estimated_value || '₹12,50,00,000'} 
            iconBg="bg-emerald-50" 
            colorClass="text-emerald-500" 
          />
          <InfoCard 
            icon={Calendar} 
            label="Publish Date" 
            value={data.date_of_publish} 
            iconBg="bg-blue-50" 
            colorClass="text-blue-500" 
          />
          <InfoCard 
            icon={Clock} 
            label="Deadline" 
            value={data.date_of_closing} 
            iconBg="bg-rose-50" 
            colorClass="text-rose-500" 
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/50 w-fit rounded-2xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-orange-50 text-orange-400'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm"
        >
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Tender Overview</h3>
                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Description</h4>
                    <p className="text-slate-600 font-medium leading-relaxed max-w-4xl">
                      {data.description}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Scope of Work</h4>
                    <p className="text-slate-600 font-medium leading-relaxed max-w-4xl">
                      {data.scope}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Type</h4>
                    <span className="inline-block px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded text-xs font-black uppercase">
                      {data.type || 'RFP'}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
          
          {activeTab !== 'overview' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">Section Content Pending</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TenderDetail;

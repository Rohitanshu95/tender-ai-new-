import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use passed tender data or fallback
  const data = tender.tenderId ? tender : {
    tenderId: 'TND-2026-001',
    title: 'Road Construction - Phase 2',
    status: 'Published',
    department: 'Public Works',
    estimatedValue: '₹12,50,00,000',
    publishedDate: '2026-03-15',
    closingDate: '2026-04-15',
    description: 'Construction of 45 km rural roads with proper drainage systems connecting 12 villages in Khordha district.',
    scope: 'The project includes road construction, drainage systems, signage installation, and quality certification as per IRC standards.',
    tenderType: 'RFP'
  };

  useEffect(() => {
    if (data.tenderId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [docsRes, reqsRes] = await Promise.all([
            axios.get(`http://localhost:5001/api/documents?tenderId=${encodeURIComponent(data.tenderId)}`),
            axios.get(`http://localhost:5001/api/tenders/${encodeURIComponent(data.tenderId)}/requirements`)
          ]);
          setDocuments(docsRes.data);
          setRequirements(reqsRes.data);
        } catch (err) {
          console.error("Failed to fetch tender details", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [data.tenderId]);

  const corrigendumCount = documents.filter(d => d.type === 'CORRIGENDUM').length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutList },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'corrigendum', label: 'Corrigendum', icon: ClipboardCheck, count: corrigendumCount },
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
          <span className="text-slate-600">{data.tenderId}</span>
        </div>

        {/* Header Section */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter">{data.tenderId}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[11px] font-bold">
                {data.status}
              </span>
            </div>
            <p className="text-slate-500 text-lg font-medium tracking-tight">{data.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 shadow-xl shadow-emerald-100 transition-all">
              <Download size={18} />
              <span>Download Documents</span>
            </button>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="flex flex-wrap gap-4 mb-10">
          <InfoCard 
            icon={Building2} 
            label="Department" 
            value={data.department} 
            iconBg="bg-orange-50" 
            colorClass="text-orange-500" 
          />
          <InfoCard 
            icon={IndianRupee} 
            label="Estimated Value" 
            value={data.estimatedValue || '₹12,50,00,000'} 
            iconBg="bg-emerald-50" 
            colorClass="text-emerald-500" 
          />
          <InfoCard 
            icon={Calendar} 
            label="Publish Date" 
            value={data.publishedDate ? new Date(data.publishedDate).toLocaleDateString() : 'N/A'} 
            iconBg="bg-blue-50" 
            colorClass="text-blue-500" 
          />
          <InfoCard 
            icon={Clock} 
            label="Deadline" 
            value={data.closingDate ? new Date(data.closingDate).toLocaleDateString() : 'N/A'} 
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Original Tender Data</h3>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Project Title</h4>
                      <p className="text-slate-600 font-medium leading-relaxed max-w-4xl text-xl">
                        {data.title}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 mb-3 tracking-tight">Extracted Scope</h4>
                      <p className="text-slate-600 font-medium leading-relaxed max-w-4xl">
                        {data.description || "The document defines the project scope as per the provided RFP/RFQ specifications. Detailed technical requirements can be found in the Specifications tab."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-4">
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Authority</h4>
                        <p className="text-sm font-bold text-slate-700">{data.organization || "National Procurement Board"}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Tender Type</h4>
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-md text-[10px] font-black uppercase tracking-widest">
                          {data.tenderType || 'RFP'}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Timeline Status</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Published</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{data.publishedDate ? new Date(data.publishedDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Closing</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{data.closingDate ? new Date(data.closingDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-400 uppercase">Current Status</span>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase">
                          {data.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-emerald-900 rounded-[2rem] text-white">
                  <div className="flex items-center space-x-3 mb-4">
                    <ClipboardCheck className="text-emerald-400" size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Extraction Pulse</span>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium leading-relaxed mb-6">
                    This tender has been processed with 100% accuracy based on the uploaded RFP and Corrigendum documents.
                  </p>
                  <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-all">
                    View Audit Log
                  </button>
                </div>
              </div>
            </div>
          )}
          

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Main Tender Documents</h3>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
                </div>
              ) : documents.filter(d => d.type !== 'CORRIGENDUM').length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">No Main Documents Found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.filter(d => d.type !== 'CORRIGENDUM').map((doc, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <FileText className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">{doc.type} • Version {doc.version}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`http://localhost:5001/${doc.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-orange-600 transition-all flex items-center space-x-1"
                          title="View Document"
                        >
                          <Eye size={18} />
                          <span className="text-[10px] font-semibold uppercase">View</span>
                        </a>
                        <a 
                          href={`http://localhost:5001/${doc.filePath}`} 
                          download
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-orange-600 transition-all"
                          title="Download"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'corrigendum' && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Corrigendum & Addendum</h3>
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
                </div>
              ) : documents.filter(d => d.type === 'CORRIGENDUM').length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <ClipboardCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-semibold uppercase tracking-widest text-[10px]">No Corrigenda Found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.filter(d => d.type === 'CORRIGENDUM').map((doc, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-orange-200 transition-all">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          <ClipboardCheck className="w-5 h-5 text-orange-400 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{doc.name}</p>
                          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">Corrigendum • {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={`http://localhost:5001/${doc.filePath}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-orange-600 transition-all flex items-center space-x-1"
                          title="View Corrigendum"
                        >
                          <Eye size={18} />
                          <span className="text-[10px] font-semibold uppercase">View</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TenderDetail;

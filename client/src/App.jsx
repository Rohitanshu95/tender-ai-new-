import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Settings, LayoutDashboard, History, 
  CheckCircle2, AlertCircle, FileStack, PlusCircle, 
  ArrowRight, Search, Bell, User, Clock, HardDrive, Shield
} from 'lucide-react';
import ExtractionTabs from './components/ExtractionTabs';
import GenerationSection from './components/GenerationSection';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const App = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [rfpFiles, setRfpFiles] = useState([]);
  const [corrigendumFiles, setCorrigendumFiles] = useState([]);
  
  const [extractions, setExtractions] = useState({
    general: null,
    pq: null,
    tq: null,
    other: null
  });
  
  const [generating, setGenerating] = useState({
    general: false,
    pq: false,
    tq: false,
    other: false
  });

  const [errors, setErrors] = useState({
    general: null,
    pq: null,
    tq: null,
    other: null
  });

  const [uploadType, setUploadType] = useState('rfp');
  const [selectedDocType, setSelectedDocType] = useState('rfp'); // rfp, rfq, eoi

  const handleUpload = (e) => {
    const uploaded = Array.from(e.target.files);
    if (uploadType === 'rfp') {
      setRfpFiles(prev => [...prev, ...uploaded]);
    } else {
      setCorrigendumFiles(prev => [...prev, ...uploaded]);
    }
  };

  const generateForType = async (type) => {
    if (rfpFiles.length === 0) {
      setErrors(prev => ({ ...prev, [type]: "Critical: Main RFP document is required for analysis." }));
      return;
    }

    setGenerating(prev => ({ ...prev, [type]: true }));
    setErrors(prev => ({ ...prev, [type]: null }));

    try {
      const formData = new FormData();
      rfpFiles.forEach(file => formData.append('rfp_files', file));
      corrigendumFiles.forEach(file => formData.append('corrigendum_files', file));
      formData.append('doc_type', selectedDocType);
      formData.append('template_type', type);

      let response;
      if (type === 'general') {
        response = await axios.post(`${API_BASE_URL}/extract/`, formData);
        const data = response.data.data;
        const requirements = [
          { category: 'Scope Overview', requirement: data.title || 'Project Definition', description: data.organization, mandatory: true },
          { category: 'Temporal Compliance', requirement: `Bid Closing: ${data.date_of_closing || 'N/A'}`, description: `Opening Session: ${data.date_of_bid_opening || 'N/A'}`, mandatory: true },
          { category: 'Metadata', requirement: `Tender ID: ${data.tender_id || 'N/A'}`, description: `Category: ${selectedDocType.toUpperCase()}`, mandatory: false },
        ];
        setExtractions(prev => ({ ...prev, general: requirements }));
      } else {
        response = await axios.post(`${API_BASE_URL}/extract/generate-template`, formData);
        setExtractions(prev => ({ ...prev, [type]: response.data.requirements }));
      }
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, [type]: "System Error: Failed to initialize AI agent." }));
    } finally {
      setGenerating(prev => ({ ...prev, [type]: false }));
    }
  };

  const completedSections = Object.keys(extractions).filter(key => extractions[key] !== null);

  return (
    <div className="flex h-screen bg-[#fcfcfd] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col relative z-20">
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <FileStack className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">TenderAI</span>
              <div className="flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                <Shield className="w-2.5 h-2.5 mr-1.5" />
                Gov-Cloud Secure
              </div>
            </div>
          </div>

          <nav className="space-y-1.5 mb-10">
            {[
              { icon: LayoutDashboard, label: 'Tender Analysis', active: true },
            ].map((item, idx) => (
              <a
                key={idx}
                href="#"
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                  item.active ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className={`w-4 h-4 ${item.active ? 'text-white' : 'group-hover:text-slate-600'}`} />
                  <span>{item.label}</span>
                </div>
                {item.active && <ArrowRight className="w-3.5 h-3.5 opacity-50" />}
              </a>
            ))}
          </nav>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ingestion Hub</h4>
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            </div>

            <div className="bg-slate-50 p-1.5 rounded-2xl flex mb-2">
              <button 
                onClick={() => setUploadType('rfp')}
                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${uploadType === 'rfp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Main Doc
              </button>
              <button 
                onClick={() => setUploadType('corrigendum')}
                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${uploadType === 'corrigendum' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Corrigendum
              </button>
            </div>

            {uploadType === 'rfp' && (
              <div className="flex items-center justify-between p-1.5 bg-slate-100/50 rounded-xl mb-2">
                {['rfp', 'rfq', 'eoi'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedDocType(t)}
                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all ${selectedDocType === t ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              <label className={`relative overflow-hidden group flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${uploadType === 'rfp' ? 'bg-purple-50/20 border-purple-100 hover:border-purple-300' : 'bg-emerald-50/20 border-emerald-100 hover:border-emerald-300'}`}>
                <div className={`p-3 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform`}>
                  <PlusCircle className={`w-6 h-6 ${uploadType === 'rfp' ? 'text-purple-600' : 'text-emerald-600'}`} />
                </div>
                <span className={`text-[11px] font-black ${uploadType === 'rfp' ? 'text-purple-900' : 'text-emerald-900'}`}>
                  Upload {uploadType === 'rfp' ? selectedDocType.toUpperCase() : 'Corrigendum'}
                </span>
                <span className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
                  {uploadType === 'rfp' ? rfpFiles.length : corrigendumFiles.length} Document(s) Active
                </span>
                <input type="file" className="hidden" multiple onChange={handleUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-auto p-8 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-5 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Portal Integrity</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
              System monitoring active. All extractions are logged for audit compliance.
            </p>
          </div>
        </div>
      </aside>

      {/* Workspace Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
              <PlusCircle className="w-5 h-5 text-slate-400" />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-5">
            <div className="text-right">
              <p className="text-xs font-black text-slate-900">Rohitanshu Dhar</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">National Procurement Board</p>
            </div>
            <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
              RD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <div className="mb-14">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md">Workspace</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Tender #9842</span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Intelligence Matrix</h1>
              <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
                Launch cross-document analysis agents to synthesize structured compliance criteria from multi-source RFP and Corrigendum data.
              </p>
            </div>

            <ExtractionTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              completedSections={completedSections}
            />

            <div className="mt-10">
              <GenerationSection 
                type={activeTab}
                data={extractions[activeTab]}
                isGenerating={generating[activeTab]}
                onGenerate={() => generateForType(activeTab)}
                error={errors[activeTab]}
              />
            </div>

            {activeTab === 'general' && extractions.general && (
              <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">General Matrix Extracted</h3>
                  <p className="text-slate-400 text-sm font-medium">Proceed to specialized qualification agents for deeper analysis.</p>
                </div>
                <button
                  onClick={() => setActiveTab('pq')}
                  className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center space-x-3"
                >
                  <span>Execute PQ Audit</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

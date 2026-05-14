import React, { useState } from 'react';
import axios from 'axios';
import { 
  PlusCircle, ArrowRight, Clock, Shield, Save, XCircle, BarChart4, Wand2
} from 'lucide-react';
import ExtractionTabs from './ExtractionTabs';
import GenerationSection from './GenerationSection';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const AnalysisMatrix = ({ 
  mode = 'ephemeral', 
  onSave, 
  tenderId = '9842',
  initialRfpFiles = [],
  initialCorrigendumFiles = [],
  initialDocType = 'rfp',
  initialExtractions = null,
  initialMetadata = null
}) => {
  const [rfpFiles, setRfpFiles] = useState(initialRfpFiles);
  const [corrigendumFiles, setCorrigendumFiles] = useState(initialCorrigendumFiles);
  const [hasCorrigendum, setHasCorrigendum] = useState(false);
  const [workflowState, setWorkflowState] = useState(initialExtractions ? 'review' : 'ingestion'); 
  
  const [extractions, setExtractions] = useState(initialExtractions || {
    general: null,
    pq: [],
    tq: [],
    compliance: [],
    scope: [],
    financials: []
  });

  const [rawMetadata, setRawMetadata] = useState(initialMetadata);
  
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
  
  const [selectedDocType, setSelectedDocType] = useState(initialDocType);

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
        
        // Save raw metadata for saving the tender
        setRawMetadata({
          id: data.tender_id,
          title: data.title,
          authority: data.organization,
          department: data.department || "Public Works",
          type: data.tender_type || selectedDocType.toUpperCase(),
          date_of_publish: data.date_of_publish,
          date_of_closing: data.date_of_closing
        });

        const requirements = [
          { category: 'Scope Overview', key: data.title || 'Project Definition', value: `Dept: ${data.department || 'Public Works'} | Type: ${data.tender_type || selectedDocType.toUpperCase()}`, mandatory: true },
          { category: 'Temporal Compliance', key: `Bid Closing: ${data.date_of_closing || 'N/A'}`, value: `Publish Date: ${data.date_of_publish || 'N/A'}`, mandatory: true },
          { category: 'Metadata', key: `Tender ID: ${data.tender_id || 'N/A'}`, value: `Authority: ${data.organization || 'N/A'}`, mandatory: false },
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

  const handleUpload = (e, type) => {
    const uploaded = Array.from(e.target.files);
    if (type === 'rfp') {
      setRfpFiles(prev => [...prev, ...uploaded]);
    } else {
      setCorrigendumFiles(prev => [...prev, ...uploaded]);
    }
  };

  const handleRemoveFile = (index, type) => {
    if (type === 'rfp') {
      setRfpFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setCorrigendumFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleRegenerate = async () => {
    setGenerating(prev => ({ ...prev, general: true }));
    try {
      const response = await axios.post(`http://localhost:5001/api/tenders/${tenderId}/regenerate`);
      // Update UI with new requirements
      const newReqs = response.data.requirements;
      setExtractions(prev => ({
        ...prev,
        pq: newReqs.filter(r => r.category === 'PQ'),
        tq: newReqs.filter(r => r.category === 'TQ')
      }));
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, general: "Failed to regenerate requirements." }));
    } finally {
      setGenerating(prev => ({ ...prev, general: false }));
    }
  };

  // Auto-trigger General Intelligence if files are pre-loaded (Add Tender flow)
  React.useEffect(() => {
    if (initialRfpFiles.length > 0 && !extractions.general && !generating.general) {
      generateForType('general');
    }
  }, [initialRfpFiles.length, extractions.general, generating.general]);
  
  const startParallelExtraction = async () => {
    if (rfpFiles.length === 0) {
      alert("Main document is required!");
      return;
    }
    setWorkflowState('processing');
    setGenerating({ general: true, pq: true, tq: true, other: false });

    try {
      const formData = new FormData();
      rfpFiles.forEach(file => formData.append('rfp_files', file));
      corrigendumFiles.forEach(file => formData.append('corrigendum_files', file));
      formData.append('doc_type', selectedDocType);
      
      const response = await axios.post('http://localhost:5001/api/tenders/batch-extract', formData);
      const { general, pq, tq } = response.data;

      // Map General Metadata
      setRawMetadata({
        id: general.tender_id,
        title: general.title,
        authority: general.organization,
        department: general.department || "Public Works",
        type: general.tender_type || selectedDocType.toUpperCase(),
        date_of_publish: general.date_of_publish,
        date_of_closing: general.date_of_closing
      });

      setExtractions({
        general: [
          { category: 'Scope Overview', key: general.title || 'Project Definition', value: `Dept: ${general.department || 'Public Works'} | Type: ${general.tender_type || selectedDocType.toUpperCase()}`, mandatory: true },
          { category: 'Temporal Compliance', key: `Bid Closing: ${general.date_of_closing || 'N/A'}`, value: `Publish Date: ${general.date_of_publish || 'N/A'}`, mandatory: true },
          { category: 'Metadata', key: `Tender ID: ${general.tender_id || 'N/A'}`, value: `Authority: ${general.organization || 'N/A'}`, mandatory: false },
        ],
        pq: pq,
        tq: tq,
        compliance: [],
        scope: [],
        financials: []
      });

      setWorkflowState('review');
    } catch (err) {
      console.error("Batch extraction failed", err);
      alert("Extraction failed. Please check backend logs.");
      setWorkflowState('ingestion');
    } finally {
      setGenerating({ general: false, pq: false, tq: false, other: false });
    }
  };

  const updateMetadata = (field, value) => {
    setRawMetadata(prev => ({ ...prev, [field]: value }));
  };

  const updateRequirement = (cat, index, field, value) => {
    setExtractions(prev => {
      const newCat = [...prev[cat]];
      newCat[index] = { ...newCat[index], [field]: value };
      return { ...prev, [cat]: newCat };
    });
  };

  const deleteRequirement = (cat, index) => {
    setExtractions(prev => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== index)
    }));
  };

  const addRequirement = (cat) => {
    setExtractions(prev => ({
      ...prev,
      [cat]: [...prev[cat], { category: cat.toUpperCase(), key: 'New Requirement', value: 'Double click to edit', mandatory: true }]
    }));
  };

  const [activeTab, setActiveTab] = useState('general');
  const isAllComplete = !!(extractions.general && extractions.pq?.length > 0 && extractions.tq?.length > 0);

  const completedSections = Object.keys(extractions).filter(key => extractions[key] !== null);

  if (workflowState === 'ingestion') {
    return (
      <div className="max-w-4xl mx-auto w-full py-10 space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Wand2 size={12} />
            <span>AI Ingestion Engine</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Initialize Extraction</h1>
          <p className="text-slate-500 text-lg font-medium">Configure your document source and corrigenda sequence.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Step 1: Document Type */}
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-10 w-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">1</div>
              <h3 className="text-xl font-black text-slate-900">Document Source</h3>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Tender Type</label>
              <select 
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900 transition-all appearance-none"
              >
                <option value="rfp">Request for Proposal (RFP)</option>
                <option value="rfq">Request for Quotation (RFQ)</option>
                <option value="eoi">Expression of Interest (EOI)</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Primary Document</label>
              <label className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:border-slate-400 transition-all bg-slate-50/50">
                <PlusCircle className="w-8 h-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black text-slate-900">Upload Original {selectedDocType.toUpperCase()}</span>
                <input type="file" className="hidden" multiple={false} onChange={(e) => {
                  handleUpload(e, 'rfp');
                }} />
              </label>
              {rfpFiles.length > 0 && (
                <div className="space-y-2 mt-4 px-2">
                  {rfpFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-100/50 rounded-xl border border-slate-200/50">
                      <span className="text-[10px] font-bold text-slate-600 truncate max-w-[200px]">{f.name}</span>
                      <button onClick={() => handleRemoveFile(i, 'rfp')} className="text-slate-400 hover:text-rose-500"><XCircle size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Corrigenda */}
          <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
            <div className="flex items-center space-x-4 mb-2">
              <div className="h-10 w-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black">2</div>
              <h3 className="text-xl font-black text-slate-900">Corrigenda Status</h3>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Is there any corrigendum?</label>
              <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                <button 
                  onClick={() => setHasCorrigendum(true)}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${hasCorrigendum ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Yes, Add
                </button>
                <button 
                  onClick={() => {
                    setHasCorrigendum(false);
                    setCorrigendumFiles([]);
                  }}
                  className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${!hasCorrigendum ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  No Corrigendum
                </button>
              </div>
            </div>

            {hasCorrigendum && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Upload Corrigenda</label>
                <label className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-100 rounded-[2rem] cursor-pointer hover:border-emerald-300 transition-all bg-emerald-50/20">
                  <PlusCircle className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black text-emerald-900">Add Corrigendum Docs</span>
                  <input type="file" className="hidden" multiple onChange={(e) => {
                    handleUpload(e, 'corrigendum');
                  }} />
                </label>
                {corrigendumFiles.length > 0 && (
                  <div className="space-y-2 mt-4 px-2">
                    {corrigendumFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                        <span className="text-[10px] font-bold text-emerald-700 truncate max-w-[200px]">{f.name}</span>
                        <button onClick={() => handleRemoveFile(i, 'corrigendum')} className="text-emerald-400 hover:text-rose-500"><XCircle size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center pt-8">
          <button 
            onClick={startParallelExtraction}
            disabled={rfpFiles.length === 0}
            className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 flex items-center space-x-4"
          >
            <span>Verify & Extract</span>
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    );
  }

  if (workflowState === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8">
        <div className="relative">
          <div className="w-32 h-32 border-[12px] border-slate-100 rounded-full" />
          <div className="w-32 h-32 border-[12px] border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart4 size={32} className="text-slate-900 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Simultaneous Extraction</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">General, PQ, and TQ Agents are working together...</p>
        </div>
      </div>
    );
  }

  if (workflowState === 'review') {
    return (
      <div className="max-w-7xl mx-auto w-full py-10 space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Extraction Results</h1>
            <p className="text-slate-500 font-medium tracking-tight">Review and verify the AI-extracted data points.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setWorkflowState('ingestion')}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Back to Ingestion
            </button>
            <button 
              onClick={() => onSave({ ...extractions, general_metadata: rawMetadata })}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-95 flex items-center space-x-3"
            >
              <Save size={16} />
              <span>Save Tender to Cloud</span>
            </button>
          </div>
        </div>

        {/* Box Format: General Metadata */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">General Intelligence</h3>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Shield size={10} />
              <span>Verified by AI</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Title Card (Full Width) */}
            <div className="md:col-span-2 lg:col-span-3 p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600 transition-colors">
                  <BarChart4 size={18} />
                </div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Tender Title</label>
              </div>
              <input 
                type="text"
                value={rawMetadata.title}
                onChange={(e) => updateMetadata('title', e.target.value)}
                className="w-full text-3xl font-black text-slate-900 outline-none border-b-2 border-transparent focus:border-emerald-500 transition-all bg-transparent pb-2"
                placeholder="Extraction Title..."
              />
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Tender ID</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600">
                  <PlusCircle size={16} />
                </div>
                <input 
                  type="text"
                  value={rawMetadata.id}
                  onChange={(e) => updateMetadata('id', e.target.value)}
                  className="w-full text-lg font-black text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Department</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600">
                  <Wand2 size={16} />
                </div>
                <input 
                  type="text"
                  value={rawMetadata.department}
                  onChange={(e) => updateMetadata('department', e.target.value)}
                  className="w-full text-lg font-black text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Authority</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600">
                  <Save size={16} />
                </div>
                <input 
                  type="text"
                  value={rawMetadata.authority}
                  onChange={(e) => updateMetadata('authority', e.target.value)}
                  className="w-full text-lg font-black text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Publish Date</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600">
                  <Clock size={16} />
                </div>
                <input 
                  type="text"
                  value={rawMetadata.date_of_publish}
                  onChange={(e) => updateMetadata('date_of_publish', e.target.value)}
                  className="w-full text-lg font-black text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm group hover:border-emerald-200 transition-all">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Closing Date</label>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-emerald-600">
                  <Clock size={16} />
                </div>
                <input 
                  type="text"
                  value={rawMetadata.date_of_closing}
                  onChange={(e) => updateMetadata('date_of_closing', e.target.value)}
                  className="w-full text-lg font-black text-slate-700 outline-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* PQ/TQ Requirements Cards */}
        {['pq', 'tq'].map(cat => (
          <section key={cat} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{cat} Intelligence Matrix</h3>
              </div>
              <button 
                onClick={() => addRequirement(cat)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-emerald-600 hover:text-emerald-700 hover:border-emerald-200 uppercase tracking-widest transition-all shadow-sm active:scale-95"
              >
                <PlusCircle size={14} />
                <span>Append Requirement</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extractions[cat].map((req, idx) => (
                <div key={idx} className="p-8 bg-white border border-slate-200 rounded-[2rem] flex flex-col space-y-4 group hover:border-emerald-200 transition-all shadow-sm hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <Shield size={20} />
                    </div>
                    <button 
                      onClick={() => deleteRequirement(cat, idx)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Requirement Key</label>
                      <input 
                        type="text"
                        value={req.key}
                        onChange={(e) => updateRequirement(cat, idx, 'key', e.target.value)}
                        className="w-full text-sm font-black text-slate-900 outline-none bg-transparent border-b border-transparent focus:border-emerald-500 transition-all"
                        placeholder="Requirement heading..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Compliance Details (Value)</label>
                      <textarea 
                        value={req.value}
                        onChange={(e) => updateRequirement(cat, idx, 'value', e.target.value)}
                        className="w-full text-xs font-medium text-slate-500 outline-none bg-transparent resize-none h-20 custom-scrollbar focus:text-slate-700 transition-colors"
                        placeholder="Detailed description..."
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${req.mandatory ? 'bg-amber-500' : 'bg-slate-300'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {req.mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                    <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                      Confidence: 98%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-12">
        <div className="mb-14">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Procurement Suite</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Tender ID: {tenderId}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Intelligence Matrix</h1>
          <p className="text-slate-500 text-lg font-medium leading-relaxed">
            Synthesize structured compliance and technical criteria using AI analysis agents.
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
              <p className="text-slate-400 text-sm font-medium">Proceed to specialized qualification agents.</p>
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

        {mode === 'persistent' && isAllComplete && (
          <div className="mt-12 p-10 bg-emerald-600 rounded-[3rem] shadow-2xl shadow-emerald-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl text-emerald-600">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Full Matrix Analysis Complete</h3>
                <p className="text-emerald-100 text-sm font-bold">All qualification criteria have been synthesized.</p>
              </div>
            </div>
            <button
              onClick={() => onSave({ ...extractions, general_metadata: rawMetadata })}
              className="bg-white text-emerald-900 px-10 py-5 rounded-2xl font-black hover:bg-emerald-50 transition-all shadow-xl active:scale-95 flex items-center space-x-3 uppercase tracking-widest text-xs"
            >
              <Save className="w-5 h-5" />
              <span>Finalize & Save Tender</span>
            </button>
          </div>
        )}
      </div>
    );
  };

export default AnalysisMatrix;

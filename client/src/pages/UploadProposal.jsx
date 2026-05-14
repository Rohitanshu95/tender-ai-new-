import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ArrowLeft, Upload, FileText, X, CheckCircle2, Loader2, Plus
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const UploadProposal = ({ onBack, onSave }) => {
  const [tenders, setTenders] = useState([]);
  const [selectedTender, setSelectedTender] = useState('');
  const [bidderName, setBidderName] = useState('');
  const [proposalType, setProposalType] = useState('Technical');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingTenders, setLoadingTenders] = useState(true);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tenders`);
        setTenders(response.data);
        setLoadingTenders(false);
      } catch (err) {
        console.error("Failed to fetch tenders", err);
      }
    };
    fetchTenders();
  }, []);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTender || !bidderName || files.length === 0) {
      alert("Please fill all fields and select at least one file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('tenderId', selectedTender);
    formData.append('bidderName', bidderName);
    formData.append('proposalType', proposalType);
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      await axios.post(`${API_BASE_URL}/bidders/upload-proposal`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onSave(); // Redirect back to Proposals list
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed. Please check backend logs.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
            <button onClick={onBack} className="hover:text-slate-900 transition-colors">Proposals</button>
            <ChevronRight size={12} />
            <span className="text-slate-600">Upload Proposals</span>
          </div>

          {/* Header Section */}
          <div className="flex items-center space-x-4 mb-12">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Upload Proposals</h1>
              <p className="text-slate-500 font-normal italic">Upload bidder proposals for evaluation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs">1</div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Select Tender</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Active Tenders</label>
                    <select 
                      value={selectedTender}
                      onChange={(e) => setSelectedTender(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                      disabled={loadingTenders}
                    >
                      <option value="">Select a tender...</option>
                      {tenders.map(t => (
                        <option key={t._id} value={t.tenderId}>{t.tenderId} - {t.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-8 w-8 bg-orange-600 text-white rounded-xl flex items-center justify-center font-bold text-xs">2</div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Upload Bidder Proposals</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Bidder Name</label>
                      <input 
                        type="text"
                        placeholder="Enter bidder company name..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        value={bidderName}
                        onChange={(e) => setBidderName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Proposal Type</label>
                      <select 
                        value={proposalType}
                        onChange={(e) => setProposalType(e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                      >
                        <option value="PQ">Pre-Qualification (PQ)</option>
                        <option value="Technical">Technical Proposal</option>
                        <option value="Financial">Financial Proposal</option>
                        <option value="General">Other Documents</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Documents</label>
                    <label className="group flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:border-orange-400 transition-all bg-slate-50/50 hover:bg-orange-50/10">
                      <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-orange-600" />
                      </div>
                      <span className="text-sm font-black text-slate-900 tracking-tight">Drag & Drop files here</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">or click to browse local storage</span>
                      <input type="file" className="hidden" multiple onChange={handleFileChange} />
                    </label>
                  </div>
                </div>

                <div className="pt-10">
                  <button 
                    onClick={handleSubmit}
                    disabled={isUploading || !selectedTender || !bidderName || files.length === 0}
                    className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-orange-100 hover:bg-orange-500 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Uploading Documents...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>Add to Upload Queue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Queue Sidebar */}
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Upload Queue</h3>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black">{files.length} Files</span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                  {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                      <FileText size={48} className="text-slate-200" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">No files in queue</p>
                    </div>
                  ) : (
                    files.map((file, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-right-2">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="h-8 w-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-800 truncate">{file.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadProposal;

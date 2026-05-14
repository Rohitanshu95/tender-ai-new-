import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, Eye, RefreshCw, Wand2, Search, Filter, Info, ArrowLeft,
  X, Plus, Upload, CheckCircle2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIConfigure = ({ onView, onBack, onGenerate }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Regeneration Flow States
  const [regenTender, setRegenTender] = useState(null);
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [step, setStep] = useState('question'); // 'question' | 'upload'
  const [newCorrigenda, setNewCorrigenda] = useState([]);

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/tenders');
        setTenders(res.data);
      } catch (err) {
        console.error("Failed to fetch tenders for configuration", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  const filteredTenders = tenders.filter(t => 
    (t.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.tenderId || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegenClick = (tender) => {
    setRegenTender(tender);
    setStep('question');
    setNewCorrigenda([]);
    setShowRegenModal(true);
  };

  const handleUploadCorrigenda = (e) => {
    const files = Array.from(e.target.files);
    if (newCorrigenda.length + files.length > 15) {
      alert("Maximum 15 corrigenda can be added.");
      return;
    }
    setNewCorrigenda(prev => [...prev, ...files]);
  };

  const removeCorrigendum = (index) => {
    setNewCorrigenda(prev => prev.filter((_, i) => i !== index));
  };

  const proceedWithGeneration = () => {
    onGenerate(regenTender, newCorrigenda);
    setShowRegenModal(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#fcfcfd] custom-scrollbar">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">Configure</span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Configure Tenders</h1>
              <p className="text-slate-500 font-medium tracking-tight italic">Generate AI-driven evaluation templates for procurement</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs font-bold text-slate-400 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
            <Info size={14} className="text-blue-500" />
            <span>Templates are used to score technical compliance automatically</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-orange-600">
                <Wand2 size={18} />
              </div>
              <h3 className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Tender Repository</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter tenders..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-500 transition-all w-48 shadow-sm outline-none"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-50">
                  <th className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tender ID</th>
                  <th className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center">Config Status</th>
                  <th className="px-8 py-5 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      Loading real data...
                    </td>
                  </tr>
                ) : filteredTenders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                      No matching tenders found
                    </td>
                  </tr>
                ) : filteredTenders.map((tender, idx) => (
                  <motion.tr 
                    key={tender._id || tender.tenderId} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-slate-900">{tender.tenderId}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{tender.title}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-tight border ${
                        tender.hasTemplate 
                          ? 'bg-orange-50 text-orange-600 border-orange-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {tender.hasTemplate ? 'Template Active' : 'Pending Config'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {tender.hasTemplate ? (
                          <>
                            <button 
                              onClick={() => onView(tender)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm"
                            >
                              <Eye size={14} />
                              <span>View Template</span>
                            </button>
                            <button 
                              onClick={() => handleRegenClick(tender)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm"
                            >
                              <RefreshCw size={14} />
                              <span>Regenerate</span>
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => onGenerate(tender)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl text-[11px] font-semibold shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all active:scale-95 uppercase tracking-widest"
                          >
                            <Wand2 size={14} />
                            <span>Generate Template</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-slate-50/30 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {filteredTenders.length} entries</span>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronRight size={16} className="rotate-180" /></button>
                <div className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white text-xs font-black rounded-lg shadow-lg">1</div>
                <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Regeneration Flow Modal */}
        <AnimatePresence>
          {showRegenModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
              >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-orange-600">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Regenerate Template</h3>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{regenTender?.tenderId}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRegenModal(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-10">
                  {step === 'question' ? (
                    <div className="space-y-8 text-center">
                      <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-orange-500" />
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-2xl font-semibold text-slate-800">Any other corrigenda to add?</h4>
                        <p className="text-slate-500 font-medium italic">We will use the existing {regenTender?.tenderType || 'RFP'} as the constant source.</p>
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <button 
                          onClick={proceedWithGeneration}
                          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-semibold hover:bg-slate-200 transition-all active:scale-95"
                        >
                          No, Use Existing
                        </button>
                        <button 
                          onClick={() => setStep('upload')}
                          className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-semibold shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all active:scale-95"
                        >
                          Yes, Add More
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] px-1">Corrigenda Sequence (Max 15)</label>
                        <label className="group flex flex-col items-center justify-center p-10 border-2 border-dashed border-orange-100 rounded-[2rem] cursor-pointer hover:border-orange-300 transition-all bg-orange-50/20">
                          <Upload className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-semibold text-orange-900">Add Corrigendum Documents</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            onChange={handleUploadCorrigenda}
                            accept=".pdf"
                          />
                        </label>
                      </div>

                      {newCorrigenda.length > 0 && (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar px-1">
                          {newCorrigenda.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center space-x-3">
                                <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-semibold text-slate-700 truncate max-w-[280px]">{f.name}</span>
                              </div>
                              <button onClick={() => removeCorrigendum(i)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-4">
                        <button 
                          onClick={() => setStep('question')}
                          className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-semibold hover:border-slate-400 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          onClick={proceedWithGeneration}
                          disabled={newCorrigenda.length === 0}
                          className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-semibold shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
                        >
                          <Wand2 size={18} />
                          <span>Generate with Updates</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIConfigure;

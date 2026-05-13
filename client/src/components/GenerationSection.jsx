import React from 'react';
import { Play, Loader2, FileCheck, AlertCircle, Shield, Info, ClipboardList, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GenerationSection = ({ type, data, isGenerating, onGenerate, error }) => {
  const getAgentConfig = () => {
    switch (type) {
      case 'general': return { title: "General Intelligence", icon: Info, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
      case 'pq': return { title: "Eligibility Audit", icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
      case 'tq': return { title: "Technical Evaluation", icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
      default: return { title: "Compliance Review", icon: ClipboardList, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
  };

  const config = getAgentConfig();
  const Icon = config.icon;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-[500px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />
            
            <div className="relative flex flex-col items-center">
              <div className="relative mb-8">
                <div className={`absolute inset-0 ${config.bg} rounded-full animate-ping opacity-20`} />
                <div className={`relative ${config.bg} p-6 rounded-3xl shadow-inner border ${config.border}`}>
                  <Loader2 className={`w-12 h-12 ${config.color} animate-spin`} />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {config.title} in Progress
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-slate-500 font-medium text-sm">LLM is parsing complex clauses...</p>
                </div>
              </div>
            </div>

            {/* Simulated Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100">
              <motion.div 
                className={`h-full ${config.bg.replace('bg-', 'bg-').split('-')[1] === 'emerald' ? 'bg-emerald-500' : 'bg-slate-900'}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 15, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        ) : data ? (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-3">
                <div className={`${config.bg} p-2 rounded-lg`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{config.title} Results</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Analysis Complete • {data.length} Requirements found</p>
                </div>
              </div>
              
              <button 
                onClick={onGenerate}
                className="group flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all"
              >
                <div className="p-1.5 rounded-md border border-slate-200 group-hover:border-slate-400 group-hover:bg-slate-50">
                  <Play className="w-3 h-3 fill-slate-400 group-hover:fill-slate-900 transition-all" />
                </div>
                <span>Refine Analysis</span>
              </button>
            </div>

            {type === 'pq' ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Sl#</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Requirement</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Requirement</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.map((req, idx) => (
                      <motion.tr 
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-emerald-50/30 transition-colors group"
                      >
                        <td className="px-6 py-5 align-top">
                          <span className="text-xs font-black text-slate-300 group-hover:text-emerald-500 transition-colors font-mono">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-tight rounded-md group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                            {req.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <p className="text-sm font-bold text-slate-900 leading-snug max-w-xs">
                            {req.requirement}
                          </p>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start space-x-2">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                              {req.description}
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : type === 'general' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.map((field, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`space-y-2 ${field.requirement.length > 50 ? 'md:col-span-2' : ''}`}
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{field.category}</label>
                    <div className="group relative bg-white border border-slate-200 rounded-3xl p-6 hover:border-emerald-300 transition-all shadow-sm shadow-slate-100/50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <textarea 
                            defaultValue={field.requirement} 
                            className="w-full bg-transparent border-none p-0 text-sm font-bold text-slate-900 focus:ring-0 resize-none min-h-[40px] custom-scrollbar"
                            rows={field.requirement.length > 50 ? 3 : 1}
                          />
                        </div>
                        <Target size={14} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                      </div>
                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                        <div className="flex items-center space-x-2">
                          <Info size={12} className="text-slate-300" />
                          <span className="text-[10px] text-slate-400 font-medium italic">{field.description}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[9px] font-black uppercase tracking-tight">
                          Auto-Extracted
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {data.map((req, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/5 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-emerald-500 transition-all" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-1 ${config.bg} ${config.color} text-[10px] font-black uppercase tracking-widest rounded-md border ${config.border}`}>
                          {req.category || 'General'}
                        </span>
                        {req.mandatory && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-rose-100">
                            Critical
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 font-mono">#{idx + 1}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-emerald-950 transition-colors">
                        {req.requirement}
                      </h4>
                      {req.description && (
                        <div className="flex items-start space-x-2">
                          <div className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                          <p className="text-xs text-slate-500 leading-relaxed font-medium italic">
                            {req.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 border-dashed p-12 text-center"
          >
            <div className={`mb-8 p-6 ${config.bg} rounded-3xl relative`}>
              <Icon className={`w-10 h-10 ${config.color}`} />
              <div className={`absolute -bottom-1 -right-1 p-1 bg-white rounded-full border border-slate-100`}>
                <div className={`w-2 h-2 rounded-full ${config.bg.replace('bg-', 'bg-').split('-')[1] === 'emerald' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Ready for {config.title}</h3>
            <p className="text-slate-500 max-w-sm mb-10 text-sm font-medium leading-relaxed">
              Launch our AI agent to parse the specific requirements from your RFP and Corrigendum documents.
            </p>
            
            <button
              onClick={onGenerate}
              className={`flex items-center space-x-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-slate-200 transition-all active:scale-95 group`}
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-125 transition-transform" />
              <span>Initialize Extraction</span>
            </button>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center space-x-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">{error}</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenerationSection;

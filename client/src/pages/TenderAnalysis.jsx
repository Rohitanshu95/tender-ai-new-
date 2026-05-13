import React from 'react';
import { 
  PlusCircle, ArrowLeft, ChevronRight
} from 'lucide-react';
import AnalysisMatrix from '../components/AnalysisMatrix';

const TenderAnalysis = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex flex-col justify-center px-10 sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={10} />
          <span className="text-slate-600">Analysis Matrix</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <PlusCircle className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Intelligence Dashboard</h2>
            </div>
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
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <AnalysisMatrix mode="ephemeral" />
      </div>
    </div>
  );
};

export default TenderAnalysis;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ArrowRight, RefreshCw, CheckCircle2, AlertCircle, Clock, 
  BarChart3, ShieldCheck, DollarSign, Search, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const Evaluations = ({ onEvaluate, onBack }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/evaluations/status`);
        setTenders(response.data);
      } catch (err) {
        console.error("Failed to fetch evaluation statuses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'In Progress': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const filteredTenders = tenders.filter(t => 
    t.tenderId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
            <span>Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-slate-600">Evaluations Hub</span>
          </div>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-6">
              <button 
                onClick={onBack}
                className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Evaluations</h1>
                <p className="text-slate-500 font-medium italic">Track and manage tender evaluation progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search Tenders..."
                  className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none w-[300px] shadow-sm transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Evaluation Data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredTenders.map((tender) => (
                <div key={tender._id} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                        <BarChart3 className="w-8 h-8 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-black text-slate-900 tracking-tight">{tender.tenderId}</span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center space-x-2 ${getStatusColor(tender.status)}`}>
                            {getStatusIcon(tender.status)}
                            <span>{tender.status}</span>
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 line-clamp-1">{tender.title}</h3>
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{tender.organization} • {tender.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      {/* Progress Steps */}
                      <div className="flex items-center space-x-4 px-8 border-x border-slate-100">
                        {/* PQ Step */}
                        <div className="flex flex-col items-center space-y-2">
                          <ShieldCheck 
                            size={20} 
                            className={
                              tender.status === 'Completed' || (tender.currentStage !== 'PQ' && tender.status !== 'Yet to Complete')
                                ? 'text-emerald-500 opacity-100' 
                                : tender.currentStage === 'PQ' && tender.status === 'In Progress'
                                  ? 'text-orange-500 opacity-100'
                                  : 'text-slate-300 opacity-40'
                            } 
                          />
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${tender.currentStage === 'PQ' ? 'text-slate-900' : 'text-slate-400'}`}>PQ</span>
                        </div>
                        
                        <div className="w-8 h-[1px] bg-slate-100" />
                        
                        {/* TQ Step */}
                        <div className="flex flex-col items-center space-y-2">
                          <RefreshCw 
                            size={20} 
                            className={
                              tender.status === 'Completed' || (tender.currentStage === 'Financial' || tender.currentStage === 'Completed')
                                ? 'text-emerald-500 opacity-100' 
                                : tender.currentStage === 'TQ'
                                  ? 'text-orange-500 opacity-100 animate-spin-slow'
                                  : 'text-slate-300 opacity-40'
                            } 
                          />
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${tender.currentStage === 'TQ' ? 'text-slate-900' : 'text-slate-400'}`}>TQ</span>
                        </div>
                        
                        <div className="w-8 h-[1px] bg-slate-100" />
                        
                        {/* FIN Step */}
                        <div className="flex flex-col items-center space-y-2">
                          <DollarSign 
                            size={20} 
                            className={
                              tender.status === 'Completed'
                                ? 'text-emerald-500 opacity-100' 
                                : tender.currentStage === 'Financial'
                                  ? 'text-orange-500 opacity-100'
                                  : 'text-slate-300 opacity-40'
                            } 
                          />
                          <span className={`text-[9px] font-black uppercase tracking-tighter ${tender.currentStage === 'Financial' ? 'text-slate-900' : 'text-slate-400'}`}>FIN</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {tender.status === 'Completed' ? (
                          <button 
                            onClick={() => onEvaluate(tender, true)}
                            className="flex items-center space-x-2 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                          >
                            <RefreshCw size={14} />
                            <span>Reevaluate</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => onEvaluate(tender, false)}
                            className="flex items-center space-x-3 px-8 py-4 bg-orange-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-100 hover:bg-orange-500 transition-all active:scale-95"
                          >
                            <span>{tender.status === 'In Progress' ? 'Continue Evaluation' : 'Start Evaluation'}</span>
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Evaluations;

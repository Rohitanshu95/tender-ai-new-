import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, Eye, RefreshCw, Wand2, Search, Filter, Info, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

const AIConfigure = ({ onView, onBack, onGenerate }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Configure Tenders</h1>
              <p className="text-slate-500 font-medium tracking-tight">Generate AI-driven evaluation templates for tenders</p>
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
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm text-emerald-600">
                <Wand2 size={18} />
              </div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">Tender List</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter tenders..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-slate-900 transition-all w-48 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tender ID</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Configuration Status</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
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
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                        tender.hasTemplate 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                        {tender.hasTemplate ? 'Template Generated' : 'Not Configured'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        {tender.hasTemplate ? (
                          <>
                            <button 
                              onClick={() => onView(tender)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all"
                            >
                              <Eye size={14} />
                              <span>View Template</span>
                            </button>
                            <button 
                              onClick={() => onGenerate(tender)}
                              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-all"
                            >
                              <RefreshCw size={14} />
                              <span>Regenerate</span>
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => onGenerate(tender)}
                            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[11px] font-black shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest"
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
      </div>
    </div>
  );
};

export default AIConfigure;

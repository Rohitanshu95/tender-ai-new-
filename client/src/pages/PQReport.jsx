import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Download, ArrowRight, CheckCircle2, XCircle, 
  FileText, Calendar, User, LayoutDashboard, Printer
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const PQReport = ({ tenderId, onProceed, onBack }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/evaluations/${encodeURIComponent(tenderId)}`);
        setEvaluation(res.data);
      } catch (err) {
        console.error("Error fetching evaluation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [tenderId]);

  if (loading) return <div>Loading...</div>;

  const bidders = evaluation?.pqResults?.bidders || [];
  const qualified = bidders.filter(b => b.decision === 'accept');
  const disqualified = bidders.filter(b => b.decision === 'reject');

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10 shrink-0">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={10} />
          <span>Evaluate PQ</span>
          <ChevronRight size={10} />
          <span className="text-slate-600">PQ Report</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">PQ Evaluation Report</h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.print()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-slate-50 transition-all"
            >
              <Printer size={14} />
              <span>Export PDF / Print</span>
            </button>
            <button 
              onClick={onProceed}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-orange-100 hover:bg-orange-500 transition-all"
            >
              <span>Proceed to TQ Evaluation</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tender ID: {tenderId}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Bidders</span>
              <span className="text-4xl font-black text-slate-900">{bidders.length}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Qualified</span>
              <span className="text-4xl font-black text-emerald-500">{qualified.length}</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col items-center text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Disqualified</span>
              <span className="text-4xl font-black text-rose-500">{disqualified.length}</span>
            </div>
          </div>

          {/* Qualified Bidders List */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center space-x-3">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Qualified Bidders</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Compliance Score</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {qualified.map(b => (
                    <tr key={b.bidderId}>
                      <td className="px-8 py-5 text-xs font-bold text-slate-700">{b.name}</td>
                      <td className="px-8 py-5 text-xs font-bold text-emerald-600">100%</td>
                      <td className="px-8 py-5 text-right">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">Qualified</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Disqualified Bidders List */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center space-x-3">
              <XCircle className="text-rose-500" size={20} />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Disqualified Bidders</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Reason for Disqualification</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {disqualified.map(b => (
                    <tr key={b.bidderId}>
                      <td className="px-8 py-5 text-xs font-bold text-slate-700">{b.name}</td>
                      <td className="px-8 py-5 text-xs font-medium text-slate-400 italic">Failed Mandatory Document Check</td>
                      <td className="px-8 py-5 text-right">
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase">Disqualified</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Report Footer/Details */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Report Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Calendar className="text-slate-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Evaluation Date</p>
                  <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <User className="text-slate-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Evaluated By</p>
                  <p className="text-sm font-bold text-slate-700">Rajesh Kumar (Admin Officer)</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <Printer className="text-slate-400" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Evaluation Method</p>
                  <p className="text-sm font-bold text-slate-700">AI-Assisted Manual Review</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <LayoutDashboard className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-400 uppercase">Next Stage</p>
                  <p className="text-sm font-bold text-orange-600">Technical Qualification Evaluation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PQReport;

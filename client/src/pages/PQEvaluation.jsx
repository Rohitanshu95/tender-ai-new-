import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, CheckCircle2, XCircle, ShieldCheck, 
  FileText, ArrowRight, Save, User
} from 'lucide-react';
import axios from 'axios';

const PQEvaluation = ({ tenderId = "1", onComplete }) => {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/evaluations/bidders/${tenderId}`);
        // Map backend decision if exists, else default to 'reject'
        setBidders(res.data.map(b => ({
          ...b,
          decision: b.pqDecision || 'reject'
        })));
      } catch (err) {
        console.error("Error fetching bidders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBidders();
  }, [tenderId]);

  const toggleDecision = async (id) => {
    const bidder = bidders.find(b => b._id === id);
    const newDecision = bidder.decision === 'accept' ? 'reject' : 'accept';
    
    try {
      // Save to backend
      await axios.post(`http://localhost:5001/api/evaluations/evaluate`, {
        tenderId,
        bidderId: id,
        stage: 'PQ',
        decision: newDecision,
        evaluatorId: 'admin' // Placeholder
      });

      setBidders(prev => prev.map(b => 
        b._id === id ? { ...b, decision: newDecision } : b
      ));
    } catch (err) {
      console.error("Error saving decision:", err);
    }
  };

  const qualifiedCount = bidders.filter(b => b.decision === 'accept').length;
  const disqualifiedCount = bidders.length - qualifiedCount;

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd]">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <span>Dashboard</span>
          <ChevronRight size={10} />
          <span className="text-slate-600">Evaluate PQ</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pre-Qualification (PQ) Evaluation</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-100 shadow-sm">
            <ShieldCheck size={14} />
            <span>AI-Assisted Evaluation</span>
          </button>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Tender ID: {tenderId}</p>
      </header>

      <div className="p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Bidder Data...</p>
          </div>
        ) : bidders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No Bidders Found</h3>
            <p className="text-slate-500 text-sm font-medium">Please add bidders to this tender to begin the evaluation.</p>
          </div>
        ) : (
          <>
            {/* AI Notification */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 flex items-start space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-purple-900 mb-1">AI Evaluation Complete</h4>
                <p className="text-xs text-purple-700 font-medium leading-relaxed">
                  AI has analyzed all bidder documents and scored them against PQ criteria. Review and modify the recommendations below if needed.
                </p>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">PQ Criteria Evaluation Matrix</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Registration</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Financials</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Experience</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Compliance</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">AI Rec</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bidders.map((bidder) => (
                      <tr key={bidder._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black bg-orange-100 text-orange-600`}>
                              {(bidder.name || "B").charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{bidder.name || "Unknown Bidder"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          {bidder.metadata?.criteria?.registration ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {bidder.metadata?.criteria?.financial ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {bidder.metadata?.criteria?.experience ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {bidder.metadata?.criteria?.compliance ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase mb-1 ${bidder.aiRecommendation === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                              {bidder.aiRecommendation || 'Unknown'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400">{bidder.confidence || 0}% confidence</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <span className={`text-[10px] font-black uppercase tracking-tight ${bidder.decision === 'accept' ? 'text-slate-900' : 'text-slate-400'}`}>
                              {bidder.decision === 'accept' ? 'Accept' : 'Reject'}
                            </span>
                            <button 
                              onClick={() => toggleDecision(bidder._id)}
                              className={`w-12 h-6 rounded-full transition-all relative ${bidder.decision === 'accept' ? 'bg-slate-900' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${bidder.decision === 'accept' ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-blue-50/50 border-t border-slate-100 flex items-center space-x-3 mx-8 my-6 rounded-2xl">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">Evaluation Summary</span>
                <span className="text-xs text-blue-700 font-medium">
                  {qualifiedCount} bidders qualified • {disqualifiedCount} bidders disqualified
                </span>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
            Save as Draft
          </button>
          <button 
            onClick={onComplete}
            className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black hover:bg-orange-500 transition-all uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 flex items-center space-x-3"
          >
            <span>Complete PQ Evaluation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PQEvaluation;

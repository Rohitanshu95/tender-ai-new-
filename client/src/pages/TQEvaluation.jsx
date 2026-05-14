import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, Star, ShieldCheck, 
  ArrowRight, Save, User, BarChart4
} from 'lucide-react';

const TQEvaluation = ({ tenderId = "1", onComplete }) => {
  const [evaluatorName, setEvaluatorName] = useState("");
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQualifiedBidders = async () => {
      try {
        // Fetch evaluations with 'accept' decision to get qualified bidders
        const res = await axios.get(`http://localhost:5001/api/evaluations/evaluations?tenderId=${tenderId}&stage=PQ`);
        const qualified = res.data
          .filter(ev => ev.decision === 'accept')
          .map(ev => ({
            ...ev.bidderId,
            scores: ev.bidderId.metadata?.scores || { technical: 0, timeline: 0, qa: 0, resource: 0, safety: 0 },
            aiScores: ev.bidderId.metadata?.aiScores || { technical: 0, timeline: 0, qa: 0, resource: 0, safety: 0 }
          }));
        setBidders(qualified);
      } catch (err) {
        console.error("Error fetching qualified bidders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQualifiedBidders();
  }, [tenderId]);

  const weights = { technical: 0.3, timeline: 0.2, qa: 0.25, resource: 0.15, safety: 0.1 };

  const calculateWeightedScore = (scores) => {
    return Object.keys(scores).reduce((total, key) => total + (scores[key] * weights[key]), 0).toFixed(1);
  };

  const handleScoreChange = (bidderId, criteria, val) => {
    setBidders(prev => prev.map(b => 
      b._id === bidderId ? { ...b, scores: { ...b.scores, [criteria]: parseInt(val) || 0 } } : b
    ));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd]">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <span>Dashboard</span>
          <ChevronRight size={10} />
          <span className="text-slate-600">Evaluate TQ</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Technical Qualification (TQ) Evaluation</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-purple-100 shadow-sm">
            <ShieldCheck size={14} />
            <span>AI-Assisted Scoring</span>
          </button>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Tender ID: {tenderId}</p>
      </header>

      <div className="p-10 max-w-7xl mx-auto w-full space-y-8">
        {/* Loading / Empty States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Qualified Bidders...</p>
          </div>
        ) : bidders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
            <BarChart4 className="w-12 h-12 text-slate-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-slate-900 mb-2">No Qualified Bidders</h3>
            <p className="text-slate-500 text-sm font-medium">No bidders have passed the PQ stage yet. Complete PQ evaluation first.</p>
          </div>
        ) : (
          <>
            {/* AI Notification */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 flex items-start space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-purple-900 mb-1">AI Scoring Complete</h4>
                <p className="text-xs text-purple-700 font-medium leading-relaxed">
                  AI has evaluated technical proposals against TQ criteria. Review and adjust scores if needed.
                </p>
              </div>
            </div>

            {/* Scoring Matrix */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">TQ Scoring Matrix</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User size={14} className="text-slate-400" />
                    <input 
                      type="text" 
                      value={evaluatorName} 
                      onChange={(e) => setEvaluatorName(e.target.value)}
                      className="text-xs font-bold text-slate-900 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg focus:outline-none focus:border-slate-300"
                      placeholder="Evaluator Name"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder</th>
                      {Object.keys(weights).map(key => (
                        <th key={key} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                          <br /><span className="text-purple-400 font-bold lowercase">({weights[key]*100}%)</span>
                        </th>
                      ))}
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {bidders.map((bidder) => (
                      <tr key={bidder._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-black">
                              {(bidder.name || "B").charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{bidder.name || "Unknown Bidder"}</span>
                          </div>
                        </td>
                        {Object.keys(weights).map(key => (
                          <td key={key} className="px-6 py-6 text-center">
                            <div className="inline-flex flex-col items-center">
                              <input 
                                type="number"
                                value={bidder.scores[key]}
                                onChange={(e) => handleScoreChange(bidder._id, key, e.target.value)}
                                className="w-16 px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 transition-all"
                              />
                              <span className="text-[8px] font-black text-purple-400 mt-1 uppercase">AI: {bidder.aiScores[key]}</span>
                            </div>
                          </td>
                        ))}
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-orange-600 tracking-tight">
                              {calculateWeightedScore(bidder.scores)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Technical Ranking */}
              <div className="p-8 bg-blue-50/30 border-t border-slate-100">
                <div className="flex items-center space-x-3 mb-6">
                  <BarChart4 className="w-5 h-5 text-blue-600" />
                  <h4 className="text-[10px] font-black text-blue-900 uppercase tracking-widest">Technical Ranking</h4>
                </div>
                <div className="space-y-3">
                  {[...bidders].sort((a, b) => calculateWeightedScore(b.scores) - calculateWeightedScore(a.scores)).map((bidder, idx) => (
                    <div key={bidder._id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Rank {idx + 1}</span>
                        <span className="text-xs font-bold text-slate-700">{bidder.name}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900">{calculateWeightedScore(bidder.scores)} points</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
            Save as Draft
          </button>
          <button 
            onClick={onComplete}
            className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black hover:bg-orange-500 transition-all uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 flex items-center space-x-3"
          >
            <span>Complete TQ Evaluation</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TQEvaluation;

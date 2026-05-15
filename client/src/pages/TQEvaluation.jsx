import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, Star, Plus, Minus, ShieldCheck, 
  ArrowRight, Save, User, BarChart4, Loader2, Trash2,
  Trophy, Medal, Target
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const TQEvaluation = ({ tenderId, onComplete }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState([]);
  const [newCriteriaName, setNewCriteriaName] = useState("");

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/evaluations/${tenderId}`);
        setEvaluation(res.data);
        
        const existingCriteria = res.data.tqResults?.criteria || ["Technical Methodology", "Project Timeline", "Quality Assurance"];
        setCriteria(existingCriteria);

        if (!res.data.tqResults?.bidders || res.data.tqResults.bidders.length === 0) {
          const qualifiedBidders = res.data.pqResults.bidders
            .filter(b => b.decision === 'accept')
            .map(b => ({
              bidderId: b.bidderId,
              name: b.name,
              scores: existingCriteria.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
              weightedScore: 0,
              rank: 0
            }));
          
          const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
            tenderId,
            stage: 'TQ',
            results: { criteria: existingCriteria, bidders: qualifiedBidders },
            status: 'In Progress'
          });
          setEvaluation(updatedEval.data);
        }
      } catch (err) {
        console.error("Error fetching TQ evaluation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [tenderId]);

  const addCriteria = () => {
    if (!newCriteriaName) return;
    const updatedCriteria = [...criteria, newCriteriaName];
    setCriteria(updatedCriteria);
    setNewCriteriaName("");
    
    const updatedBidders = evaluation.tqResults.bidders.map(b => ({
      ...b,
      scores: { ...b.scores, [newCriteriaName]: 0 }
    }));
    
    updateBackend(updatedCriteria, updatedBidders);
  };

  const removeCriteria = (name) => {
    const updatedCriteria = criteria.filter(c => c !== name);
    setCriteria(updatedCriteria);
    
    const updatedBidders = evaluation.tqResults.bidders.map(b => {
      const newScores = { ...b.scores };
      delete newScores[name];
      return { ...b, scores: newScores };
    });
    
    updateBackend(updatedCriteria, updatedBidders);
  };

  const handleScoreChange = (bidderId, critName, val) => {
    const score = parseInt(val) || 0;
    const updatedBidders = evaluation.tqResults.bidders.map(b => {
      if (b.bidderId === bidderId) {
        const newScores = { ...b.scores, [critName]: score };
        const total = Object.values(newScores).reduce((a, b) => a + b, 0);
        const weighted = (total / (Object.keys(newScores).length || 1)).toFixed(1);
        return { ...b, scores: newScores, weightedScore: weighted };
      }
      return b;
    });
    
    setEvaluation({ ...evaluation, tqResults: { ...evaluation.tqResults, bidders: updatedBidders } });
  };

  const updateBackend = async (updatedCriteria, updatedBidders) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        stage: 'TQ',
        results: { criteria: updatedCriteria, bidders: updatedBidders }
      });
      setEvaluation(res.data);
    } catch (err) {
      console.error("Failed to update backend:", err);
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        status: 'In Progress',
        currentStage: 'Financial'
      });
      onComplete();
    } catch (err) {
      console.error("Error completing TQ:", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading TQ Matrix...</p>
    </div>
  );

  const bidders = evaluation?.tqResults?.bidders || [];
  const sortedBidders = [...bidders].sort((a, b) => b.weightedScore - a.weightedScore);

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10 shrink-0">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <span>Dashboard</span>
          <ChevronRight size={10} />
          <span className="text-slate-600">Evaluate TQ</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Technical Qualification (TQ) Evaluation</h2>
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              placeholder="Add New Criteria..."
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none w-[200px]"
              value={newCriteriaName}
              onChange={(e) => setNewCriteriaName(e.target.value)}
            />
            <button 
              onClick={addCriteria}
              className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tender ID: {tenderId}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* Scoring Matrix */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">TQ Scoring Matrix</h3>
              <div className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <Target size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual Input Mode</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider min-w-[200px]">Bidder Name</th>
                    {criteria.map(c => (
                      <th key={c} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center group relative min-w-[150px]">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="truncate max-w-[120px]">{c}</span>
                          <button onClick={() => removeCriteria(c)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:scale-110">
                            <Minus size={12} />
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bidders.map((bidder) => (
                    <tr key={bidder.bidderId} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-black">
                            {bidder.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-700">{bidder.name}</span>
                        </div>
                      </td>
                      {criteria.map(c => (
                        <td key={c} className="px-6 py-6 text-center">
                          <input 
                            type="number"
                            max="100"
                            min="0"
                            className="w-16 p-2 bg-slate-50 border border-slate-100 rounded-lg text-center text-xs font-black outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            value={bidder.scores[c] || 0}
                            onChange={(e) => handleScoreChange(bidder.bidderId, c, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-lg font-black text-orange-600 leading-none">{bidder.weightedScore}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranking Visual Board */}
          <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <BarChart4 className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Technical Ranking Board</h3>
                    <p className="text-white/40 text-xs font-medium">Auto-updated based on criteria scoring</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Top Performer Identified</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {sortedBidders.map((bidder, idx) => (
                  <div 
                    key={bidder.bidderId} 
                    className={`flex items-center justify-between p-6 rounded-3xl border transition-all duration-500 group ${idx === 0 ? 'bg-white/10 border-white/20 scale-[1.02] shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-y-1 flex-col w-12 shrink-0">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-yellow-500' : 'text-white/20'}`}>Rank</span>
                        <span className={`text-2xl font-black ${idx === 0 ? 'text-white' : 'text-white/40'}`}>{idx + 1}</span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black ${idx === 0 ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/60'}`}>
                          {bidder.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors">{bidder.name}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            {idx === 0 && <Medal size={12} className="text-yellow-500" />}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-orange-500' : 'text-white/40'}`}>
                              {idx === 0 ? 'Best Proposal' : 'Competitive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-12">
                      {/* Mini Bar Graph */}
                      <div className="hidden md:flex items-end space-x-1.5 h-12 w-[120px]">
                        {criteria.map((c, cIdx) => (
                          <div 
                            key={cIdx} 
                            className={`w-3 rounded-full transition-all duration-1000 delay-${cIdx * 100}`}
                            style={{ 
                              height: `${Math.max(10, bidder.scores[c] || 10)}%`,
                              backgroundColor: idx === 0 ? '#f97316' : '#ffffff20'
                            }}
                          />
                        ))}
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-baseline justify-end space-x-1">
                          <span className={`text-3xl font-black tracking-tighter ${idx === 0 ? 'text-white' : 'text-white/80'}`}>{bidder.weightedScore}</span>
                          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">pts</span>
                        </div>
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">Weighted Total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pb-10">
            <button 
              onClick={() => updateBackend(criteria, bidders)}
              className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm flex items-center space-x-2 active:scale-95"
            >
              <Save size={16} />
              <span>Save Progress</span>
            </button>
            <button 
              onClick={handleComplete}
              className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black hover:bg-orange-500 transition-all uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 flex items-center space-x-3"
            >
              <span>Complete TQ Evaluation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TQEvaluation;

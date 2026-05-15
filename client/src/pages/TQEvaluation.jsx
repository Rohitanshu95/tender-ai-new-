import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, Star, Plus, Minus, ShieldCheck, 
  ArrowRight, ArrowLeft, Save, User, BarChart4, Loader2, Trash2,
  Trophy, Medal, Target, Printer
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const TQEvaluation = ({ tenderId, onComplete, onBack }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState([]);
  const [weights, setWeights] = useState({});
  const [newCriteriaName, setNewCriteriaName] = useState("");

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/evaluations/${encodeURIComponent(tenderId)}`);
        setEvaluation(res.data);
        
        const defaultCriteria = ["Technical Methodology", "Project Timeline", "Quality Assurance", "Resource Allocation", "Safety Measures"];
        const existingCriteria = (res.data.tqResults?.criteria && res.data.tqResults.criteria.length > 0) 
          ? res.data.tqResults.criteria 
          : defaultCriteria;
        
        setCriteria(existingCriteria);

        // Initialize weights if not present or if using defaults
        const defaultWeights = existingCriteria.reduce((acc, curr, idx) => ({ 
          ...acc, 
          [curr]: idx === 0 ? 30 : idx === 1 ? 20 : 15 
        }), {});

        const initialWeights = (res.data.tqResults?.weights && Object.keys(res.data.tqResults.weights).length > 0)
          ? res.data.tqResults.weights
          : defaultWeights;
          
        setWeights(initialWeights);

        if (!res.data.tqResults?.bidders || res.data.tqResults.bidders.length === 0) {
          const qualifiedBidders = (res.data.pqResults?.bidders || [])
            .filter(b => b.decision === 'accept')
            .map(b => ({
              bidderId: b.bidderId,
              name: b.name,
              scores: existingCriteria.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
              weightedScore: 0,
              rank: 0
            }));
          
          if (qualifiedBidders.length > 0) {
            await updateBackend(existingCriteria, qualifiedBidders, initialWeights);
          }
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
    const updatedWeights = { ...weights, [newCriteriaName]: 0 };
    setCriteria(updatedCriteria);
    setWeights(updatedWeights);
    setNewCriteriaName("");
    
    const updatedBidders = evaluation.tqResults.bidders.map(b => ({
      ...b,
      scores: { ...b.scores, [newCriteriaName]: 0 }
    }));
    
    updateBackend(updatedCriteria, updatedBidders, updatedWeights);
  };

  const removeCriteria = (name) => {
    const updatedCriteria = criteria.filter(c => c !== name);
    const updatedWeights = { ...weights };
    delete updatedWeights[name];
    setCriteria(updatedCriteria);
    setWeights(updatedWeights);
    
    const updatedBidders = evaluation.tqResults.bidders.map(b => {
      const newScores = { ...b.scores };
      delete newScores[name];
      return { ...b, scores: newScores };
    });
    
    updateBackend(updatedCriteria, updatedBidders, updatedWeights);
  };

  const calculateWeightedScore = (scores, currentWeights) => {
    let total = 0;
    Object.keys(scores).forEach(crit => {
      const score = scores[crit] || 0;
      const weight = currentWeights[crit] || 0;
      total += (score * weight) / 100;
    });
    return total.toFixed(1);
  };

  const handleScoreChange = (bidderId, critName, val) => {
    const score = parseInt(val) || 0;
    const updatedBidders = evaluation.tqResults.bidders.map(b => {
      if (b.bidderId === bidderId) {
        const newScores = { ...b.scores, [critName]: score };
        const weighted = calculateWeightedScore(newScores, weights);
        return { ...b, scores: newScores, weightedScore: weighted };
      }
      return b;
    });
    
    setEvaluation({ ...evaluation, tqResults: { ...evaluation.tqResults, bidders: updatedBidders } });
  };

  const handleWeightChange = (critName, val) => {
    const weight = parseInt(val) || 0;
    const newWeights = { ...weights, [critName]: weight };
    setWeights(newWeights);
    
    const updatedBidders = evaluation.tqResults.bidders.map(b => ({
      ...b,
      weightedScore: calculateWeightedScore(b.scores, newWeights)
    }));
    
    setEvaluation({ ...evaluation, tqResults: { ...evaluation.tqResults, bidders: updatedBidders, weights: newWeights } });
  };

  const updateBackend = async (updatedCriteria, updatedBidders, updatedWeights) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        stage: 'TQ',
        results: { criteria: updatedCriteria, bidders: updatedBidders, weights: updatedWeights || weights }
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

  // Mock AI scores for the indicators in the UI (these could be real in a full AI flow)
  const mockAIScores = {
    "Technical Methodology": 85,
    "Project Timeline": 90,
    "Quality Assurance": 88,
    "Resource Allocation": 82,
    "Safety Measures": 95
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      {/* Breadcrumbs & Header */}
      <header className="h-28 bg-white border-b border-slate-200 flex flex-col justify-center px-12 shrink-0 no-print">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={10} />
          <span className="text-slate-600 font-bold">Evaluate TQ</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Technical Qualification (TQ) Evaluation</h2>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 shadow-sm mr-2">
                <input 
                    type="text" 
                    placeholder="Add New Criteria..."
                    className="bg-transparent text-xs font-bold outline-none w-[180px] py-1 text-slate-700"
                    value={newCriteriaName}
                    onChange={(e) => setNewCriteriaName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCriteria()}
                />
                <button 
                    onClick={addCriteria}
                    className="ml-2 p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all active:scale-95"
                >
                    <Plus size={14} />
                </button>
            </div>
            <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl flex items-center space-x-2">
              <ShieldCheck size={14} className="text-purple-600" />
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">AI-Assisted Scoring</span>
            </div>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Tender ID: {tenderId}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar bg-[#f8fafc]">
        <div className="max-w-[1600px] mx-auto w-full space-y-8">
          
          {/* AI Banner */}
          <div className="bg-purple-50/40 border border-purple-100 rounded-[2.5rem] p-10 flex items-start space-x-8">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-purple-100 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-purple-950 mb-1 uppercase tracking-tight">AI Scoring Complete</h4>
              <p className="text-[13px] text-purple-800 font-medium leading-relaxed opacity-80">
                AI has evaluated technical proposals against TQ criteria. Review and adjust scores if needed.
              </p>
            </div>
          </div>

          {/* Scoring Matrix */}
          <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">TQ Scoring Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-12 py-8 text-[11px] font-black text-slate-900 uppercase tracking-widest min-w-[300px]">Bidder</th>
                    {criteria.map((c, idx) => (
                      <th key={c} className="px-6 py-8 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center border-l border-slate-100">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="truncate max-w-[140px]">{c}</span>
                            <button onClick={() => removeCriteria(c)} className="opacity-0 hover:opacity-100 text-rose-500 transition-all">
                                <Minus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center space-x-1 opacity-40">
                             <input 
                                type="number" 
                                className="w-8 bg-transparent text-center text-[10px] font-black outline-none"
                                value={weights[c] || 0}
                                onChange={(e) => handleWeightChange(c, e.target.value)}
                            />
                            <span className="text-[9px] font-black tracking-widest uppercase">({weights[c]}% weight)</span>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th className="px-12 py-8 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center border-l border-slate-100">Weighted Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bidders.length > 0 ? bidders.map((bidder) => (
                    <tr key={bidder.bidderId} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-12 py-10">
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-black shadow-sm border border-orange-100">
                            {bidder.name.charAt(0)}
                          </div>
                          <span className="text-sm font-black text-slate-800">{bidder.name}</span>
                        </div>
                      </td>
                      {criteria.map(c => (
                        <td key={c} className="px-6 py-10 text-center border-l border-slate-50">
                          <div className="flex flex-col items-center space-y-4">
                            <input 
                                type="number"
                                max="100"
                                min="0"
                                className="w-20 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center text-sm font-black text-slate-800 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-300 transition-all shadow-sm"
                                value={bidder.scores[c] || 0}
                                onChange={(e) => handleScoreChange(bidder.bidderId, c, e.target.value)}
                            />
                            <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black border border-purple-100 flex items-center">
                                <span>AI: {mockAIScores[c] || 80}</span>
                            </div>
                          </div>
                        </td>
                      ))}
                      <td className="px-12 py-10 text-center border-l border-slate-50">
                        <div className="flex flex-col items-center">
                          <span className="text-3xl font-black text-orange-600 tracking-tighter">{bidder.weightedScore}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">/ 100</span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={criteria.length + 2} className="px-10 py-32 text-center bg-slate-50/50">
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="p-6 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <User className="w-10 h-10 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-base font-black text-slate-900 uppercase tracking-widest">Awaiting Qualified Bidders</p>
                                <p className="text-xs text-slate-400 font-bold mt-2 uppercase tracking-widest opacity-60">Qualified bidders from PQ stage will appear here</p>
                            </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ranking Visual Board */}
          <div className="bg-[#eff6ff]/50 border border-blue-100 rounded-[3rem] p-12 shadow-sm">
            <div className="flex items-center space-x-4 mb-10">
              <BarChart4 className="text-blue-600" size={24} />
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Technical Ranking</h3>
            </div>
            <div className="space-y-6">
              {sortedBidders.map((bidder, idx) => (
                <div key={bidder.bidderId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${idx === 0 ? 'bg-orange-500 text-white border-orange-400' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>
                        Rank {idx + 1}
                    </div>
                    <span className="text-base font-black text-slate-800 tracking-tight">{bidder.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-slate-600 tracking-widest uppercase">{bidder.weightedScore} points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-6 pb-24 no-print">
            <button 
              onClick={() => updateBackend(criteria, bidders)}
              className="px-12 py-5 bg-white border border-slate-200 rounded-[1.5rem] text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-95 border-b-4 border-b-slate-100"
            >
              Save as Draft
            </button>
            <button 
              onClick={handleComplete}
              className="px-12 py-5 bg-[#f24c00] text-white rounded-[1.5rem] text-[11px] font-black hover:bg-[#d94400] transition-all uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 active:scale-95 border-b-4 border-b-[#bf3c00]"
            >
              Complete TQ Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TQEvaluation;

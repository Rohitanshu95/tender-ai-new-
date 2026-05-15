import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, DollarSign, TrendingDown, AlertTriangle, CheckCircle2, 
  ArrowRight, Save, User, BarChart4, Loader2, Info, TrendingUp,
  Scale, ShieldAlert, BadgeCheck
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const FinancialEvaluation = ({ tenderId, onComplete }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('L1'); // L1 or QCBS
  const [estimatedValue, setEstimatedValue] = useState(12500000); // 1.25 Cr placeholder
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/evaluations/${tenderId}`);
        setEvaluation(res.data);
        setMethod(res.data.financialResults?.method || 'L1');

        if (!res.data.financialResults?.bidders || res.data.financialResults.bidders.length === 0) {
          const qualifiedBidders = res.data.tqResults.bidders
            .map(b => ({
              bidderId: b.bidderId,
              name: b.name,
              quotedValue: 0,
              deviation: 0,
              anomaly: 'None',
              aiRecommendation: 'Pending'
            }));
          
          const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
            tenderId,
            stage: 'Financial',
            results: { method: 'L1', bidders: qualifiedBidders },
            status: 'In Progress'
          });
          setEvaluation(updatedEval.data);
        }
      } catch (err) {
        console.error("Error fetching Financial evaluation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [tenderId]);

  const handleValueChange = (bidderId, val) => {
    const value = parseFloat(val) || 0;
    const updatedBidders = evaluation.financialResults.bidders.map(b => {
      if (b.bidderId === bidderId) {
        const deviation = (((value - estimatedValue) / estimatedValue) * 100).toFixed(1);
        return { ...b, quotedValue: value, deviation };
      }
      return b;
    });

    // Sort to find L1
    const sorted = [...updatedBidders].filter(b => b.quotedValue > 0).sort((a, b) => a.quotedValue - b.quotedValue);
    const finalBidders = updatedBidders.map(b => {
      if (b.quotedValue === 0) return b;
      if (sorted[0]?.bidderId === b.bidderId) return { ...b, aiRecommendation: 'Lowest Bid' };
      if (sorted[1]?.bidderId === b.bidderId) return { ...b, aiRecommendation: 'Second Lowest' };
      return { ...b, aiRecommendation: 'Above Market' };
    });

    setEvaluation({ ...evaluation, financialResults: { ...evaluation.financialResults, bidders: finalBidders } });
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await axios.post(`http://localhost:8000/analyze-financials`, {
        tenderId,
        bidders: evaluation.financialResults.bidders,
        estimatedValue
      });
      
      const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        stage: 'Financial',
        results: { ...evaluation.financialResults, bidders: res.data.bidders }
      });
      setEvaluation(updatedEval.data);
    } catch (err) {
      console.error("AI Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        status: 'Completed',
        currentStage: 'Completed'
      });
      onComplete();
    } catch (err) {
      console.error("Error completing Financial:", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Financials...</p>
    </div>
  );

  const bidders = evaluation?.financialResults?.bidders || [];
  const lowestBidder = [...bidders].filter(b => b.quotedValue > 0).sort((a, b) => a.quotedValue - b.quotedValue)[0];

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10 shrink-0">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <span>Dashboard</span>
          <ChevronRight size={10} />
          <span className="text-slate-600">Evaluate Financials</span>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Evaluation</h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
            <button 
              onClick={() => setMethod('L1')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${method === 'L1' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >
              L1 Selection
            </button>
            <button 
              onClick={() => setMethod('QCBS')}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${method === 'QCBS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400'}`}
            >
              QCBS Method
            </button>
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tender ID: {tenderId}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          {/* AI Panel */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-6">
              <div className="h-16 w-16 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100">
                <ShieldAlert className="text-purple-600" size={32} />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-tight">AI Financial Auditor</h4>
                <p className="text-slate-500 text-xs font-medium">Detect predatory pricing, collusion risks, and market deviations.</p>
              </div>
            </div>
            <button 
              onClick={runAIAnalysis}
              disabled={isAnalyzing}
              className="flex items-center space-x-3 px-8 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-purple-100 hover:bg-purple-500 transition-all disabled:opacity-50 active:scale-95"
            >
              {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <BadgeCheck size={16} />}
              <span>{isAnalyzing ? 'Analyzing Bids...' : 'Run Anomaly Check'}</span>
            </button>
          </div>

          {/* Value Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm group">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Estimated Value</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{(estimatedValue / 10000000).toFixed(2)}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Cr</span>
              </div>
            </div>
            <div className="bg-emerald-900 rounded-[2rem] p-8 shadow-xl shadow-emerald-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-4">Current L1 Bidder</span>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight truncate">{lowestBidder?.name || "Evaluating..."}</span>
                <span className="text-[10px] font-black text-emerald-400 uppercase mt-1 tracking-widest">Market Advantage: {lowestBidder?.deviation || 0}%</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Quotes</span>
                <Scale size={16} className="text-slate-300" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 tracking-tighter">{bidders.filter(b => b.quotedValue > 0).length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">of {bidders.length}</span>
              </div>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Financial Comparison Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder Details</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Quote (INR)</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Deviation</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">AI Flag</th>
                    <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Risk Profile</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bidders.map((bidder, idx) => (
                    <tr key={bidder.bidderId} className="group hover:bg-slate-50/30 transition-all">
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-4">
                          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-all ${bidder.aiRecommendation === 'Lowest Bid' ? 'bg-emerald-100 text-emerald-600 scale-110' : 'bg-slate-100 text-slate-400'}`}>
                            {bidder.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700">{bidder.name}</p>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block ${bidder.aiRecommendation === 'Lowest Bid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {bidder.aiRecommendation}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <div className="relative inline-block group/input">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-black">₹</span>
                          <input 
                            type="number"
                            className="w-40 pl-8 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-sm font-black outline-none focus:ring-4 focus:ring-emerald-50 focus:border-emerald-300 transition-all"
                            value={bidder.quotedValue || ""}
                            onChange={(e) => handleValueChange(bidder.bidderId, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <div className={`flex flex-col items-center space-y-1 ${bidder.deviation < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          <div className="flex items-center space-x-1 font-black text-xs">
                            {bidder.deviation < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                            <span>{Math.abs(bidder.deviation)}%</span>
                          </div>
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{bidder.deviation < 0 ? 'Savings' : 'Premium'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          {bidder.anomaly !== 'None' ? (
                            <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-600">
                              <AlertTriangle size={14} />
                              <span className="text-[9px] font-black uppercase tracking-widest">{bidder.anomaly}</span>
                            </div>
                          ) : (
                            <div className="h-8 w-8 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-8 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${bidder.anomaly !== 'None' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {bidder.anomaly !== 'None' ? 'High Risk' : 'Low Risk'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          className={`w-14 h-7 rounded-full transition-all relative ${bidder.aiRecommendation === 'Lowest Bid' ? 'bg-emerald-600' : 'bg-slate-200'} active:scale-95`}
                        >
                          <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${bidder.aiRecommendation === 'Lowest Bid' ? 'right-1' : 'left-1'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* L1 Summary Info */}
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-start space-x-6">
              <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shrink-0">
                <Info size={24} className="text-slate-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Market Analysis Summary</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                  Based on the L1 evaluation method, {lowestBidder?.name || 'TBD'} is the preferred bidder with a quoted value of ₹{(lowestBidder?.quotedValue / 10000000 || 0).toFixed(2)} Cr, which is {Math.abs(lowestBidder?.deviation || 0)}% {lowestBidder?.deviation < 0 ? 'below' : 'above'} the internal estimate.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pb-20">
            <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-[0.2em] shadow-sm flex items-center space-x-2 active:scale-95">
              <Save size={16} />
              <span>Save Progress</span>
            </button>
            <button 
              onClick={handleComplete}
              className="px-10 py-5 bg-orange-600 text-white rounded-[1.5rem] text-xs font-black hover:bg-orange-500 transition-all uppercase tracking-[0.2em] shadow-2xl shadow-orange-600/30 active:scale-95 flex items-center space-x-4"
            >
              <span>Finalize Tender Evaluation</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialEvaluation;

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, CheckCircle2, XCircle, ShieldCheck, 
  FileText, ArrowRight, ArrowLeft, Save, User, Loader2, Eye
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const PQEvaluation = ({ tenderId, onComplete, onBack }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/evaluations/${encodeURIComponent(tenderId)}`);
        setEvaluation(res.data);
        
        // If results are empty, fetch bidders and initialize
        if (!res.data.pqResults?.bidders || res.data.pqResults.bidders.length === 0) {
          const biddersRes = await axios.get(`${API_BASE_URL}/bidders/tender/${encodeURIComponent(tenderId)}`);
          const initialBidders = biddersRes.data.map(b => ({
            bidderId: b._id,
            name: b.name,
            documents: b.documents || [],
            criteriaStatus: { registration: false, financial: false, experience: false, compliance: false },
            aiRecommendation: 'Pending',
            confidence: 0,
            decision: 'pending'
          }));
          
          const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
            tenderId,
            stage: 'PQ',
            results: { bidders: initialBidders },
            status: 'In Progress'
          });
          setEvaluation(updatedEval.data);
        }
      } catch (err) {
        console.error("Error fetching evaluation:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluation();
  }, [tenderId]);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // Call microservice for AI verification
      const res = await axios.post(`http://localhost:8000/verify-pq`, { tenderId });
      
      // Merge results to preserve local data like 'documents'
      const aiBidders = res.data.bidders;
      const mergedBidders = aiBidders.map(aiB => {
        const existing = evaluation.pqResults.bidders.find(b => b.name === aiB.name);
        return { ...aiB, documents: existing?.documents || [], bidderId: existing?.bidderId || aiB.bidderId };
      });

      // Update evaluation with AI results
      const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        stage: 'PQ',
        results: { bidders: mergedBidders },
        status: 'In Progress'
      });
      setEvaluation(updatedEval.data);
    } catch (err) {
      console.error("AI Verification failed:", err);
      alert("AI Verification failed. Ensure microservice is running.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDecision = async (bidderId, decision) => {
    const updatedBidders = evaluation.pqResults.bidders.map(b => 
      b.bidderId === bidderId ? { ...b, decision } : b
    );
    
    try {
      const updatedEval = await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        stage: 'PQ',
        results: { bidders: updatedBidders }
      });
      setEvaluation(updatedEval.data);
    } catch (err) {
      console.error("Error updating decision:", err);
    }
  };

  const handleComplete = async () => {
    try {
      await axios.post(`${API_BASE_URL}/evaluations/update`, {
        tenderId,
        status: 'In Progress',
        currentStage: 'TQ'
      });
      onComplete();
    } catch (err) {
      console.error("Error completing PQ:", err);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initializing Evaluation...</p>
    </div>
  );

  const bidders = evaluation?.pqResults?.bidders || [];
  const qualifiedCount = bidders.filter(b => b.decision === 'accept').length;
  const disqualifiedCount = bidders.length - qualifiedCount;

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      <header className="h-24 bg-white border-b border-slate-200 flex flex-col justify-center px-10 shrink-0">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={10} />
          <span className="text-slate-600">Evaluate PQ</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pre-Qualification (PQ) Evaluation</h2>
          </div>
          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-purple-200 hover:bg-purple-500 transition-all disabled:opacity-50"
          >
            {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            <span>{isVerifying ? 'AI Verifying...' : 'Start AI Verification'}</span>
          </button>
        </div>
        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Tender ID: {tenderId}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-8">
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
            <div className="p-8 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">PQ Criteria Evaluation Matrix</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Bidder</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Company Registration</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Financial Turnover</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Similar Experience</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Legal Compliance</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">AI Recommendation</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Decision</th>
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
                        {bidder.documents && bidder.documents.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {bidder.documents.map((doc, dIdx) => (
                              <button 
                                key={dIdx}
                                onClick={() => window.open(`http://localhost:5001/${doc.filePath}`, '_blank')}
                                className="flex items-center space-x-1 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[8px] font-black uppercase text-slate-500 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 transition-all group"
                                title={`View ${doc.name}`}
                              >
                                <Eye size={10} className="group-hover:scale-110 transition-transform" />
                                <span className="truncate max-w-[80px]">{doc.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-6 text-center">
                        {bidder.criteriaStatus?.registration ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-6 text-center">
                        {bidder.criteriaStatus?.financial ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-6 text-center">
                        {bidder.criteriaStatus?.experience ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-6 text-center">
                        {bidder.criteriaStatus?.compliance ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <XCircle className="w-5 h-5 text-rose-500 mx-auto" />}
                      </td>
                      <td className="px-6 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase mb-1 ${bidder.aiRecommendation === 'Qualified' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {bidder.aiRecommendation}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400">{bidder.confidence}% confidence</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleDecision(bidder.bidderId, 'accept')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${bidder.decision === 'accept' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleDecision(bidder.bidderId, 'reject')}
                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${bidder.decision === 'reject' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            Reject
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pb-10">
            <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">
              Save as Draft
            </button>
            <button 
              onClick={handleComplete}
              className="px-8 py-4 bg-orange-600 text-white rounded-2xl text-xs font-black hover:bg-orange-500 transition-all uppercase tracking-widest shadow-lg shadow-orange-600/20 active:scale-95 flex items-center space-x-3"
            >
              <span>Complete PQ Evaluation</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PQEvaluation;

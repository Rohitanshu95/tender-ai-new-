import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ArrowLeft, Plus, FileText, ChevronDown, ChevronUp, Eye, Download, Users
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const Proposals = ({ onBack, onUpload }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTender, setExpandedTender] = useState(null);
  const [expandedBidder, setExpandedBidder] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/bidders/proposals`);
        setTenders(response.data);
      } catch (err) {
        console.error("Failed to fetch proposals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const toggleTender = (id) => {
    setExpandedTender(expandedTender === id ? null : id);
    setExpandedBidder(null);
  };

  const toggleBidder = (id) => {
    setExpandedBidder(expandedBidder === id ? null : id);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
            <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
            <ChevronRight size={12} />
            <span className="text-slate-600">Proposals</span>
          </div>

          {/* Header Section */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Proposals</h1>
                <p className="text-slate-500 font-normal italic">View and manage bidder proposals</p>
              </div>
            </div>
            <button 
              onClick={onUpload}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center space-x-2"
            >
              <Plus size={20} strokeWidth={2} />
              <span>Upload Proposals</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-orange-600 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Retrieving Proposals...</p>
            </div>
          ) : tenders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-[3rem] p-20 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No Proposals Yet</h3>
              <p className="text-slate-400 font-medium mb-8">Start by uploading bidder documents for an existing tender.</p>
              <button 
                onClick={onUpload}
                className="text-orange-600 font-black uppercase tracking-widest text-[10px] hover:text-orange-700"
              >
                Go to Upload Page
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {tenders.map((tender) => (
                <div key={tender._id} className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
                  <div 
                    className="p-8 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                    onClick={() => toggleTender(tender._id)}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-sm font-black text-slate-900 tracking-tight">{tender.tenderId}</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-sm font-medium text-slate-500 line-clamp-1">{tender.title}</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{tender.organization} • {tender.department}</p>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                        <Users size={14} />
                        <span className="text-[10px] font-black uppercase tracking-wider">{tender.bidders?.length || 0} Bidders</span>
                      </div>
                      {expandedTender === tender._id ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </div>
                  </div>

                  {expandedTender === tender._id && (
                    <div className="px-8 pb-8 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {tender.bidders && tender.bidders.length > 0 ? (
                        tender.bidders.map((bidder, bIdx) => (
                          <div key={bIdx} className="border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/30">
                            <div 
                              className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                              onClick={() => toggleBidder(bidder._id || bidder.name)}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="h-10 w-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-orange-600 text-xs shadow-sm">
                                  {bidder.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="text-sm font-black text-slate-800">{bidder.name}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bidder.documents?.length || 0} documents</p>
                                </div>
                              </div>
                              {expandedBidder === (bidder._id || bidder.name) ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                            </div>

                            {expandedBidder === (bidder._id || bidder.name) && (
                              <div className="px-6 pb-6 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                {bidder.documents && bidder.documents.length > 0 ? (
                                  bidder.documents.map((doc, dIdx) => (
                                    <div key={dIdx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl group hover:border-orange-200 transition-all shadow-sm">
                                      <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                          <FileText className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-black text-slate-800">{doc.name}</p>
                                          <div className="flex items-center space-x-2 mt-0.5">
                                            <span className="text-[9px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                              {doc.type || 'Proposal'}
                                            </span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                              {doc.fileSize ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB` : 'Size Unknown'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <button 
                                          onClick={() => window.open(`http://localhost:5001/${doc.filePath}`, '_blank')}
                                          className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                          title="View Document"
                                        >
                                          <Eye size={16} />
                                        </button>
                                        <button 
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `http://localhost:5001/${doc.filePath}`;
                                            link.setAttribute('download', doc.name);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.remove();
                                          }}
                                          className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                          title="Download Document"
                                        >
                                          <Download size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-center py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No documents found for this bidder.</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-[2rem]">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">No bidders associated with this tender.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Proposals;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronRight, ArrowLeft, PlusCircle, Loader2
} from 'lucide-react';
import AnalysisMatrix from '../components/AnalysisMatrix';

const AddTender = ({ onBack, editTender = null }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [initialExtractions, setInitialExtractions] = useState(null);
  const isEditMode = !!editTender;

  useEffect(() => {
    if (isEditMode) {
      const fetchRequirements = async () => {
        try {
          const res = await axios.get(`http://localhost:5001/api/tenders/${encodeURIComponent(editTender.tenderId)}/requirements`);
          const reqs = res.data;
          
          setInitialExtractions({
            general: [
              { category: 'Scope Overview', key: editTender.title, value: `Dept: ${editTender.department}`, mandatory: true },
            ],
            pq: reqs.filter(r => r.category === 'PQ').map(r => ({ key: r.key, value: r.value })),
            tq: reqs.filter(r => r.category === 'TQ').map(r => ({ key: r.key, value: r.value })),
          });
        } catch (err) {
          console.error("Failed to fetch requirements for edit", err);
        }
      };
      fetchRequirements();
    }
  }, [isEditMode, editTender?.tenderId]);

  const handleSave = async (extractions) => {
    setIsSaving(true);
    try {
      const meta = extractions.general_metadata || {};
      // Prepare the payload for the backend
      const payload = {
        tenderId: String(meta.tender_id || meta.id || `TND-${Date.now()}`),
        title: meta.title || "Untitled Tender",
        organization: meta.organization || meta.authority || "National Procurement Board",
        department: meta.department || "Public Works",
        tenderType: (meta.tender_type || meta.type || "RFP").toUpperCase(),
        estimatedValue: meta.estimated_value || "N/A",
        status: "In Evaluation",
        publishedDate: meta.date_of_publish || new Date().toISOString(),
        closingDate: meta.date_of_closing || new Date().toISOString(),
        // Pass requirements to be saved as well
        requirements: [
          ...(extractions.pq || []).map(r => ({ ...r, category: 'PQ' })),
          ...(extractions.tq || []).map(r => ({ ...r, category: 'TQ' }))
        ]
      };

      console.log("Saving Tender to Backend:", payload);
      await axios.post('http://localhost:5001/api/tenders', payload);
      onBack(); // Go back to tenders list after success
    } catch (err) {
      console.error("Failed to save tender:", err);
      const serverMsg = err.response?.data?.message || err.message;
      alert(`Error saving tender: ${serverMsg}. Please check if backend is running.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex flex-col justify-center px-10 sticky top-0 z-10">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Tenders</button>
          <ChevronRight size={10} />
          <span className="text-slate-600">Add New Tender</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                <PlusCircle className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {isEditMode ? 'Edit Tender' : 'Add New Tender'}
              </h2>
            </div>
          </div>
        
          <div className="flex items-center space-x-5">
            {isSaving && (
              <div className="flex items-center space-x-2 text-emerald-600 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Saving to Cloud...</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs font-black text-slate-900">Rohitanshu Dhar</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">National Procurement Board</p>
            </div>
            <div className="h-10 w-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xs">
              RD
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full">
          {(isEditMode && !initialExtractions) ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loading Tender Data...</p>
            </div>
          ) : (
            <AnalysisMatrix 
              mode="persistent" 
              tenderId={editTender?.tenderId || "NEW-TND"}
              onSave={handleSave}
              initialExtractions={initialExtractions}
              initialMetadata={editTender ? {
                id: editTender.tenderId,
                title: editTender.title,
                authority: editTender.organization,
                department: editTender.department,
                date_of_publish: editTender.publishedDate ? new Date(editTender.publishedDate).toISOString().split('T')[0] : '',
                date_of_closing: editTender.closingDate ? new Date(editTender.closingDate).toISOString().split('T')[0] : ''
              } : null}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTender;

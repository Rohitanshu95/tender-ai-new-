import React from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import AnalysisMatrix from '../components/AnalysisMatrix';

const GenerateTemplate = ({ tender, initialCorrigenda = [], onBack, onSave }) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (extractions) => {
    setIsSaving(true);
    try {
      const meta = extractions.general_metadata || {};
      const payload = {
        tenderId: tender?.tenderId,
        title: meta.title || tender?.title,
        organization: meta.authority || tender?.organization,
        department: meta.department || tender?.department,
        tenderType: (meta.type || tender?.tenderType || "RFP").toUpperCase(),
        status: "Published",
        publishedDate: meta.date_of_publish || tender?.publishedDate,
        closingDate: meta.date_of_closing || tender?.closingDate,
        requirements: [
          ...(extractions.pq || []).map(r => ({ ...r, category: 'PQ', key: r.requirement, value: r.description })),
          ...(extractions.tq || []).map(r => ({ ...r, category: 'TQ', key: r.requirement, value: r.description }))
        ]
      };

      await axios.post('http://localhost:5001/api/tenders', payload);
      onSave(); // Navigate back
    } catch (err) {
      console.error("Failed to save template:", err);
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex flex-col justify-center px-10 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Generate AI Template</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tender ID: {tender?.tenderId}</p>
            </div>
          </div>
          {isSaving && (
            <div className="flex items-center space-x-2 text-emerald-600 animate-pulse">
              <span className="text-[10px] font-black uppercase tracking-widest">Saving Template...</span>
            </div>
          )}
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full">
          <AnalysisMatrix 
            mode="persistent" 
            tenderId={tender?.tenderId}
            onSave={handleSave}
            initialDocType={tender?.tenderType?.toLowerCase() || 'rfp'}
            initialCorrigendumFiles={initialCorrigenda}
          />
        </div>
      </div>
    </div>
  );
};

export default GenerateTemplate;

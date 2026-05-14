import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Edit3, ArrowLeft, CheckCircle2, AlertCircle, FileText, Settings2, ShieldCheck, Loader2, Plus, Trash2, Save, X
} from 'lucide-react';

const TemplateView = ({ tender, onBack }) => {
  const [activeTab, setActiveTab] = useState('pq');
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const encodedId = encodeURIComponent(tender.tenderId);
        const res = await axios.get(`http://localhost:5001/api/tenders/${encodedId}/requirements`);
        setRequirements(res.data);
      } catch (err) {
        console.error("Failed to fetch requirements", err);
      } finally {
        setLoading(false);
      }
    };
    if (tender?.tenderId) fetchRequirements();
  }, [tender?.tenderId]);

  const tabs = [
    { id: 'pq', label: 'Pre-Qualification (PQ)' },
    { id: 'tq', label: 'Technical Qualification (TQ)' },
    { id: 'other', label: 'Other Documents' },
  ];

  const handleAdd = () => {
    const newReq = {
      tenderId: tender.tenderId,
      category: activeTab.toUpperCase(),
      key: '',
      value: '',
      isNew: true
    };
    setRequirements([...requirements, newReq]);
  };

  const handleUpdate = (index, field, val) => {
    const updated = [...requirements];
    updated[index][field] = val;
    setRequirements(updated);
  };

  const handleDelete = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post('http://localhost:5001/api/tenders', {
        tenderId: tender.tenderId,
        title: tender.title,
        requirements: requirements.map(r => ({
          category: r.category,
          key: r.key,
          value: r.value
        }))
      });
      setIsEditing(false);
      alert("Template saved successfully!");
    } catch (err) {
      console.error("Failed to save template", err);
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntireTemplate = async () => {
    if (!window.confirm("Are you sure you want to delete the entire template? This will clear all AI intelligence data for this tender.")) return;
    try {
      await axios.post('http://localhost:5001/api/tenders', {
        tenderId: tender.tenderId,
        title: tender.title,
        requirements: []
      });
      setRequirements([]);
      alert("Template deleted successfully.");
    } catch (err) {
      console.error("Failed to delete template", err);
    }
  };

  const filteredCriteria = requirements.filter(r => {
    if (activeTab === 'pq') return r.category.toUpperCase() === 'PQ';
    if (activeTab === 'tq') return r.category.toUpperCase() === 'TQ';
    if (activeTab === 'other') return !['PQ', 'TQ'].includes(r.category.toUpperCase());
    return false;
  });

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#fcfcfd] custom-scrollbar">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Configure</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">View Template</span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Evaluation Template</h1>
            <div className="flex items-center space-x-3">
              <span className="text-slate-500 font-bold">Tender ID:</span>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">{tender?.tenderId || tender?.tender_id || 'TND-2026-001'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-2xl text-sm font-semibold hover:bg-orange-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                >
                  <Save size={18} />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X size={18} />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                >
                  <Edit3 size={18} />
                  <span>Edit Template</span>
                </button>
                <button 
                  onClick={deleteEntireTemplate}
                  className="flex items-center space-x-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-2xl text-sm font-semibold hover:bg-orange-100 transition-all active:scale-95"
                >
                  <Trash2 size={18} />
                  <span>Delete Template</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Custom Tab Bar */}
        <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-fit mb-10 border border-slate-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all relative ${
                activeTab === tab.id ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-white rounded-xl shadow-md border border-slate-200/50"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 min-h-[500px]"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Template...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  {activeTab === 'pq' ? <ShieldCheck size={20} /> : <Settings2 size={20} />}
                </div>
                <h3 className="text-xl font-semibold text-slate-700 tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label} Criteria
                </h3>
              </div>

              <div className="space-y-4">
                {filteredCriteria.map((item, idx) => {
                  const globalIdx = requirements.findIndex(r => r === item);
                  return (
                    <motion.div 
                      key={item._id || idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bento-card group relative ${isEditing ? 'border-orange-500 ring-2 ring-orange-50' : ''} transition-all`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3 w-full">
                          {isEditing ? (
                            <input 
                              type="text"
                              value={item.key}
                              onChange={(e) => handleUpdate(globalIdx, 'key', e.target.value)}
                              className="w-full text-base font-semibold text-slate-700 outline-none bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 transition-all"
                              placeholder="Requirement Title"
                            />
                          ) : (
                            <>
                              <h4 className="text-lg font-semibold text-slate-700 tracking-tight leading-snug">{item.key}</h4>
                              <span className="px-2.5 py-1 rounded-md text-[9px] font-semibold uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-100">
                                Verified
                              </span>
                            </>
                          )}
                        </div>
                        {isEditing ? (
                          <button 
                            onClick={() => handleDelete(globalIdx)}
                            className="p-2 text-slate-300 hover:text-orange-600 transition-colors ml-4"
                          >
                            <Trash2 size={20} />
                          </button>
                        ) : (
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <CheckCircle2 size={16} className="text-orange-500" />
                          </div>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <textarea 
                          value={item.value}
                          onChange={(e) => handleUpdate(globalIdx, 'value', e.target.value)}
                          className="w-full text-sm font-normal leading-[1.6] text-slate-500 bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none h-32 resize-none mt-2"
                          placeholder="Provide the specific rule or description..."
                        />
                      ) : (
                        <p className="text-sm font-normal leading-[1.6] text-slate-500">{item.value}</p>
                      )}
                      
                      {/* Visual Progress Bar (Bottom) */}
                      <div className="absolute bottom-0 left-0 h-1 bg-orange-500/10 w-full rounded-b-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          className="h-full bg-orange-500"
                        />
                      </div>
                    </motion.div>
                  );
                })}

                {isEditing && (
                  <button 
                    onClick={handleAdd}
                    className="w-full py-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center space-y-2 text-slate-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50/30 transition-all"
                  >
                    <Plus size={32} />
                    <span className="text-xs font-semibold uppercase tracking-widest">Append New {activeTab.toUpperCase()} Criteria</span>
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TemplateView;

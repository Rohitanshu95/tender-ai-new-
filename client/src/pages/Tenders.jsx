import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Eye, Edit3, Trash2, FileText, ChevronRight, Filter, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

const StatusBadge = ({ status }) => {
  const styles = {
    'In Evaluation': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Published': 'bg-blue-50 text-blue-600 border-blue-100',
    'Draft': 'bg-slate-50 text-slate-500 border-slate-100',
    'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const Tenders = ({ onView, onEdit, onAdd, onBack }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tenders`);
        setTenders(response.data);
      } catch (err) {
        console.error("Failed to fetch real tenders.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  const handleDelete = async (tenderId) => {
    if (window.confirm('Are you sure you want to delete this tender?')) {
      try {
        await axios.delete(`${API_BASE_URL}/tenders/${encodeURIComponent(tenderId)}`);
        setTenders(prev => prev.filter(t => t.tenderId !== tenderId));
      } catch (err) {
        console.error("Failed to delete tender:", err);
        alert("Failed to delete tender.");
      }
    }
  };

  const filteredTenders = (tenders || []).filter(t => {
    const search = searchTerm.toLowerCase();
    const idMatch = (t.tenderId || "").toLowerCase().includes(search);
    const titleMatch = (t.title || "").toLowerCase().includes(search);
    return idMatch || titleMatch;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors">Dashboard</button>
          <ChevronRight size={12} />
          <span className="text-slate-600">Tenders</span>
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-4xl font-semibold text-slate-700 tracking-tight mb-2">Tenders</h1>
              <p className="text-slate-500 font-normal italic">Manage and track your procurement documentation lifecycle</p>
            </div>
          </div>
          <button 
            onClick={onAdd}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-3.5 rounded-xl font-semibold shadow-xl shadow-orange-100 transition-all active:scale-95 flex items-center space-x-2"
          >
            <Plus size={20} strokeWidth={2} />
            <span>Add New Tender</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Tender ID or Title..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-orange-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-64 relative">
              <select className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm font-semibold text-slate-600 focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all outline-none">
                <option>All Statuses</option>
                <option>In Evaluation</option>
                <option>Published</option>
                <option>Draft</option>
                <option>Completed</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h3 className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">All Tenders</h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Tenders...</p>
              </div>
            ) : filteredTenders.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">No Tenders Found</h4>
                <p className="text-sm font-medium text-slate-400">Add your first tender to get started with AI extraction.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Tender ID</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Title</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center">Type</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Department</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Publish Date</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Deadline</th>
                    <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTenders.map((tender) => (
                    <tr key={tender._id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                      <td className="px-6 py-5">
                        <span className="text-sm font-semibold text-slate-700">{tender.tenderId}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-600 group-hover:text-orange-600 transition-colors line-clamp-1">{tender.title}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-semibold text-slate-500 uppercase">{tender.tenderType}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-500">{tender.department}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <StatusBadge status={tender.status || 'Draft'} />
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-400">{tender.publishedDate ? new Date(tender.publishedDate).toLocaleDateString() : 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-medium text-slate-400">{tender.closingDate ? new Date(tender.closingDate).toLocaleDateString() : 'N/A'}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => onView(tender)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => onEdit(tender)}
                            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(tender.tenderId)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="p-6 border-t border-slate-50 bg-slate-50/30">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
              Showing {filteredTenders.length} of {tenders.length} tenders
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default Tenders;

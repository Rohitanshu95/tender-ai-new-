import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Eye, Edit3, FileText, ChevronRight, Filter, ArrowLeft
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const mockTenders = [
  { id: 1, tender_id: 'TND-2026-001', title: 'Road Construction - Phase 2', tender_type: 'RFP', organization: 'Public Works', status: 'In Evaluation', date_of_publish: '2026-03-15', date_of_closing: '2026-04-15' },
  { id: 2, tender_id: 'TND-2026-002', title: 'IT Infrastructure Upgrade', tender_type: 'RFQ', organization: 'IT & Electronics', status: 'Published', date_of_publish: '2026-04-01', date_of_closing: '2026-04-20' },
  { id: 3, tender_id: 'TND-2026-003', title: 'Healthcare Equipment Supply', tender_type: 'EoI', organization: 'Health & Family Welfare', status: 'Draft', date_of_publish: '2026-04-05', date_of_closing: '2026-05-01' },
  { id: 4, tender_id: 'TND-2026-004', title: 'Educational Material Procurement', tender_type: 'RFP', organization: 'Education', status: 'Completed', date_of_publish: '2026-02-10', date_of_closing: '2026-03-10' },
  { id: 5, tender_id: 'TND-2026-005', title: 'Solar Power Installation', tender_type: 'RFP', organization: 'Energy', status: 'In Evaluation', date_of_publish: '2026-03-20', date_of_closing: '2026-04-18' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    'In Evaluation': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Published': 'bg-blue-50 text-blue-600 border-blue-100',
    'Draft': 'bg-slate-50 text-slate-500 border-slate-100',
    'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};

const Tenders = ({ onView, onAdd, onBack }) => {
  const [tenders, setTenders] = useState(mockTenders);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/tenders/`);
        if (response.data && response.data.length > 0) {
          // Map backend data if necessary, adding a dummy status for UI
          const mappedData = response.data.map(t => ({
            ...t,
            status: t.status || 'Draft' // Backend model doesn't have status yet
          }));
          setTenders(mappedData);
        }
      } catch (err) {
        console.error("Failed to fetch real tenders, staying with mock data.", err);
      }
    };
    fetchTenders();
  }, []);

  const filteredTenders = tenders.filter(t => 
    t.tender_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#fcfcfd]">
      <div className="p-10 max-w-[1600px] mx-auto w-full">
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
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Tenders</h1>
              <p className="text-slate-500 font-medium">Manage all tender documents and processes</p>
            </div>
          </div>
          <button 
            onClick={onAdd}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-black shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center space-x-2"
          >
            <Plus size={20} strokeWidth={3} />
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
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-64 relative">
              <select className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-slate-900 cursor-pointer transition-all">
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
            <h3 className="font-black text-slate-900 uppercase tracking-tight text-sm">All Tenders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tender ID</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Publish Date</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Deadline</th>
                  <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenders.map((tender) => (
                  <tr key={tender.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-900">{tender.tender_id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors line-clamp-1">{tender.title}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-500 uppercase">{tender.tender_type}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-500">{tender.organization}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={tender.status} />
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-400">{tender.date_of_publish}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-400">{tender.date_of_closing}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => onView(tender)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
                          <Edit3 size={16} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50/30">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Showing {filteredTenders.length} of {tenders.length} tenders
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tenders;

import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ShieldCheck, BarChart4 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AIConfigure from './pages/AIConfigure';
import Tenders from './pages/Tenders';
import TenderDetail from './pages/TenderDetail';
import TemplateView from './pages/TemplateView';
import GenerateTemplate from './pages/GenerateTemplate';
import AddTender from './pages/AddTender';
import PQEvaluation from './pages/PQEvaluation';
import TQEvaluation from './pages/TQEvaluation';
import Proposals from './pages/Proposals';
import UploadProposal from './pages/UploadProposal';

// Placeholder Components
// Placeholder Components
const Dashboard = ({ onBack }) => (
  <div className="flex-1 flex flex-col bg-[#fcfcfd]">
    <div className="p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
        <span className="text-slate-600">Overview</span>
      </div>
      <div className="mb-10">
        <h1 className="text-4xl font-semibold text-slate-700 tracking-tight">System Dashboard</h1>
      </div>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold">
        Analytics and overview metrics will appear here.
      </div>
    </div>
  </div>
);

const Evaluations = ({ onBack, onStartPQ, onStartTQ }) => (
  <div className="flex-1 flex flex-col bg-[#fcfcfd]">
    <div className="p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
        <button onClick={onBack} className="hover:text-slate-900">Dashboard</button>
        <ChevronRight size={12} />
        <span className="text-slate-600">Evaluations</span>
      </div>
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-4xl font-semibold text-slate-700 tracking-tight">Evaluations</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-purple-300 transition-all cursor-pointer group shadow-sm" onClick={onStartPQ}>
          <div className="h-12 w-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Pre-Qualification (PQ)</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">Analyze bidder eligibility and compliance criteria using AI assistance.</p>
          <div className="flex items-center text-purple-600 text-[10px] font-black uppercase tracking-widest">
            <span>Start Evaluation</span>
            <ChevronRight size={14} className="ml-1" />
          </div>
        </div>

        <div className="p-10 bg-white border border-slate-200 rounded-[2.5rem] hover:border-orange-300 transition-all cursor-pointer group shadow-sm" onClick={onStartTQ}>
          <div className="h-12 w-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BarChart4 className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Technical Qualification (TQ)</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">Score technical proposals and evaluate weighted criteria rankings.</p>
          <div className="flex items-center text-orange-600 text-[10px] font-black uppercase tracking-widest">
            <span>Start Scoring</span>
            <ChevronRight size={14} className="ml-1" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Reports = ({ onBack }) => (
  <div className="flex-1 flex flex-col bg-[#fcfcfd]">
    <div className="p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
        <button onClick={onBack} className="hover:text-slate-900">Dashboard</button>
        <ChevronRight size={12} />
        <span className="text-slate-600">Reports</span>
      </div>
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-4xl font-semibold text-slate-700 tracking-tight">System Reports</h1>
      </div>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold">
        Export extraction results and audits here.
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTender, setSelectedTender] = useState(null);

  const handleViewTender = (tender) => {
    setSelectedTender(tender);
    setActiveTab('tender-detail');
  };

  const handleViewTemplate = (tender) => {
    setSelectedTender(tender);
    setActiveTab('template-view');
  };

  const [extraCorrigenda, setExtraCorrigenda] = useState([]);

  const handleGenerateTemplate = (tender, newCorrigenda = []) => {
    setSelectedTender(tender);
    setExtraCorrigenda(newCorrigenda);
    setActiveTab('generate-template');
  };

  const handleEditTender = (tender) => {
    setSelectedTender(tender);
    setActiveTab('edit-tender');
  };

  const handleUploadComplete = () => {
    setActiveTab('proposals');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onBack={() => setActiveTab('dashboard')} />;
      case 'tenders':
        return <Tenders onView={handleViewTender} onEdit={handleEditTender} onAdd={() => setActiveTab('add-tender')} onBack={() => setActiveTab('dashboard')} />;
      case 'tender-detail':
        return <TenderDetail tender={selectedTender} onBack={() => setActiveTab('tenders')} />;
      case 'add-tender':
        return <AddTender onBack={() => setActiveTab('tenders')} />;
      case 'edit-tender':
        return <AddTender editTender={selectedTender} onBack={() => setActiveTab('tenders')} />;
      case 'ai-configure':
        return <AIConfigure onView={handleViewTemplate} onGenerate={handleGenerateTemplate} onBack={() => setActiveTab('dashboard')} />;
      case 'template-view':
        return <TemplateView tender={selectedTender} onBack={() => setActiveTab('ai-configure')} />;
      case 'generate-template':
        return <GenerateTemplate tender={selectedTender} initialCorrigenda={extraCorrigenda} onBack={() => setActiveTab('ai-configure')} onSave={() => setActiveTab('ai-configure')} />;
      case 'evaluations':
        return <Evaluations 
          onBack={() => setActiveTab('dashboard')} 
          onStartPQ={() => setActiveTab('pq-eval')}
          onStartTQ={() => setActiveTab('tq-eval')}
        />;
      case 'pq-eval':
        return <PQEvaluation tenderId="T-001" onComplete={() => setActiveTab('evaluations')} />;
      case 'tq-eval':
        return <TQEvaluation tenderId="T-001" onComplete={() => setActiveTab('evaluations')} />;
      case 'proposals':
        return <Proposals onUpload={() => setActiveTab('upload-proposal')} onBack={() => setActiveTab('dashboard')} />;
      case 'upload-proposal':
        return <UploadProposal onBack={() => setActiveTab('proposals')} onSave={handleUploadComplete} />;
      case 'reports':
        return <Reports onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard onBack={() => setActiveTab('dashboard')} />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-[#fcfcfd] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import AIConfigure from './pages/AIConfigure';
import Tenders from './pages/Tenders';
import TenderDetail from './pages/TenderDetail';
import TemplateView from './pages/TemplateView';
import GenerateTemplate from './pages/GenerateTemplate';
import AddTender from './pages/AddTender';

// Placeholder Components
// Placeholder Components
const Dashboard = ({ onBack }) => (
  <div className="flex-1 flex flex-col bg-[#fcfcfd]">
    <div className="p-10 max-w-[1600px] mx-auto w-full">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
        <span className="text-slate-600">Overview</span>
      </div>
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Dashboard</h1>
      </div>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold">
        Analytics and overview metrics will appear here.
      </div>
    </div>
  </div>
);

const Evaluations = ({ onBack }) => (
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
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Evaluations</h1>
      </div>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold">
        Comparison and scoring metrics will appear here.
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
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Reports</h1>
      </div>
      <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold">
        Export extraction results and audits here.
      </div>
    </div>
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('tender-analysis');
  const [selectedTender, setSelectedTender] = useState(null);

  const handleViewTender = (tender) => {
    setSelectedTender(tender);
    setActiveTab('tender-detail');
  };

  const handleViewTemplate = (tender) => {
    setSelectedTender(tender);
    setActiveTab('template-view');
  };

  const handleGenerateTemplate = (tender) => {
    setSelectedTender(tender);
    setActiveTab('generate-template');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onBack={() => setActiveTab('dashboard')} />;
      case 'tenders':
        return <Tenders onView={handleViewTender} onAdd={() => setActiveTab('add-tender')} onBack={() => setActiveTab('dashboard')} />;
      case 'tender-detail':
        return <TenderDetail tender={selectedTender} onBack={() => setActiveTab('tenders')} />;
      case 'add-tender':
        return <AddTender onBack={() => setActiveTab('tenders')} />;
      case 'ai-configure':
        return <AIConfigure onView={handleViewTemplate} onGenerate={handleGenerateTemplate} onBack={() => setActiveTab('dashboard')} />;
      case 'template-view':
        return <TemplateView tender={selectedTender} onBack={() => setActiveTab('ai-configure')} />;
      case 'generate-template':
        return <GenerateTemplate tender={selectedTender} onBack={() => setActiveTab('ai-configure')} onSave={() => setActiveTab('ai-configure')} />;
      case 'evaluations':
        return <Evaluations onBack={() => setActiveTab('dashboard')} />;
      case 'reports':
        return <Reports onBack={() => setActiveTab('dashboard')} />;
      default:
        return <Dashboard onBack={() => setActiveTab('dashboard')} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfcfd] font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;

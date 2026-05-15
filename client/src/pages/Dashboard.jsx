import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { 
  FileText, ShieldCheck, Clock, AlertTriangle, 
  ChevronRight, TrendingUp, TrendingDown,
  BarChart4, PieChart as PieChartIcon, Activity as ActivityIcon,
  Search, Filter, Bell, User, Loader2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const API_BASE_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendFilter, setTrendFilter] = useState('12m');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, chartRes, actRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/summary`),
          axios.get(`${API_BASE_URL}/analytics/charts`),
          axios.get(`${API_BASE_URL}/analytics/activity`)
        ]);
        setSummary(sumRes.data);
        setCharts(chartRes.data);
        setActivities(actRes.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Loader2 className="w-10 h-10 text-gov-orange animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Analytics...</p>
    </div>
  );

  const COLORS = ['#3b82f6', '#f97316', '#10b981', '#64748b'];

  const getIcon = (name, size=24, className="") => {
    switch(name) {
      case 'FileText': return <FileText size={size} className={className} />;
      case 'ShieldCheck': return <ShieldCheck size={size} className={className} />;
      case 'Clock': return <Clock size={size} className={className} />;
      case 'AlertTriangle': return <AlertTriangle size={size} className={className} />;
      default: return <BarChart4 size={size} className={className} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fcfcfd] overflow-hidden">
      <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">360-degree Tender Evaluation Analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl flex items-center space-x-2">
            <span className="text-[10px] font-black text-orange-600 uppercase">Last updated:</span>
            <span className="text-[10px] font-black text-orange-800 uppercase">{new Date().toLocaleString()}</span>
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
            <Bell size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-20">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summary?.stats.map((stat, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${idx === 3 ? 'bg-rose-50 text-rose-500' : 'bg-orange-50 text-orange-600'} group-hover:scale-110`}>
                    {getIcon(stat.icon, 28)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-black ${stat.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {stat.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(stat.change)}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">from last month</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Pie Chart: Status Distribution */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm flex flex-col">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10">Tender Status Distribution</h3>
              <div className="flex-1 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts?.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {charts?.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funnel Chart: Evaluation Progress */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-10">Evaluation Progress Funnel</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={charts?.funnelData}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="stage" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                      width={120}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f97316" radius={[0, 10, 10, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Line Chart: Participation Trends */}
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-3">
                <ActivityIcon className="text-orange-600" size={20} />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bidder Participation Trends</h3>
              </div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setTrendFilter('12m')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${trendFilter === '12m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Last 12 Months
                </button>
                <button 
                  onClick={() => setTrendFilter('6m')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${trendFilter === '6m' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Last 6 Months
                </button>
              </div>
            </div>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.trendsData}>
                  <defs>
                    <linearGradient id="colorBidders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="bidders" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorBidders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">Recent Activity</h3>
              <div className="space-y-6">
                {activities.length > 0 ? activities.map((activity, idx) => {
                  const getActivityIcon = (type) => {
                    switch(type) {
                      case 'UPLOAD': return <Clock className="text-blue-500" size={18} />;
                      case 'AI_EXTRACTION': return <ShieldCheck className="text-purple-500" size={18} />;
                      case 'EVALUATION_START': return <TrendingUp className="text-orange-500" size={18} />;
                      case 'EVALUATION_COMPLETE': return <ShieldCheck className="text-emerald-500" size={18} />;
                      case 'TENDER_CREATE': return <FileText className="text-slate-500" size={18} />;
                      default: return <FileText className="text-slate-400" size={18} />;
                    }
                  };

                  return (
                    <div key={idx} className="flex items-start space-x-4 p-4 hover:bg-slate-50 rounded-[1.5rem] transition-all border border-transparent hover:border-slate-100">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[13px] font-bold text-slate-800 truncate pr-4">{activity.message || `Activity on ${activity.tenderId}`}</p>
                          <span className="text-[9px] font-black text-slate-400 uppercase whitespace-nowrap">{moment(activity.timestamp).fromNow()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            activity.type === 'AI_EXTRACTION' ? 'bg-purple-50 text-purple-600' :
                            activity.type === 'UPLOAD' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                          {activity.tenderId && (
                            <span className="text-[9px] font-bold text-slate-400">ID: {activity.tenderId}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                    <ActivityIcon className="mx-auto text-slate-300 mb-4" size={40} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent activities found</p>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Actions will appear here as they happen</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights & Alerts */}
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8">AI Insights & Alerts</h3>
              <div className="space-y-4">
                <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-start space-x-4">
                  <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-rose-900 mb-1">Price Anomaly Detected</h4>
                    <p className="text-[11px] text-rose-700 font-medium mb-3">TND-2026-015: Bidder C quoted 45% below market average</p>
                    <div className="inline-flex px-2 py-0.5 bg-white/50 border border-rose-200 rounded text-[9px] font-black text-rose-600 uppercase">
                      High Confidence: 94%
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-6 flex items-start space-x-4">
                  <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100 shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-orange-900 mb-1">Document Verification Required</h4>
                    <p className="text-[11px] text-orange-700 font-medium mb-3">TND-2026-008: 3 bidders missing compliance certificates</p>
                    <div className="inline-flex px-2 py-0.5 bg-white/50 border border-orange-200 rounded text-[9px] font-black text-orange-600 uppercase">
                      Medium Priority
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Users, FileText, MessageSquare, LogOut, 
  Trash2, Ban, CheckCircle, Search, Activity, Menu, X, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion'; // For smooth mobile transitions
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state
  
  const [stats, setStats] = useState({ 
    total_users: 0, admins: 0, students: 0,
    total_resources: 0, 
    questions: 0, answers: 0 
  });
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) { navigate('/dashboard'); }
  }, [user, navigate]);

  useEffect(() => {
    fetchStats();
    fetchData();
    setIsSidebarOpen(false); // Close sidebar when switching tabs on mobile
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const res = await api.get(`/admin/stats?user_id=${user.id}`);
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'users') res = await api.get('/admin/users');
      else if (activeTab === 'resources') res = await api.get('/resource/list');
      else if (activeTab === 'forum') res = await api.get('/forum/list');
      setDataList(res?.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // --- CHART DATA ---
  const userPieData = [
    { name: 'Admins', value: stats.admins, color: '#ef4444' },
    { name: 'Students', value: stats.students, color: '#3b82f6' }
  ];

  const forumBarData = [
    { name: 'Questions', count: stats.questions },
    { name: 'Answers', count: stats.answers }
  ];

  const uploadsData = [
    { name: 'Prev', files: Math.floor(stats.total_resources * 0.7) },
    { name: 'Now', files: stats.total_resources }
  ];

  // --- ACTIONS ---
  const handleUserAction = async (targetId, action) => {
    if (!window.confirm(`Confirm: ${action} user?`)) return;
    try {
      await api.post('/admin/users/action', { target_id: targetId, action });
      toast.success(`User ${action}ed`);
      fetchData();
    } catch (err) { toast.error("Action failed"); }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("Permanently delete?")) return;
    try {
      const endpoint = type === 'resource' ? `/admin/resource/${id}` : `/admin/forum/question/${id}`;
      await api.delete(endpoint);
      toast.success("Deleted");
      fetchData();
    } catch (err) { toast.error("Delete failed"); }
  };

  const StatCard = ({ title, count, icon: Icon, color, delay }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-lg transition-all group"
    >
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-800">{count}</h3>
        </div>
        <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${color}`}>
          <Icon size={24} />
        </div>
    </motion.div>
  );

  const NavButton = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
        activeTab === id 
        ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20}/> {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-right" />

      {/* --- MOBILE OVERLAY --- */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[50px] w-72 bg-slate-950 text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
         <div className="p-8 flex items-center justify-between border-b border-slate-900">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/50">
                    <Shield size={22} fill="currentColor"/>
                </div>
                <div>
                   <h1 className="font-black text-lg tracking-tighter">ADMIN</h1>
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">Command Center</p>
                </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
                <X size={24} />
            </button>
         </div>

         <nav className="flex-1 p-6 space-y-3 mt-4">
            <NavButton id="overview" icon={Activity} label="System Overview" />
            <NavButton id="users" icon={Users} label="User Directory" />
            <NavButton id="resources" icon={FileText} label="Content Vault" />
            <NavButton id="forum" icon={MessageSquare} label="Forum Audit" />
         </nav>

         <div className="p-6 border-t border-slate-900">
             <button 
                onClick={() => { localStorage.clear(); navigate('/'); }} 
                className="flex items-center gap-3 text-slate-500 hover:text-white px-4 py-3 transition-colors w-full font-bold text-sm"
             >
                <LogOut size={18} /> Exit Console
             </button>
         </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
         
         {/* HEADER */}
         <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 bg-slate-100 rounded-xl text-slate-600"
                >
                    <Menu size={20} />
                </button>
                <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize">
                    {activeTab === 'overview' ? 'Real-time Analytics' : `Manage ${activeTab}`}
                </h2>
            </div>

            <div className="flex items-center gap-3 bg-slate-100 p-1.5 pl-4 rounded-2xl border border-slate-200">
                <span className="hidden sm:inline text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Admin</span>
                <div className="bg-white text-red-600 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm border border-slate-200">
                   {user?.username || 'Root'}
                </div>
            </div>
         </header>

         <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <StatCard title="Global Users" count={stats.total_users} icon={Users} color="bg-blue-50 text-blue-600" delay={0.1} />
                        <StatCard title="File Repository" count={stats.total_resources} icon={FileText} color="bg-purple-50 text-purple-600" delay={0.2} />
                        <StatCard title="Forum Pulse" count={stats.questions + stats.answers} icon={MessageSquare} color="bg-orange-50 text-orange-600" delay={0.3} />
                    </div>

                    {/* CHARTS */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* CHART 1: PIE */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-800 mb-6 text-sm flex items-center gap-2 uppercase tracking-widest"><Users size={16} className="text-blue-500"/> User Types</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={userPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8} dataKey="value">
                                            {userPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* CHART 2: BAR */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm lg:col-span-2">
                            <h3 className="font-black text-slate-800 mb-6 text-sm flex items-center gap-2 uppercase tracking-widest"><MessageSquare size={16} className="text-orange-500"/> Forum engagement</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={forumBarData} barGap={12}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={40}>
                                            {forumBarData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#f97316' : '#22c55e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DATA TABLES (Active for other tabs) */}
            {activeTab !== 'overview' && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-20 text-center flex flex-col items-center gap-4">
                                <Activity className="animate-spin text-red-600" />
                                <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Synchronizing Data...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-black tracking-[0.2em]">
                                        <th className="p-6">Registry ID</th>
                                        <th className="p-6">Identity Details</th>
                                        <th className="p-6">Current Status</th>
                                        <th className="p-6 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {dataList.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="p-6 font-mono text-xs text-slate-400">#{item.id}</td>
                                            <td className="p-6">
                                                {activeTab === 'users' && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs">
                                                            {item.username[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm leading-none mb-1">{item.username}</p>
                                                            <p className="text-xs text-slate-400 font-medium">{item.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {activeTab === 'resources' && (
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm mb-1 leading-none">{item.title}</p>
                                                        <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{item.course}</p>
                                                    </div>
                                                )}
                                                {activeTab === 'forum' && (
                                                    <div>
                                                        <p className="font-bold text-slate-800 text-sm mb-1 leading-none">{item.title}</p>
                                                        <p className="text-xs text-slate-400">By <span className="font-bold text-slate-600">{item.author}</span></p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                {activeTab === 'users' ? (
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                                        item.is_blocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                                    }`}>
                                                        {item.is_blocked ? 'Flagged/Blocked' : 'Active'}
                                                    </span>
                                                ) : (
                                                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Verified</span>
                                                )}
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {activeTab === 'users' && !item.is_admin && (
                                                        <button 
                                                            onClick={() => handleUserAction(item.id, item.is_blocked ? 'unblock' : 'block')}
                                                            title={item.is_blocked ? "Unblock" : "Block"}
                                                            className={`p-2.5 rounded-xl transition-all ${
                                                                item.is_blocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'
                                                            }`}
                                                        >
                                                            {item.is_blocked ? <CheckCircle size={18}/> : <Ban size={18}/>}
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => activeTab === 'users' ? handleUserAction(item.id, 'delete') : handleDelete(item.id, activeTab === 'forum' ? 'question' : 'resource')} 
                                                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </motion.div>
            )}
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;